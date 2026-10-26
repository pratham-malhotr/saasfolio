import assert from "node:assert/strict";

// Validate the actual production responses rather than implementation details.
// Usage: npm run seo:audit -- http://localhost:3210
const origin = (process.argv[2] || "http://localhost:3210").replace(/\/$/, "");
const expectedOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin;
const headers = { "User-Agent": "Googlebot" };
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
}
function metaTags(html) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attributes(tag));
}
async function response(path) {
  const result = await fetch(`${origin}${path}`, { headers, signal: AbortSignal.timeout(30000) });
  return { result, html: await result.text() };
}
const failures = [];
const titles = new Map();
const internalPaths = new Map();
const imagePaths = new Set();
let schemaCount = 0;
let auditedPages = 0;

const { result: sitemapResponse, html: sitemap } = await response("/sitemap.xml");
assert.equal(sitemapResponse.status, 200, "Sitemap must be accessible");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
assert.ok(urls.length > 0, "Sitemap must contain public URLs");
assert.equal(new Set(urls).size, urls.length, "Sitemap must not repeat URLs");
for (const url of urls) {
  assert.equal(new URL(url).origin, expectedOrigin, "Sitemap uses canonical production origin");
  assert.ok(!/^\/(admin|profile|login|signup|submit|u|go)(\/|$)/.test(new URL(url).pathname), `Utility URL leaked into sitemap: ${url}`);
}
const { html: robots } = await response("/robots.txt");
assert.ok(robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`), "robots.txt advertises the canonical sitemap");
assert.ok(!/^Disallow: \/(?:_next|go|admin)/m.test(robots), "Allow assets and reading noindex directives");
for (const [, date] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  assert.ok(!Number.isNaN(Date.parse(date)) && Date.parse(date) <= Date.now(), `Invalid/future sitemap date: ${date}`);
}

async function auditPage(url) {
  const path = new URL(url).pathname;
  const { result, html } = await response(path);
  assert.equal(result.status, 200, `${path}: public page returns HTTP 200`);
  assert.ok(!result.redirected, `${path}: sitemap URL resolves without a redirect`);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] || "";
  const metas = metaTags(head);
  const value = (key) => metas.find((tag) => tag.name === key || tag.property === key)?.content;
  const title = decode(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
  assert.ok(title && title.includes("SaaSFolio"), `${path}: server-rendered branded title`);
  assert.ok(!/SaaSFolio.*SaaSFolio/.test(title), `${path}: no duplicated brand in title`);
  assert.ok(!titles.has(title), `${path}: title duplicates ${titles.get(title)}`);
  titles.set(title, path);
  assert.ok(value("description")?.length >= 30 && value("description").length <= 160, `${path}: useful concise meta description`);
  assert.ok(!value("robots")?.includes("noindex"), `${path}: public page must be indexable`);
  assert.ok(!value("googlebot")?.includes("noindex"), `${path}: Googlebot-specific directive allows indexing`);
  assert.ok(!result.headers.get("x-robots-tag")?.includes("noindex"), `${path}: public page has no noindex header`);
  const canonicals = [...head.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag)).filter((tag) => tag.rel === "canonical");
  assert.equal(canonicals.length, 1, `${path}: exactly one canonical in head`);
  assert.equal(canonicals[0].href, url, `${path}: self-referencing canonical matches sitemap`);
  assert.equal(value("og:url"), url, `${path}: Open Graph URL matches canonical`);
  assert.equal(value("og:title"), title, `${path}: social title matches page`);
  assert.equal(value("twitter:card"), "summary_large_image", `${path}: complete Twitter card`);
  assert.ok(value("og:image"), `${path}: sharing image exists`);
  imagePaths.add(new URL(value("og:image")).pathname);
  const body = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  assert.equal([...body.matchAll(/<h1\b/g)].length, 1, `${path}: one server-rendered primary heading`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(schemas.length, `${path}: JSON-LD is present in HTML`);
  for (const [, raw] of schemas) {
    const schema = JSON.parse(raw);
    assert.equal(schema["@context"], "https://schema.org", `${path}: schema context`);
    const serialized = JSON.stringify(schema);
    assert.ok(!serialized.includes('"@type":"AggregateRating"'), `${path}: no unverified rating claims`);
    assert.ok(!serialized.includes('"@type":"Offer"'), `${path}: no currency-less pricing claims`);
    for (const [, date] of serialized.matchAll(/"date(?:Published|Modified)":"([^"]+)"/g)) {
      assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(date) && !Number.isNaN(Date.parse(date)), `${path}: ISO publication dates`);
    }
    schemaCount++;
  }
  for (const [, tag] of body.matchAll(/(<a\b[^>]*>)/g)) {
    const attrs = attributes(tag);
    if (!attrs.href?.startsWith("/") || attrs.href.startsWith("//")) continue;
    const target = new URL(attrs.href, expectedOrigin);
    if (target.pathname.startsWith("/go/")) {
      assert.ok(attrs.rel?.includes("sponsored") && attrs.rel?.includes("nofollow"), `${path}: qualify affiliate link ${attrs.href}`);
    } else if (!target.pathname.match(/^\/deals\/[^/]+-pricing$/) && !internalPaths.has(target.pathname)) internalPaths.set(target.pathname, path);
  }
  if (++auditedPages % 100 === 0) console.log(`Checked ${auditedPages}/${urls.length} public pages...`);
}

// Limit concurrency so this can also run against the deployed website.
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    try { await auditPage(url); } catch (error) { failures.push(error.message); }
  }
}));
const sitemapPaths = new Set(urls.map((url) => new URL(url).pathname));
const extraPaths = [...internalPaths.keys()].filter((path) => !sitemapPaths.has(path) && !/^\/(login|signup|admin|profile|submit|u)(\/|$)/.test(path));
let linkCursor = 0;
console.log(`Checking ${extraPaths.length} additional internal link destinations...`);
await Promise.all(Array.from({ length: 4 }, async () => {
  while (linkCursor < extraPaths.length) {
    const path = extraPaths[linkCursor++];
    try {
      const { result, html } = await response(path);
      const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
      const unavailableProvider = /^\/tools\/[^/]+$/.test(path) && html.includes('data-provider-unavailable="true"');
      const communityPreview = /^\/community(?:\/[^/]+)?$/.test(path) && html.includes('data-community-preview="true"');
      if (communityPreview) assert.ok(noindex, `${path}: browser-local community preview must be noindex`);
      if (unavailableProvider) {
        assert.ok(noindex, `${path}: unavailable provider must be noindex`);
        assert.ok(!/<a\b[^>]*href="\/go\//.test(html), `${path}: unavailable provider must not expose an outbound offer`);
      }
      if (result.status !== 200 || (noindex && !unavailableProvider && !communityPreview)) failures.push(`Broken or non-indexable public internal link: ${path} from ${internalPaths.get(path)} (HTTP ${result.status})`);
    } catch (error) { failures.push(`${path}: ${error.message}`); }
  }
}));
for (const path of imagePaths) {
  const result = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
  if (result.status !== 200 || !result.headers.get("content-type")?.startsWith("image/")) failures.push(`Broken sharing image: ${path}`);
  else {
    const bytes = new Uint8Array(await result.arrayBuffer());
    if (bytes.length < 1000) failures.push(`Empty sharing image: ${path}`);
  }
}
for (const path of ["/admin", "/profile", "/login", "/signup", "/submit", "/u/seo-audit"]) {
  const { result, html } = await response(path);
  const meta = metaTags(html).find((tag) => tag.name === "robots")?.content;
  if (!meta?.includes("noindex") || !result.headers.get("x-robots-tag")?.includes("noindex")) failures.push(`Missing noindex HTML/header: ${path}`);
}
for (const path of ["/go/notion", "/go/hostinger-couponspage-code", "/go/deal-hostinger-couponspage-code", "/go/hostinger-cloud-79-off"]) {
  const result = await fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  if (result.status !== 302 || !result.headers.get("location")?.startsWith("https://") || !result.headers.get("x-robots-tag")?.includes("noindex")) failures.push(`Invalid server offer redirect: ${path}`);
  if (path.includes("couponspage") && result.headers.get("location") !== "https://www.hostinger.com/coupons") failures.push(`Lost offer-specific destination: ${path}`);
}
for (const path of ["/go/unknown-brand", "/go/https%3A%2F%2Fevil.example"]) {
  const result = await fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  if (result.status !== 404 || result.headers.get("location")) failures.push(`Unknown redirect identifiers must return 404: ${path}`);
}
for (const path of ["/tools/seo-missing", "/deals/seo-missing", "/articles/seo-missing", "/compare/seo-missing", "/compare/notion-vs-notion", "/community/seo-missing"]) {
  const { result, html } = await response(path);
  if (result.status !== 404 && !metaTags(html).some((tag) => tag.name === "robots" && tag.content?.includes("noindex"))) failures.push(`Missing page remains indexable: ${path}`);
}
const { html: filtered } = await response("/deals?category=ai-tools&type=coupon&utm_source=seo-audit");
if (!filtered.includes(`rel="canonical" href="${expectedOrigin}/deals"`)) failures.push("Filtered/tracking URLs must canonicalize to /deals");
const { html: reverse } = await response("/compare/vercel-vs-coolify");
if (!reverse.includes(`rel="canonical" href="${expectedOrigin}/compare/coolify-vs-vercel"`)) failures.push("Reversed comparison must canonicalize to the curated comparison");

if (failures.length) {
  console.error(`${failures.length} SEO checks failed:\n${failures.map((message) => `- ${message}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`SEO audit passed: ${urls.length} sitemap pages, ${schemaCount} JSON-LD blocks, ${imagePaths.size} sharing images, utility noindex, missing pages, internal links, query and comparison canonicals.`);
}
