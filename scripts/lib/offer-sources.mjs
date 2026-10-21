import { createHash } from "node:crypto";
import { retryAfterSeconds } from "./source-backoff.mjs";

export const MAX_AGE_DAYS = 14;
export const hash = (text) => createHash("sha256").update(text).digest("hex");
export function plainText(html) {
  return html.replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();
}
export function safePublicUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      !url.hostname.includes(".") || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) ||
      /\.(local|internal|test)$/.test(url.hostname)) return false;
    return true;
  } catch { return false; }
}
export function domainMatches(url, website) {
  const host = (value) => new URL(value).hostname.replace(/^www\./, "");
  return host(url) === host(website) || host(url).endsWith(`.${host(website)}`);
}

// Only extract visible evidence. Scripts, hidden API payloads, unrelated coupon
// sites and percentage banners never become automatically published discounts.
export function discoverVendorOffer(text) {
  const patterns = [
    { type: "free_trial", re: /\b(?:start|try|begin|get|claim)\s+(?:your\s+|a\s+|our\s+)?(?:free\s+)?(?:\d+[- ]day\s+)?free\s+trial\b/i },
    { type: "free_trial", re: /\b(?:try|start|get)\s+(?:it\s+|your\s+|a\s+)?(?:free\s+for\s+\d+\s+days|\d+[- ]day\s+(?:free\s+)?trial)\b/i },
    { type: "free_plan", re: /\b(?:free\s+(?:forever\s+)?plan|free\s+forever|forever\s+free)\b/i },
  ];
  for (const { type, re } of patterns) {
    for (const match of text.matchAll(new RegExp(re.source, "gi"))) {
      const before = text.slice(Math.max(0, match.index - 75), match.index);
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + 100);
      if (/\b(?:no|not|never|without|discontinued|previously)\b[^.!?]{0,50}$/i.test(before) ||
        /^\s*(?:is\s+not|isn't|was\s+discontinued|\?\s*No\b)/i.test(after)) continue;
      return { type, evidence: text.slice(Math.max(0, match.index - 70), match.index + match[0].length + 150) };
    }
  }
  return null;
}

export function extractCouponCandidates(html, sourceUrl, toolSlug) {
  const candidates = [];
  // Only explicit structured promotion codes, never guess a code from a title.
  for (const [, json] of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let root;
    try { root = JSON.parse(json); } catch { continue; }
    const visit = (item) => {
      if (!item || typeof item !== "object") return;
      if (Array.isArray(item)) { item.forEach(visit); return; }
      const code = item.discountCode || item.promoCode || item.couponCode;
      if (typeof code === "string" && /^[A-Za-z0-9_-]{3,48}$/.test(code)) {
        candidates.push({ toolSlug, code, sourceUrl, title: String(item.name || "Reported coupon").slice(0, 180),
          expiresAt: item.validThrough || item.priceValidUntil || null, status: "needs-review", checkoutTested: false });
      }
      Object.values(item).forEach(visit);
    };
    visit(root);
  }
  return candidates;
}

export function robotsAllows(body, path, agent = "SaaSFolioBot") {
  const groups = [];
  let group;
  for (const line of body.split(/\r?\n/)) {
    const [key, ...rest] = line.replace(/#.*/, "").trim().split(":");
    const value = rest.join(":").trim();
    if (key?.toLowerCase() === "user-agent") {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if (group && /^(allow|disallow)$/i.test(key) && value) group.rules.push({ allow: key.toLowerCase() === "allow", path: value });
  }
  const specific = groups.filter(g => g.agents.some(a => a !== "*" && agent.toLowerCase().includes(a)));
  const relevant = specific.length ? specific : groups.filter(g => g.agents.includes("*"));
  const matching = relevant.flatMap(g => g.rules).filter(rule => {
    const pattern = rule.path.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${pattern}`).test(path);
  }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matching[0]?.allow ?? true;
}

export async function fetchPublicPage(url, { fetchImpl = fetch, etag, lastModified, allowedHosts } = {}) {
  if (!safePublicUrl(url)) throw new Error("Only public HTTPS source URLs are allowed");
  const hosts = allowedHosts || [new URL(url).hostname];
  let current = url;
  const headers = { "User-Agent": "SaaSFolioBot/1.0 (+https://saasfolio.tech/about)", Accept: "text/html,application/xhtml+xml,text/plain" };
  if (etag) headers["If-None-Match"] = etag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetchImpl(current, { headers, redirect: "manual", signal: AbortSignal.timeout(18000) });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const next = new URL(res.headers.get("location"), current);
      if (!safePublicUrl(next.href) || !hosts.some(h => next.hostname.replace(/^www\./, "") === h.replace(/^www\./, ""))) throw new Error("Source redirected outside its allowed hosts");
      current = next.href;
      continue;
    }
    if (res.status === 304) return { unchanged: true, url: current };
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      error.retryAfterSeconds = retryAfterSeconds(res.headers.get("retry-after"));
      throw error;
    }
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(res.headers.get("content-type") || "")) throw new Error("Unsupported content type");
    let html = "";
    const reader = res.body.getReader(), decoder = new TextDecoder();
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 3_000_000) { await reader.cancel(); throw new Error("Source exceeds 3 MB limit"); }
      html += decoder.decode(value, { stream: true });
    }
    html += decoder.decode();
    if (/just a moment|verify you are human|checking your browser/i.test(html.slice(0, 6000))) throw new Error("Source requires browser verification");
    return { html, url: current, etag: res.headers.get("etag"), lastModified: res.headers.get("last-modified") };
  }
  throw new Error("Too many redirects");
}
