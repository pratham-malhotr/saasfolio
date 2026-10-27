import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { parse } from "parse5";

// Public GETs only. Redirects are inspected manually; external offers are never followed.
// node scripts/audit-indexing.mjs http://127.0.0.1:3214 --urls gsc.csv --json /tmp/indexing.json
const DEFAULT_CANONICAL_ORIGIN = "https://saasfolio.tech";
const UTILITY_PATH = /^\/(?:api|admin|profile|login|signup|submit|u|go|auth|newsletter|reset-password)(?:\/|$)/;
// These GET endpoints can exchange credentials or change subscription state.
const SENSITIVE_PATH = /^\/(?:api|auth|newsletter)(?:\/|$)/;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const issue = (code, detail, severity = "error") => ({ code, detail, severity });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function originOnly(value, label) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${label} must be an HTTP(S) origin without credentials, a path, or a query`);
  }
  return url.origin;
}

export function parseArguments(args) {
  const options = { origin: "http://127.0.0.1:3214", canonicalOrigin: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CANONICAL_ORIGIN, concurrency: 2, delay: 100, timeout: 30000, userAgent: "SaaSFolioIndexingAudit/1.0", urls: null, urlsOnly: false, json: null, failuresCsv: null };
  let positional = false;
  const names = { "canonical-origin": "canonicalOrigin", concurrency: "concurrency", delay: "delay", timeout: "timeout", "user-agent": "userAgent", urls: "urls", json: "json", output: "json", "failures-csv": "failuresCsv" };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (!arg.startsWith("--")) {
      if (positional) throw new Error(`Unexpected argument: ${arg}`);
      options.origin = arg;
      positional = true;
      continue;
    }
    const [flag, ...rest] = arg.slice(2).split("=");
    if (flag === "urls-only" && !rest.length) { options.urlsOnly = true; continue; }
    const name = names[flag];
    if (!name) throw new Error(`Unknown option: --${flag}`);
    const value = rest.length ? rest.join("=") : args[++index];
    if (value === undefined || value.startsWith("--") || !value.length) throw new Error(`--${flag} needs a value`);
    options[name] = value;
  }
  options.origin = originOnly(options.origin, "Origin");
  options.canonicalOrigin = originOnly(options.canonicalOrigin, "Canonical origin");
  if (options.urlsOnly && !options.urls) throw new Error("--urls-only requires --urls filepath");
  for (const [name, minimum, maximum] of [["concurrency", 1, 10], ["delay", 0, 60000], ["timeout", 100, 120000]]) {
    options[name] = Number(options[name]);
    if (!Number.isInteger(options[name]) || options[name] < minimum || options[name] > maximum) throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return options;
}

function decodeXml(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
    const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
    if (named[entity]) return named[entity];
    const point = entity.toLowerCase().startsWith("#x") ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
    return Number.isInteger(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
  }).trim();
}

export function parseSitemap(xml) {
  const issues = [];
  const clean = xml.replace(/^\uFEFF/, "").replace(/<\?xml[^?]*\?>/g, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  const root = clean.match(/^<(urlset|sitemapindex)\b([^>]*)>([\s\S]*)<\/\1>\s*$/);
  if (!root) return { kind: null, entries: [], issues: [issue("invalid_sitemap_xml", "Expected a complete urlset or sitemapindex XML document")] };
  if (!/\bxmlns\s*=\s*["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/.test(root[2])) issues.push(issue("sitemap_namespace", "Missing standard sitemap namespace"));
  if (/<!DOCTYPE|<!ENTITY/i.test(clean)) issues.push(issue("unsupported_xml_declaration", "DTD/entity declarations are not accepted"));
  const item = root[1] === "urlset" ? "url" : "sitemap";
  const entries = [];
  const matcher = new RegExp(`<${item}\\b[^>]*>([\\s\\S]*?)<\\/${item}>`, "g");
  let remaining = root[3];
  for (const [block, body] of root[3].matchAll(matcher)) {
    remaining = remaining.replace(block, "");
    const locations = [...body.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/g)];
    if (locations.length !== 1) {
      issues.push(issue("invalid_sitemap_entry", `Each ${item} requires exactly one loc; found ${locations.length}`));
      continue;
    }
    const raw = locations[0][1];
    if (/<(?!\!\[CDATA\[)/.test(raw) || /&(?!(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);)/i.test(raw.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ""))) {
      issues.push(issue("invalid_sitemap_loc_xml", "A loc contains unescaped XML markup or entities"));
      continue;
    }
    const date = body.match(/<lastmod\b[^>]*>([^<]*)<\/lastmod>/)?.[1];
    entries.push({ loc: decodeXml(raw), lastmod: date ? decodeXml(date) : null });
  }
  if (remaining.trim()) issues.push(issue("invalid_sitemap_structure", "Unexpected or incomplete elements outside sitemap entries"));
  if (!entries.length) issues.push(issue("empty_sitemap", "The sitemap contains no usable locations"));
  return { kind: root[1], entries, issues };
}

// RFC-style quoted CSV fields, including commas and newlines. Plain one-URL-per-line files also work.
export function parseUrlInput(input) {
  const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length && lines.every(line => /^(?:https?:\/\/|\/(?!\/))\S+$/i.test(line))) return [...new Set(lines)];
  const rows = [];
  let row = [], field = "", quoted = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index++; }
      else if (quoted || field.length === 0) quoted = !quoted;
      else field += char;
    } else if ((char === "," || char === "\t") && !quoted) { row.push(field.trim()); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = "";
      if (char === "\r" && text[index + 1] === "\n") index++;
    } else field += char;
  }
  if (quoted) throw new Error("URL input has an unclosed quoted CSV field");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  const values = rows.flatMap(fields => fields.filter(value => /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)));
  return [...new Set(values)];
}

export function inspectHtml(html) {
  const canonicals = [], robots = [];
  let title = "";
  function visit(node, inHead = false) {
    const head = inHead || node.tagName === "head";
    const attrs = Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]));
    if (node.tagName === "link" && head && attrs.rel?.toLowerCase().split(/\s+/).includes("canonical")) canonicals.push(attrs.href || "");
    if (node.tagName === "meta" && ["robots", "googlebot"].includes(attrs.name?.toLowerCase())) robots.push({ agent: attrs.name.toLowerCase(), content: attrs.content || "" });
    if (node.tagName === "title" && head) title = (node.childNodes || []).map(child => child.value || "").join("");
    for (const child of node.childNodes || []) visit(child, head);
  }
  visit(parse(html));
  return { canonicals, robots, title, noindex: robots.some(tag => /\b(?:noindex|none)\b/i.test(tag.content)) };
}

function robotsRules(text) {
  const groups = [], sitemaps = [];
  let agents = [], rules = [], rulesStarted = false;
  function flush() { if (agents.length) groups.push({ agents, rules }); agents = []; rules = []; rulesStarted = false; }
  for (const line of text.split(/\r?\n/)) {
    const match = line.replace(/#.*$/, "").match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const [, rawName, value] = match, name = rawName.toLowerCase();
    if (name === "sitemap") { sitemaps.push(value); continue; }
    if (name === "user-agent") { if (rulesStarted) flush(); agents.push(value.toLowerCase()); }
    else if (["allow", "disallow"].includes(name) && agents.length) { rulesStarted = true; if (value) rules.push({ allow: name === "allow", pattern: value }); }
  }
  flush();
  const matching = groups.map(group => ({ ...group, specificity: Math.max(-1, ...group.agents.map(agent => agent === "*" ? 0 : "googlebot".includes(agent) ? agent.length : -1)) })).filter(group => group.specificity >= 0);
  const max = Math.max(-1, ...matching.map(group => group.specificity));
  return { sitemaps, rules: matching.filter(group => group.specificity === max).flatMap(group => group.rules) };
}

function blockedByRobots(path, rules) {
  const matches = rules.filter(rule => {
    const expression = rule.pattern.split("*").map(part => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*").replace(/\\\$$/, "$");
    return new RegExp(`^${expression}`).test(path);
  }).sort((a, b) => b.pattern.replace(/\*/g, "").length - a.pattern.replace(/\*/g, "").length || Number(b.allow) - Number(a.allow));
  return matches.length > 0 && !matches[0].allow;
}

function statusClass(status) {
  if (status === null) return "network";
  if (status === 404) return "404";
  if (status === 403) return "403";
  if (status === 429) return "429";
  if (status >= 400 && status < 500) return "other4xx";
  if (status >= 500) return "5xx";
  if (status >= 300 && status < 400) return "redirect";
  if (status === 200) return "200";
  return "other";
}

function normalizedAbsoluteUrl(value) {
  try { return new URL(value).href; } catch { return value; }
}

function recommendation(result) {
  if (result.expectedPrivate) return "Keep this utility URL out of sitemaps; use noindex or appropriate access status. Do not redirect it to the homepage.";
  if (["403", "429"].includes(result.classification)) return "Check hosting/WAF/rate-limit logs for this public URL and crawler access; the response alone does not identify the rule.";
  if (["5xx", "network"].includes(result.classification)) return "Check the deployment and server logs, then repeat this GET after the underlying failure is resolved.";
  if (["404", "other4xx"].includes(result.classification)) return "Check the original page and backlinks. Redirect only when a known equivalent exists; otherwise retain an honest 404/410 and remove internal/sitemap references.";
  if (result.classification === "redirect") return "Use the final canonical URL in sitemaps and internal links; retain a redirect only when the destination is a relevant replacement.";
  if (result.issues.some(item => /canonical|noindex|robots/.test(item.code))) return "Align canonical, indexing directives, robots access, and sitemap membership with the intended public page.";
  return null;
}

export async function auditIndexing(options, dependencies = {}) {
  const fetcher = dependencies.fetch || fetch;
  const canonicalOrigin = originOnly(options.canonicalOrigin, "Canonical origin");
  const origin = originOnly(options.origin, "Origin");
  const trusted = new Set([origin, canonicalOrigin]);
  const documents = [], pages = [], skipped = [], findings = [];
  const sitemapPages = new Map();
  let nextRequest = 0;
  function mapUrl(url) { return new URL(`${url.pathname}${url.search}`, origin).href; }
  async function request(url) {
    const delay = Math.max(0, nextRequest - Date.now());
    nextRequest = Math.max(Date.now(), nextRequest) + options.delay;
    if (delay) await sleep(delay);
    try {
      const response = await fetcher(url, { method: "GET", redirect: "manual", headers: { "User-Agent": options.userAgent, Accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.1" }, signal: AbortSignal.timeout(options.timeout) });
      const text = await response.text();
      return { status: response.status, text, contentType: response.headers.get("content-type") || "", location: response.headers.get("location"), xRobotsTag: response.headers.get("x-robots-tag") || "", retryAfter: response.headers.get("retry-after"), error: null };
    } catch (error) {
      return { status: null, text: "", contentType: "", location: null, xRobotsTag: "", error: `${error.name || "Error"}: ${error.message || String(error)}` };
    }
  }
  const robotsResponse = await request(`${origin}/robots.txt`);
  const robots = robotsRules(robotsResponse.text);
  const robotsRecord = { kind: "robots", url: `${canonicalOrigin}/robots.txt`, requestedUrl: `${origin}/robots.txt`, status: robotsResponse.status, classification: statusClass(robotsResponse.status), issues: [] };
  if (robotsResponse.status !== 200) robotsRecord.issues.push(issue("robots_http_status", robotsResponse.error || `robots.txt returned ${robotsResponse.status}`));
  else {
    if (!/^text\/plain\b/i.test(robotsResponse.contentType)) robotsRecord.issues.push(issue("robots_content_type", `Expected text/plain; received ${robotsResponse.contentType || "no Content-Type"}`));
    if (!robots.sitemaps.includes(`${canonicalOrigin}/sitemap.xml`)) robotsRecord.issues.push(issue("robots_sitemap_missing", `robots.txt does not advertise ${canonicalOrigin}/sitemap.xml`));
  }
  documents.push(robotsRecord);
  const queue = [`${canonicalOrigin}/sitemap.xml`], visited = new Set();
  while (queue.length) {
    const url = queue.shift();
    if (visited.has(url)) { findings.push(issue("duplicate_sitemap_reference", url)); continue; }
    if (visited.size >= 25) { findings.push(issue("sitemap_limit", "Stopped after 25 sitemap documents")); break; }
    visited.add(url);
    const target = new URL(url), response = await request(mapUrl(target));
    const record = { kind: "sitemap", url, requestedUrl: mapUrl(target), status: response.status, classification: statusClass(response.status), issues: [] };
    documents.push(record);
    if (response.status !== 200) { record.issues.push(issue("sitemap_http_status", response.error || `Sitemap returned ${response.status}${response.location ? `; Location: ${response.location}` : ""}`)); continue; }
    if (!/(?:application|text)\/(?:[\w.+-]*\+)?xml\b/i.test(response.contentType)) record.issues.push(issue("sitemap_content_type", `Expected XML; received ${response.contentType || "no Content-Type"}`));
    const parsed = parseSitemap(response.text);
    record.issues.push(...parsed.issues);
    record.entryCount = parsed.entries.length;
    for (const entry of parsed.entries) {
      let location;
      try { location = new URL(entry.loc); } catch { record.issues.push(issue("invalid_sitemap_url", entry.loc)); continue; }
      if (location.origin !== canonicalOrigin || location.username || location.password || !/^https?:$/.test(location.protocol)) { record.issues.push(issue("sitemap_origin", `Location must use ${canonicalOrigin}: ${entry.loc}`)); continue; }
      if (location.hash) record.issues.push(issue("sitemap_fragment", entry.loc));
      if (parsed.kind === "sitemapindex") {
        if (UTILITY_PATH.test(location.pathname)) record.issues.push(issue("utility_sitemap_document", `Utility endpoint is not fetched as a sitemap: ${location.href}`));
        else queue.push(location.href);
        continue;
      }
      if (entry.lastmod && (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(entry.lastmod) || Number.isNaN(Date.parse(entry.lastmod)) || Date.parse(entry.lastmod) > Date.now())) record.issues.push(issue("sitemap_lastmod", `Invalid or future lastmod for ${entry.loc}: ${entry.lastmod}`));
      if (sitemapPages.has(location.href)) { record.issues.push(issue("duplicate_sitemap_url", location.href)); continue; }
      sitemapPages.set(location.href, { url: location.href, sources: ["sitemap"], issues: [] });
      if (UTILITY_PATH.test(location.pathname)) sitemapPages.get(location.href).issues.push(issue("utility_in_sitemap", location.href));
    }
  }
  const jobs = options.urlsOnly ? new Map() : new Map(sitemapPages);
  for (const value of options.importedUrls || []) {
    let url;
    try { url = new URL(value, canonicalOrigin); } catch { skipped.push({ url: value, reason: "invalid_url" }); continue; }
    if (!trusted.has(url.origin) || url.username || url.password || !/^https?:$/.test(url.protocol)) { skipped.push({ url: value, reason: "external_or_unsafe_url" }); continue; }
    url = new URL(`${url.pathname}${url.search}`, canonicalOrigin);
    if (jobs.has(url.href)) jobs.get(url.href).sources.push("import");
    else {
      const sitemapEntry = sitemapPages.get(url.href);
      jobs.set(url.href, { url: url.href, sources: sitemapEntry ? ["sitemap", "import"] : ["import"], issues: [...(sitemapEntry?.issues || [])] });
    }
  }
  const list = [...jobs.values()];
  let cursor = 0;
  async function auditPage(job) {
    const initialUrl = new URL(job.url), expectedPrivate = UTILITY_PATH.test(initialUrl.pathname);
    const result = { ...job, requestedUrl: mapUrl(initialUrl), inSitemap: job.sources.includes("sitemap"), expectedPrivate, status: null, classification: null, finalStatus: null, finalUrl: job.url, redirects: [], canonical: [], noindex: false, issues: [...job.issues] };
    if (SENSITIVE_PATH.test(initialUrl.pathname)) {
      result.classification = "skipped_private";
      result.issues.push(issue("private_endpoint_not_requested", "API/authentication/subscription endpoints are excluded from public GET auditing", "info"));
      result.recommendation = recommendation(result);
      return result;
    }
    let currentUrl = initialUrl, response;
    const seen = new Set();
    for (let hop = 0; hop <= 5; hop++) {
      if (seen.has(currentUrl.href)) { result.issues.push(issue("redirect_loop", currentUrl.href)); break; }
      seen.add(currentUrl.href);
      response = await request(mapUrl(currentUrl));
      if (hop === 0) { result.status = response.status; result.classification = statusClass(response.status); result.retryAfter = response.retryAfter || null; }
      result.finalStatus = response.status;
      result.finalUrl = currentUrl.href;
      if (!REDIRECT_STATUSES.has(response.status)) break;
      if (!response.location) { result.issues.push(issue("redirect_without_location", `HTTP ${response.status} has no Location`)); break; }
      if (/,\s+(?:https?:\/\/|\/)/i.test(response.location)) {
        result.issues.push(issue("ambiguous_redirect_location", `Location appears to contain multiple header values: ${response.location}`));
        break;
      }
      let destination;
      try { destination = new URL(response.location, currentUrl); } catch { result.issues.push(issue("invalid_redirect_location", response.location)); break; }
      const internal = trusted.has(destination.origin) && !destination.username && !destination.password && /^https?:$/.test(destination.protocol);
      result.redirects.push({ status: response.status, from: currentUrl.href, to: destination.href, followed: false });
      if (result.inSitemap) { result.issues.push(issue("sitemap_redirect", `Sitemap URL redirects to ${destination.href}`)); break; }
      if (!internal) { result.issues.push(issue("external_redirect_not_followed", destination.href, expectedPrivate ? "info" : "warning")); break; }
      if (SENSITIVE_PATH.test(destination.pathname)) { result.issues.push(issue("private_redirect_not_followed", destination.pathname, expectedPrivate ? "info" : "warning")); break; }
      if (hop === 5) { result.issues.push(issue("redirect_limit", "More than five internal redirects")); break; }
      result.redirects.at(-1).followed = true;
      currentUrl = new URL(`${destination.pathname}${destination.search}`, canonicalOrigin);
    }
    if (response?.error) result.issues.push(issue("network_error", response.error));
    else if (response && response.status >= 400) result.issues.push(issue("http_status", `HTTP ${response.status}`, expectedPrivate && response.status < 500 ? "info" : "error"));
    else if (response && response.status !== 200 && !REDIRECT_STATUSES.has(response.status)) result.issues.push(issue("unexpected_http_status", `HTTP ${response.status}`));
    if (response?.status === 200) {
      const html = inspectHtml(response.text);
      result.canonical = html.canonicals;
      result.noindex = html.noindex || /\b(?:noindex|none)\b/i.test(response.xRobotsTag);
      result.title = html.title;
      if (!expectedPrivate) {
        if (!/^text\/html\b/i.test(response.contentType)) result.issues.push(issue("page_content_type", `Expected text/html; received ${response.contentType || "no Content-Type"}`));
        if (result.noindex) result.issues.push(issue("page_noindex", result.inSitemap ? "A sitemap page has a noindex/none directive" : "Imported page has a noindex/none directive; confirm whether exclusion is intentional", result.inSitemap ? "error" : "warning"));
        if (html.canonicals.length !== 1) result.issues.push(issue("canonical_count", `Expected one canonical in the HTML head; found ${html.canonicals.length}`, result.inSitemap ? "error" : "warning"));
        else if (normalizedAbsoluteUrl(html.canonicals[0]) !== currentUrl.href) {
          const knownAlternate = !result.inSitemap && sitemapPages.has(normalizedAbsoluteUrl(html.canonicals[0]));
          result.issues.push(issue(knownAlternate ? "canonical_alternate" : "canonical_mismatch", `Requested ${currentUrl.href}; canonical is ${html.canonicals[0]}`, knownAlternate ? "info" : "error"));
        }
        if (blockedByRobots(`${currentUrl.pathname}${currentUrl.search}`, robots.rules)) result.issues.push(issue("robots_disallow", "robots.txt blocks Googlebot from this URL"));
        if (!result.inSitemap && !result.redirects.length) result.issues.push(issue("not_in_sitemap", "Imported URL is absent from the current sitemap; omission alone is not an error", result.noindex || result.issues.some(item => item.code === "canonical_alternate") ? "info" : "warning"));
      } else if (!result.noindex) result.issues.push(issue("utility_missing_noindex", "An accessible utility page has no noindex directive"));
    }
    result.recommendation = recommendation(result);
    return result;
  }
  await Promise.all(Array.from({ length: options.concurrency }, async () => {
    while (cursor < list.length) {
      const job = list[cursor++];
      try { pages.push(await auditPage(job)); }
      catch (error) { pages.push({ ...job, status: null, classification: "audit_error", issues: [issue("audit_error", `${error.name}: ${error.message}`)] }); }
      dependencies.onProgress?.({ completed: pages.length, total: list.length });
    }
  }));
  pages.sort((a, b) => a.url.localeCompare(b.url));
  const allIssues = [...findings, ...documents.flatMap(document => document.issues), ...pages.flatMap(page => page.issues)];
  const count = (values) => values.reduce((counts, value) => ({ ...counts, [value]: (counts[value] || 0) + 1 }), {});
  return {
    generatedAt: new Date().toISOString(), origin, canonicalOrigin,
    method: "GET; manual redirects; same-site imported redirects only; no credentials or external redirects followed",
    settings: { scope: options.urlsOnly ? "imported-pages-only; sitemap/robots documents inspected" : "all-sitemap-pages-and-imports", concurrency: options.concurrency, delayMs: options.delay, timeoutMs: options.timeout, userAgent: options.userAgent },
    summary: { sitemapUrls: sitemapPages.size, importedUrls: (options.importedUrls || []).length, auditedUrls: pages.length, skippedUrls: skipped.length, pageStatusCounts: count(pages.map(page => page.status === null ? page.classification : String(page.status))), publicStatusCounts: count(pages.filter(page => !page.expectedPrivate).map(page => page.status === null ? page.classification : String(page.status))), expectedPrivateStatusCounts: count(pages.filter(page => page.expectedPrivate).map(page => page.status === null ? page.classification : String(page.status))), classificationCounts: count(pages.map(page => page.classification)), documentStatusCounts: count(documents.map(document => document.status === null ? "network" : String(document.status))), errors: allIssues.filter(item => item.severity === "error").length, warnings: allIssues.filter(item => item.severity === "warning").length, affectedPages: pages.filter(page => page.issues.some(item => item.severity === "error")).length },
    findings, documents, pages, skipped,
  };
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
export function failureCsv(report) {
  const rows = [["url", "source", "status", "classification", "in_sitemap", "expected_private", "final_url", "final_status", "canonical", "issues", "recommendation"]];
  for (const page of report.pages) {
    if (!page.issues.some(item => item.severity !== "info")) continue;
    rows.push([page.url, page.sources.join(";"), page.status, page.classification, page.inSitemap, page.expectedPrivate, page.finalUrl, page.finalStatus, page.canonical?.join(";"), page.issues.map(item => `${item.severity}:${item.code}: ${item.detail}`).join(" | "), page.recommendation]);
  }
  for (const document of report.documents.filter(document => document.issues.length)) rows.push([document.url, document.kind, document.status, document.classification, "", "", "", "", "", document.issues.map(item => `${item.code}: ${item.detail}`).join(" | "), "Check this sitemap/robots response before requesting indexing."]);
  return `${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/audit-indexing.mjs [origin] [--canonical-origin https://saasfolio.tech] [--urls gsc.csv|urls.txt] [--urls-only] [--json report.json] [--failures-csv failures.csv] [--concurrency 2] [--delay 100] [--timeout 30000] [--user-agent value]\nDefaults: http://127.0.0.1:3214; JSON saved to the system temporary directory. --urls-only reads sitemap/robots documents but checks only imported pages. Input must contain real owner-provided URLs; no Search Console access is implied. API/auth/newsletter endpoints and external URLs are never fetched. Keep imported URL lists and raw reports private; they may contain owner-supplied query tokens.");
    return;
  }
  options.importedUrls = options.urls ? parseUrlInput(await readFile(options.urls, "utf8")) : [];
  console.log(`Auditing ${options.origin}; canonical origin ${options.canonicalOrigin}; ${options.importedUrls.length} imported URLs${options.urlsOnly ? " (imported pages only)" : ""}; GET concurrency ${options.concurrency}, spacing ${options.delay} ms.`);
  const report = await auditIndexing(options, { onProgress: ({ completed, total }) => {
    if (completed % 50 === 0 || completed === total) console.log(`Checked ${completed}/${total} URLs...`);
  } });
  const output = options.json || join(tmpdir(), `saasfolio-indexing-${Date.now()}.json`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  if (options.failuresCsv) { await mkdir(dirname(options.failuresCsv), { recursive: true }); await writeFile(options.failuresCsv, failureCsv(report)); }
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`JSON report: ${output}${options.failuresCsv ? `\nFailure CSV: ${options.failuresCsv}` : ""}`);
  if (report.summary.errors) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(`Indexing audit could not start: ${error.message}`); process.exitCode = 1; });
}
