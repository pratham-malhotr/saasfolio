import assert from "node:assert/strict";
import { parse } from "parse5";
import { ADSENSE_ACCOUNT, ADSENSE_SELLER } from "../lib/advertising.mjs";
import { ARTICLE_ALIASES } from "../lib/data/article-aliases.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Public GETs only: no account changes, emails, consent clicks or ad requests.
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const attr = (node, name) => node.attrs?.find(attribute => attribute.name === name)?.value;
const nodes = (node, tag) => [...(node.tagName === tag ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, tag))];
const content = node => node?.value || (node?.childNodes || []).map(content).join("");
async function get(path, redirect = "follow") {
  const response = await fetch(`${origin}${path}`, { redirect, signal: AbortSignal.timeout(30000) });
  const raw = await response.text();
  return { response, raw, document: parse(raw) };
}
const { response: adsResponse, raw: ads } = await get("/ads.txt");
assert.equal(adsResponse.status, 200, "ads.txt is reachable");
assert.match(adsResponse.headers.get("content-type"), /text\/plain/);
assert.equal(ads.trim(), `google.com, ${ADSENSE_SELLER}, DIRECT, f08c47fec0942fa0`);
let checkedPages = 0;
for (const path of ["/", "/discounts", "/discounts/hostinger", "/articles", "/privacy", "/terms", "/about", "/contact", "/affiliate-disclosure", "/login", "/publisher-audit-missing-page"]) {
  const { response, document } = await get(path);
  assert.equal(response.status, path.endsWith("missing-page") ? 404 : 200, path);
  const head = nodes(document, "head")[0];
  assert.equal(attr(nodes(head, "meta").find(node => attr(node, "name") === "google-adsense-account"), "content"), ADSENSE_ACCOUNT, `${path}: publisher ownership metadata`);
  assert.ok(!nodes(document, "script").some(node => /adsbygoogle|googlesyndication|doubleclick/.test(attr(node, "src") || "")), `${path}: verification does not load ad-serving scripts`);
  const csp = response.headers.get("content-security-policy") || "";
  for (const directive of ["base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'", "form-action 'self'"]) assert.ok(csp.includes(directive), `${path}: ${directive}`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  checkedPages++;
}
for (const [path, status] of [["/api/auth/session", 200], ["/api/account", 401], ["/api/admin/inquiries", 401], ["/login", 200]]) {
  const { response } = await get(path);
  assert.equal(response.status, status, path);
  const cache = response.headers.get("cache-control");
  assert.ok(cache.includes("private") && cache.includes("no-store") && !cache.includes("public"), `${path}: private responses cannot be cached publicly`);
}
const { raw: health } = await get("/api/health");
const payload = JSON.parse(health);
assert.ok(payload.checks && typeof payload.checks.accountsConfigured === "boolean");
assert.ok(!payload.systemSpecs && !payload.uptime && !payload.environment, "Public health omits process and framework details");
const { document: privacy } = await get("/privacy");
const privacyText = content(nodes(privacy, "main")[0]);
for (const phrase of [/cookies/i, /IP addresses/, /personalize ads/, /verification only/, /consent management/]) assert.match(privacyText, phrase);
assert.ok(nodes(privacy, "a").some(node => attr(node, "href") === "https://myadcenter.google.com/"));
assert.ok(nodes(privacy, "a").some(node => attr(node, "href") === "https://policies.google.com/technologies/partner-sites"));
const { DETAILED_ARTICLES } = loadCatalogModule("lib/data/articles-data.ts");
for (const article of DETAILED_ARTICLES) {
  const { response, document } = await get(`/articles/${article.slug}`);
  assert.equal(response.status, 200);
  const main = nodes(document, "main")[0];
  assert.ok(content(main).includes("SaaSFolio editorial"));
  for (const source of article.sources) assert.ok(nodes(main, "a").some(node => attr(node, "href") === source.url), `${article.slug}: visible reference`);
  const schemas = nodes(document, "script").filter(node => attr(node, "type") === "application/ld+json").flatMap(node => JSON.parse(content(node))["@graph"] || []);
  const schema = schemas.find(node => node["@type"] === "Article");
  assert.ok(schema.author["@id"].endsWith("#organization"));
  assert.deepEqual(schema.citation, article.sources.map(source => source.url));
}
for (const [alias, canonical] of Object.entries(ARTICLE_ALIASES)) {
  const { response } = await get(`/articles/${alias}`, "manual");
  assert.equal(response.status, 308, `${alias}: permanent canonical redirect`);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, `/articles/${canonical}`);
}
const { raw: sitemap } = await get("/sitemap.xml");
assert.ok(!/<loc>[^<]*\/community(?:<|\/)/.test(sitemap), "Local-only discussion previews are outside the sitemap");
const { DETAILED_THREADS } = loadCatalogModule("lib/data/community-data.ts");
for (const path of ["/community", ...DETAILED_THREADS.map(thread => `/community/${thread.slug}`)]) {
  const { document } = await get(path);
  assert.ok(attr(nodes(document, "meta").find(node => attr(node, "name") === "robots"), "content").includes("noindex"), `${path}: previews are noindex`);
  assert.ok(content(nodes(document, "main")[0]).toLowerCase().includes("editorial"));
}
console.log(`Publisher/security audit passed: ${checkedPages} content and utility responses, ads.txt and ownership metadata, no ad-serving code, private cache headers, privacy choices, ${DETAILED_ARTICLES.length} referenced guides and permanent redirects, and ${DETAILED_THREADS.length + 1} non-indexed discussion previews.`);
console.log(`Configuration presence only (not provider connectivity): accounts=${payload.checks.accountsConfigured}, forms=${payload.checks.formsConfigured}, newsletter=${payload.checks.newsletterConfigured}. AdSense approval and CMP publication require account-side verification.`);
