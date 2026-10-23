import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { normalizePublicHttpsUrl } from "../lib/public-url.mjs";
import { plainText, discoverVendorOffer, extractCouponCandidates, safePublicUrl, robotsAllows, fetchPublicPage } from "./lib/offer-sources.mjs";

test("hidden payloads and unrelated percentage banners do not become offers", () => {
  const text = plainText('<script>Free forever</script><style>.free-plan{}</style><h1>Save up to 90%</h1>');
  assert.equal(discoverVendorOffer(text), null);
  assert.equal(discoverVendorOffer("We do not have a free plan."), null);
  assert.equal(discoverVendorOffer("Our free plan is not available anymore."), null);
  assert.equal(discoverVendorOffer("Do you have a free plan? No, all plans are paid."), null);
  const hidden = '<!-- Free forever --><template>Our free plan includes everything</template><div hidden>Start your free trial</div><div aria-hidden="true">Free forever</div><p style="display: none">Free forever</p><main>Plans start at $50.</main>';
  assert.equal(plainText(hidden), "Plans start at $50.");
  assert.equal(discoverVendorOffer(plainText(hidden)), null);
  assert.equal(discoverVendorOffer("Comparison: Competitor Free plan $0, Our product $50"), null);
  assert.equal(discoverVendorOffer("<!-- Free forever -->"), null);
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
    if (name === "@/lib/public-url.mjs") return { normalizePublicHttpsUrl };
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
test("offer labels preserve maximum savings and distinguish pricing, trials and real codes", () => {
  const { offerLabel, offerActionLabel, getOfferHref } = loadTs("lib/offer-links.ts");
  assert.equal(offerLabel({ discountPercentage: 40, discountKind: "up-to", dealType: "coupon", code: "SAVE" }), "UP TO 40% OFF");
  assert.equal(offerLabel({ discountPercentage: 0, dealType: "pricing" }), "VIEW PRICING");
  assert.equal(offerActionLabel({ dealType: "free_trial" }), "View free trial");
  assert.equal(offerActionLabel({ dealType: "coupon", code: "SAVE" }), "Use code at provider");
  assert.equal(getOfferHref({ slug: "example-code" }), "/go/example-code");
});
test("ambiguous evidence, unavailable providers and 404 sources cannot publish offers", () => {
  const tools = ["ambiguous", "hidden", "removed", "gone", "good"].map(slug => ({ slug, name: slug, website: `https://${slug}.example`, providerStatus: slug === "gone" ? "unavailable" : undefined }));
  const offers = tools.map(tool => ({ slug: `${tool.slug}-free-plan`, toolSlug: tool.slug, sourceKey: `vendor:${tool.slug}`, evidence: tool.slug === "ambiguous" ? "Compare Free plan vs Paid plan" : tool.slug === "hidden" ? "<!-- Free forever -->" : "Our free plan includes one workspace.", dealType: "free_plan", checkedAt: new Date().toISOString(), destinationUrl: tool.website, discountPercentage: 0, terms: "Check current provider terms and usage limits." }));
  const { publicHttpsUrl } = loadTs("lib/offer-links.ts");
  const catalog = loadTs("lib/data/deals-data.ts", {
    "./tools-data": { TOOLS_DATA: tools, getToolBySlug: slug => tools.find(tool => tool.slug === slug) },
    "./offer-snapshot.json": { sources: { "vendor:removed": { httpStatus: 404 } }, offers },
    "./legacy-deal-aliases.json": {},
    "@/lib/offer-links": { publicHttpsUrl },
    "@/lib/offer-evidence.mjs": { discoverVendorOffer },
  });
  assert.deepEqual(catalog.getAllDeals().filter(deal => deal.dealType === "free_plan").map(deal => deal.toolSlug), ["good"]);
  assert.ok(!catalog.getAllDeals().some(deal => deal.toolSlug === "gone"));
  assert.equal(catalog.getDealBySlug("ambiguous-pricing").dealType, "pricing");
});
test("server redirects retain campaign queries, expire safely and reject unavailable or unknown providers", async () => {
  const available = { slug: "example", website: "https://example.com/", pricingUrl: "https://example.com/pricing" };
  const unavailable = { slug: "gone", providerStatus: "unavailable" };
  const coupon = { slug: "example-code", id: "deal-example-code", toolSlug: "example", destinationUrl: "https://example.com/campaign?coupon=SAVE&plan=annual#apply" };
  const { publicHttpsUrl } = loadTs("lib/offer-links.ts");
  const { GET } = loadTs("app/go/[id]/route.ts", {
    "@/lib/data/deals-data": { getDealBySlug: id => [coupon.slug, coupon.id, "old-code"].includes(id) ? coupon : undefined, getHistoricOfferToolSlug: id => ["expired-code", "old-code"].includes(id) ? "example" : undefined },
    "@/lib/data/tools-data": { getToolBySlug: slug => slug === "example" ? available : slug === "gone" ? unavailable : undefined },
    "@/lib/data/affiliate-links": { getCustomAffiliateUrl: () => "https://example.com/?ref=saasfolio" },
    "@/lib/offer-links": { publicHttpsUrl },
  });
  const visit = id => GET(new Request(`https://saasfolio.tech/go/${id}`), { params: Promise.resolve({ id }) });
  for (const id of [coupon.slug, coupon.id]) {
    const result = await visit(id);
    assert.equal(result.status, 302);
    assert.equal(result.headers.get("location"), coupon.destinationUrl);
    assert.match(result.headers.get("cache-control"), /no-store/);
  }
  for (const id of ["old-code", "expired-code"]) assert.equal((await visit(id)).headers.get("location"), available.pricingUrl);
  assert.equal((await visit("example")).headers.get("location"), "https://example.com/?ref=saasfolio");
  assert.equal((await visit("gone")).status, 410);
  for (const id of ["unknown", "https://evil.example", "__proto__"]) {
    const result = await visit(id);
    assert.equal(result.status, 404);
    assert.equal(result.headers.get("location"), null);
  }
});
test("old coupons age out in a running process, with pricing fallback and legacy aliases", () => {
  const clock = { now: Date.now() };
  class TestDate extends Date { static now() { return clock.now; } }
  const tool = { slug: "example", name: "Example", website: "https://example.com", category: "Developer", categorySlug: "dev-tools", tagline: "An example tool" };
  const { publicHttpsUrl } = loadTs("lib/offer-links.ts");
  const catalog = loadTs("lib/data/deals-data.ts", {
    "./tools-data": { TOOLS_DATA: [tool], getToolBySlug: slug => slug === tool.slug ? tool : undefined },
    "./offer-snapshot.json": { sources: {}, offers: [{ slug: "example-coupon", sourceKey: "reviewed:example", toolSlug: "example", dealType: "coupon", code: "SAVE20", checkedAt: new Date(clock.now - 13 * 86400000).toISOString(), destinationUrl: "https://example.com/offer", sourceUrl: "https://example.com/offer", sourceKind: "vendor", title: "Example coupon", terms: "New subscriptions only", discountPercentage: 20 }] },
    "./legacy-deal-aliases.json": { "old-generated-coupon": "example" },
    "@/lib/offer-links": { publicHttpsUrl },
    "@/lib/offer-evidence.mjs": { discoverVendorOffer },
  }, TestDate);
  assert.equal(catalog.getDealBySlug("old-generated-coupon").slug, "example-coupon");
  assert.equal(catalog.getDealBySlug("deal-example-coupon").code, "SAVE20");
  clock.now += 2 * 86400000;
  assert.equal(catalog.getDealBySlug("example-coupon"), undefined);
  assert.equal(catalog.getAllDeals()[0].dealType, "pricing");
  assert.equal(catalog.getDealBySlug("old-generated-coupon").slug, "example-pricing");
});

test("reviewed brand savings age out of summaries and FAQs without losing the guide", () => {
  const clock = { now: Date.parse("2026-10-23T12:00:00Z") };
  class TestDate extends Date { static now() { return clock.now; } }
  const expansion = loadTs("lib/data/expansion-discount-guides.ts");
  const guides = loadTs("lib/data/brand-discount-guides.ts", {
    "@/lib/data/additional-discount-guides": loadTs("lib/data/additional-discount-guides.ts"),
    "@/lib/data/expansion-discount-guides": expansion,
  }).BRAND_DISCOUNT_GUIDES;
  const tool = { slug: "beehiiv", name: "Beehiiv" };
  const catalog = loadTs("lib/brand-discounts.ts", {
    "@/lib/data/tools-data": { getAllTools: () => [tool] },
    "@/lib/data/deals-data": { getAllDeals: () => [] },
    "@/lib/data/offer-snapshot.json": { offers: [] },
    "@/lib/data/brand-discount-guides": { BRAND_DISCOUNT_GUIDES: guides },
    "@/lib/data/brand-purchase-checks": loadTs("lib/data/brand-purchase-checks.ts", { "@/lib/data/expansion-discount-guides": expansion }),
    "@/lib/seo": loadTs("lib/seo.ts"),
  }, TestDate);
  assert.equal(catalog.getBrandDiscountData(tool).savingsOptions.length, 1);
  assert.match(catalog.brandSavingsSummary(tool), /20%/);
  assert.ok(catalog.getBrandDiscountFaqs(tool, []).some(faq => /20%/.test(faq.answer)));
  assert.match(catalog.brandDiscountAnswer(tool), /20%/);
  assert.equal(catalog.getBrandDiscountData(tool).purchaseChecks.eligibility.length, 3);
  const addedBrand = { slug: "meetgeek", name: "MeetGeek" };
  assert.match(catalog.brandBestDiscountAnswer(addedBrand), /yearly quote/);
  clock.now += 31 * 86400000;
  assert.deepEqual(catalog.getBrandDiscountData(tool).savingsOptions, []);
  assert.doesNotMatch(catalog.brandSavingsSummary(tool), /20%/);
  assert.ok(catalog.getBrandDiscountFaqs(tool, []).every(faq => !/20%/.test(faq.answer)));
  assert.doesNotMatch(catalog.brandDiscountAnswer(tool), /20%/);
  assert.equal(catalog.getBrandDiscountData(tool).purchaseChecks, undefined);
  assert.equal(catalog.getBrandDiscountData(tool).indexable, true);
  assert.doesNotMatch(catalog.brandBestDiscountAnswer(addedBrand), /yearly quote/);
  assert.equal(catalog.getBrandDiscountData(addedBrand).purchaseChecks, undefined);
  assert.equal(catalog.getIndexableDiscountBrands()[0].slug, "beehiiv");
  // Future-dated observations must never appear as reviewed savings.
  clock.now = Date.parse("2026-10-22T12:00:00Z");
  assert.deepEqual(catalog.getBrandDiscountData(tool).savingsOptions, []);
  assert.equal(catalog.getBrandDiscountData(tool).purchaseChecks, undefined);
  assert.doesNotMatch(catalog.brandBestDiscountAnswer(addedBrand), /yearly quote/);
});
