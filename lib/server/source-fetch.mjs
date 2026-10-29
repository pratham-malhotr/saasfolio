import https from "node:https";
import { lookup } from "node:dns/promises";
import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { isIP } from "node:net";
import { normalizePublicHttpsUrl } from "../public-url.mjs";
import { plainText, robotsAllows } from "../../scripts/lib/offer-sources.mjs";

export class SourceCheckError extends Error {
  constructor(outcome, message) { super(message); this.name = "SourceCheckError"; this.outcome = outcome; }
}
export function publicResolvedAddresses(addresses) {
  return addresses.length > 0 && addresses.every(({ address, family }) => {
    if (isIP(address) !== family) return false;
    if (family === 4) {
      const [a, b, c] = address.split(".").map(Number);
      return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 0 && [0, 2].includes(c) || b === 168 || b === 88 && c === 99) || a === 198 && (b === 18 || b === 19 || b === 51 && c === 100) || a === 203 && b === 0 && c === 113);
    }
    // Only global-unicast IPv6. Deny special transition, benchmarking and
    // documentation prefixes as well as mapped IPv4, ULA and link-local.
    const [first, second = "0"] = address.toLowerCase().split(":");
    const a = parseInt(first, 16), b = parseInt(second || "0", 16);
    return a >= 0x2000 && a <= 0x3fff && a !== 0x2002 && !(a === 0x2001 && (b < 0x200 || b === 0xdb8)) && !(a === 0x3fff && b < 0x1000);
  });
}
export async function pinnedPublicPage(input, { signal = AbortSignal.timeout(12000), lookupImpl = lookup, requestImpl = https.request } = {}) {
  let current = normalizePublicHttpsUrl(input);
  if (!current) throw new SourceCheckError("unavailable", "Use a public HTTPS source without credentials or private addresses.");
  const originHost = new URL(current).hostname.replace(/^www\./, "");
  for (let hop = 0; hop < 4; hop++) {
    signal.throwIfAborted();
    const parsed = new URL(current);
    if (parsed.port && parsed.port !== "443") throw new SourceCheckError("unavailable", "Automated source checks support the standard HTTPS port only.");
    let abortLookup;
    const timeout = new Promise((_, reject) => { abortLookup = () => reject(new SourceCheckError("unavailable", "The source timed out.")); signal.addEventListener("abort", abortLookup, { once: true }); });
    let addresses;
    try { addresses = await Promise.race([lookupImpl(parsed.hostname, { all: true, verbatim: true }), timeout]); }
    finally { signal.removeEventListener("abort", abortLookup); }
    if (!publicResolvedAddresses(addresses)) throw new SourceCheckError("unavailable", "The source resolves to an unsupported network address.");
    const selected = addresses[0];
    const response = await new Promise((resolve, reject) => {
      const request = requestImpl({ protocol: "https:", hostname: parsed.hostname, port: 443, servername: parsed.hostname,
        path: parsed.pathname + parsed.search, method: "GET", signal, family: selected.family, autoSelectFamily: false,
        lookup: (_hostname, options, done) => options.all ? done(null, [selected]) : done(null, selected.address, selected.family),
        headers: { "User-Agent": "SaaSFolioBot/1.0 (+https://saasfolio.tech/about)", Accept: "text/html,application/xhtml+xml,text/plain" } }, response => {
        const status = response.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(status)) { response.resume(); resolve({ status, location: response.headers.location }); return; }
        if (status !== 200) { response.resume(); resolve({ status }); return; }
        if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(response.headers["content-type"] || "")) { response.resume(); reject(new SourceCheckError("unavailable", "The source is not a public text page.")); return; }
        let bytes = 0; const chunks = [];
        response.on("data", chunk => { bytes += chunk.length; if (bytes > 3000000) request.destroy(new SourceCheckError("unavailable", "The source exceeds the response limit.")); else chunks.push(chunk); });
        response.once("error", reject);
        response.once("end", () => resolve({ status, html: Buffer.concat(chunks).toString("utf8") }));
      });
      request.once("error", reject); request.end();
    });
    if (response.location) {
      const next = normalizePublicHttpsUrl(new URL(response.location, current).href);
      if (!next || new URL(next).hostname.replace(/^www\./, "") !== originHost) throw new SourceCheckError("unavailable", "The source redirected outside its reviewed host.");
      current = next; continue;
    }
    return { ...response, url: current };
  }
  throw new SourceCheckError("unavailable", "The source redirected too many times.");
}

export async function checkOfferSource(payload, officialWebsite, { getPage = pinnedPublicPage } = {}) {
  const host = value => new URL(value).hostname.replace(/^www\./, "");
  const vendor = host(officialWebsite);
  const belongs = value => host(value) === vendor || host(value).endsWith(`.${vendor}`);
  if (!belongs(payload.destinationUrl) || payload.sourceKind === "vendor" && !belongs(payload.sourceUrl)) throw new SourceCheckError("evidence_changed", "Match the provider destination and official-source label to the brand's reviewed website.");
  const signal = AbortSignal.timeout(12000);
  const source = new URL(payload.sourceUrl);
  const robots = await getPage(`${source.origin}/robots.txt`, { signal });
  if (robots.status !== 200 && ![404, 410].includes(robots.status)) throw new SourceCheckError([401, 403, 429].includes(robots.status) ? "blocked" : "unavailable", "The source's crawl policy could not be read.");
  if (robots.status === 200 && !robotsAllows(robots.html, source.pathname + source.search)) throw new SourceCheckError("blocked", "The source disallows this automated request.");
  await delay(1000, undefined, { signal });
  const page = await getPage(payload.sourceUrl, { signal });
  if (page.status !== 200) throw new SourceCheckError([401, 403, 429].includes(page.status) ? "blocked" : "unavailable", "The source could not be read. No evidence has been refreshed.");
  if (/just a moment|verify you are human|cf-chl-|captcha challenge/i.test(page.html)) throw new SourceCheckError("blocked", "The source returned a browser challenge.");
  const text = plainText(page.html);
  if (text.length < 100) throw new SourceCheckError("unavailable", "The source does not expose enough readable content.");
  if (!payload.evidence.every(fragment => text.toLowerCase().includes(fragment.toLowerCase())) || payload.code && !text.includes(payload.code)) throw new SourceCheckError("evidence_changed", "The exact evidence or public code was not found in the current source.");
  return { outcome: "ok", sourceUrl: page.url, contentHash: createHash("sha256").update(text).digest("hex") };
}
