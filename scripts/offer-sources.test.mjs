import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { plainText, discoverVendorOffer, extractCouponCandidates, safePublicUrl, robotsAllows, fetchPublicPage } from "./lib/offer-sources.mjs";

test("hidden payloads and unrelated percentage banners do not become offers", () => {
  const text = plainText('<script>Free forever</script><style>.free-plan{}</style><h1>Save up to 90%</h1>');
  assert.equal(discoverVendorOffer(text), null);
  assert.equal(discoverVendorOffer("We do not have a free plan."), null);
  assert.equal(discoverVendorOffer("Our free plan is not available anymore."), null);
  assert.equal(discoverVendorOffer("Do you have a free plan? No, all plans are paid."), null);
});
test("vendor discovery preserves the evidence and distinguishes trials", () => {
  assert.equal(discoverVendorOffer("Professional: Start your free trial today. Paid subscriptions follow.").type, "free_trial");
  assert.equal(discoverVendorOffer("Starter costs $0. Free forever, with 100 requests per month.").type, "free_plan");
  assert.match(discoverVendorOffer("Try free for 14 days, then choose your plan.").evidence, /14 days/);
});
test("structured coupon discoveries remain untested review candidates", () => {
  const html = '<script type="application/ld+json">{"@graph":[{"name":"Annual plan","discountCode":"SAVE20","validThrough":"2026-12-31"}]}</script>';
  const [candidate] = extractCouponCandidates(html, "https://simplycodes.com/store/example.com", "example");
  assert.equal(candidate.code, "SAVE20");
  assert.equal(candidate.status, "needs-review");
  assert.equal(candidate.checkoutTested, false);
  assert.deepEqual(extractCouponCandidates('<h2>Try SAVE20</h2>', "https://example.com", "example"), []);
});
test("robots honors groups, longest matching rules, and explicit allowances", () => {
  const robots = 'User-agent: *\nDisallow: /api/\nDisallow: /store/private*\nAllow: /store/private/public\nUser-agent: CCBot\nDisallow: /';
  assert.equal(robotsAllows(robots, "/store/example.com"), true);
  assert.equal(robotsAllows(robots, "/api/codes"), false);
  assert.equal(robotsAllows(robots, "/store/private-one"), false);
  assert.equal(robotsAllows(robots, "/store/private/public"), true);
  assert.equal(robotsAllows(robots, "/store/example.com", "CCBot"), false);
});
test("public source fetches reject unsafe targets, off-domain redirects, and challenges", async () => {
  for (const url of ["http://example.com", "https://127.0.0.1/", "https://admin:secret@example.com", "https://169.254.169.254/", "https://example.internal/"]) assert.equal(safePublicUrl(url), false);
  await assert.rejects(fetchPublicPage("https://example.com", { fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://other.example/" } }) }), /allowed hosts/);
  await assert.rejects(fetchPublicPage("https://example.com", { fetchImpl: async () => new Response("Just a moment", { headers: { "content-type": "text/html" } }) }), /verification/);
  await assert.rejects(fetchPublicPage("https://example.com", { fetchImpl: async () => new Response("Blocked", { status: 403 }) }), /403/);
});
test("conditional fetches preserve 304 without fabricating new evidence", async () => {
  let supplied;
  const page = await fetchPublicPage("https://example.com/pricing", { etag: '"v1"', fetchImpl: async (_url, options) => {
    supplied = options.headers;
    return new Response(null, { status: 304 });
  } });
  assert.equal(page.unchanged, true);
  assert.equal(page.html, undefined);
  assert.equal(supplied["If-None-Match"], '"v1"');
});

function loadTs(relativePath, dependencies = {}, date = Date) {
  const source = fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const testModule = { exports: {} };
  new Function("require", "module", "exports", "Date", js)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
    return dependencies[name];
  }, testModule, testModule.exports, date);
  return testModule.exports;
}
test("offer links preserve the exact campaign and reject executable URLs", () => {
  const { getOfferDestination } = loadTs("lib/offer-links.ts");
  const campaign = "https://example.com/startups?coupon=SAVE20&plan=annual#apply";
  assert.equal(getOfferDestination({ destinationUrl: campaign, affiliateUrl: "https://example.com/", toolSlug: "example" }), campaign);
  assert.equal(getOfferDestination({ destinationUrl: "javascript:alert(1)", affiliateUrl: "/go/example", toolSlug: "example" }), "/go/example");
});
test("old coupons age out in a running process, with pricing fallback and legacy aliases", () => {
  const clock = { now: Date.now() };
  class TestDate extends Date { static now() { return clock.now; } }
  const tool = { slug: "example", name: "Example", website: "https://example.com", category: "Developer", categorySlug: "dev-tools", tagline: "An example tool" };
  const { publicHttpsUrl } = loadTs("lib/offer-links.ts");
  const catalog = loadTs("lib/data/deals-data.ts", {
    "./tools-data": { TOOLS_DATA: [tool], getToolBySlug: slug => slug === tool.slug ? tool : undefined },
    "./offer-snapshot.json": { offers: [{ slug: "example-coupon", toolSlug: "example", dealType: "coupon", code: "SAVE20", checkedAt: new Date(clock.now - 13 * 86400000).toISOString(), destinationUrl: "https://example.com/offer", sourceUrl: "https://example.com/offer", sourceKind: "vendor", title: "Example coupon", terms: "New subscriptions only", discountPercentage: 20 }] },
    "./legacy-deal-aliases.json": { "old-generated-coupon": "example" },
    "@/lib/offer-links": { publicHttpsUrl },
  }, TestDate);
  assert.equal(catalog.getDealBySlug("old-generated-coupon").slug, "example-coupon");
  assert.equal(catalog.getDealBySlug("deal-example-coupon").code, "SAVE20");
  clock.now += 2 * 86400000;
  assert.equal(catalog.getDealBySlug("example-coupon"), undefined);
  assert.equal(catalog.getAllDeals()[0].dealType, "pricing");
  assert.equal(catalog.getDealBySlug("old-generated-coupon").slug, "example-pricing");
});
