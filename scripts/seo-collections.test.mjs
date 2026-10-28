import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const { getCollectionOffers, getCollectionPrograms, getPublishedSavingsOffers } = loadCatalogModule("lib/savings-collections.ts");
const { SAVINGS_COLLECTIONS } = loadCatalogModule("lib/data/savings-collections.ts");
const { CATEGORY_SEARCH_CONTENT } = loadCatalogModule("lib/data/category-search-content.ts");
const { SEARCH_LANDING_TARGETS } = loadCatalogModule("lib/data/search-intent-map.ts");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const { getIndexableDiscountBrands } = loadCatalogModule("lib/brand-discounts.ts");
const { getCatalogCategories } = loadCatalogModule("lib/categories.ts");
const { DETAILED_ARTICLES } = loadCatalogModule("lib/data/articles-data.ts");
const { isCuratedComparison } = loadCatalogModule("lib/data/comparisons-data.ts");
const now = Date.parse("2026-10-28T12:00:00Z");
const day = 86400000;
const offer = overrides => ({ slug: "notion-startup-program", toolSlug: "notion", dealType: "free_trial", sourceKind: "vendor", checkedAt: new Date(now - day).toISOString(), sourceUrl: "https://www.notion.com/startups", destinationUrl: "https://www.notion.com/startups", expiryDate: "", ...overrides });

test("savings listings exclude plain pricing, old/future evidence and invalid expiry or source URLs", () => {
  const valid = offer({ slug: "valid" });
  const records = [valid, offer({ slug: "pricing", dealType: "pricing" }), offer({ slug: "old", checkedAt: new Date(now - 14 * day - 1).toISOString() }), offer({ slug: "future", checkedAt: new Date(now + 1).toISOString() }), offer({ slug: "expired", expiryDate: new Date(now).toISOString() }), offer({ slug: "bad-expiry", expiryDate: "not-a-date" }), offer({ slug: "missing-check", checkedAt: undefined }), offer({ slug: "unknown-source", sourceKind: undefined }), offer({ slug: "private-source", sourceUrl: "https://127.0.0.1/source" }), offer({ slug: "unsafe-destination", destinationUrl: "javascript:alert(1)" })];
  assert.deepEqual(getPublishedSavingsOffers(records, now).map(record => record.slug), ["valid"]);
  assert.equal(getPublishedSavingsOffers([offer({ checkedAt: new Date(now - 14 * day).toISOString() })], now).length, 1);
});

test("collections do not relabel a provider's ordinary annual offer or trial as an eligibility benefit", () => {
  const records = [offer({}), offer({ slug: "notion-normal-trial" }), offer({ slug: "notion-annual-price", dealType: "offer" }), offer({ slug: "github-student-developer-pack", toolSlug: "github", dealType: "offer" })];
  assert.deepEqual(getCollectionOffers("startup-deals", records, now).map(record => record.slug), ["notion-startup-program"]);
  assert.deepEqual(getCollectionOffers("student-discounts", records, now).map(record => record.slug), ["github-student-developer-pack"]);
  assert.deepEqual(getCollectionOffers("nonprofit-discounts", records, now), []);
});

test("coupon inventory needs an actual recorded code and expires with the underlying evidence", () => {
  const records = [offer({ slug: "current-code", dealType: "coupon", code: "SOURCE-REPORTED" }), offer({ slug: "blank-code", code: "  " }), offer({ slug: "no-code" }), offer({ slug: "stale-code", code: "OLD", checkedAt: new Date(now - 15 * day).toISOString() })];
  assert.deepEqual(getCollectionOffers("coupon-codes", records, now).map(record => record.slug), ["current-code"]);
  assert.deepEqual(getCollectionOffers("coupon-codes", [], now), []);
});

test("program directory entries resolve to available brand guidance without requiring a current offer", () => {
  for (const collection of SAVINGS_COLLECTIONS) {
    const programs = getCollectionPrograms(collection.slug);
    assert.equal(programs.length, collection.programs.length, `${collection.slug}: no missing or unavailable brand`);
    for (const program of programs) {
      assert.match(program.path, /^\/(discounts|tools)\/[a-z0-9-]+$/);
      assert.equal(new URL(program.sourceUrl).protocol, "https:");
    }
    assert.ok(existsSync(`app/${collection.slug}/page.tsx`));
  }
});

test("category and article links form complete, distinct buying paths", () => {
  const articleSlugs = new Set(DETAILED_ARTICLES.map(article => article.slug));
  const knownPaths = new Set(["/", "/deals", "/discounts", "/contact", "/savings-calculator", ...SAVINGS_COLLECTIONS.map(collection => `/${collection.slug}`), ...getCatalogCategories().map(category => `/deals/category/${category.slug}`), ...DETAILED_ARTICLES.map(article => `/articles/${article.slug}`), ...getIndexableDiscountBrands().map(tool => `/discounts/${tool.slug}`)]);
  assert.deepEqual(Object.keys(CATEGORY_SEARCH_CONTENT).sort(), getCatalogCategories().map(category => category.slug).sort());
  for (const content of [...Object.values(CATEGORY_SEARCH_CONTENT), ...SAVINGS_COLLECTIONS]) for (const slug of content.articleSlugs) assert.ok(articleSlugs.has(slug), `Missing article: ${slug}`);
  for (const article of DETAILED_ARTICLES) for (const section of article.sections) for (const link of section.links || []) {
    assert.ok(knownPaths.has(link.href), `Broken editorial route: ${link.href}`);
  }
  assert.equal(new Set(SEARCH_LANDING_TARGETS.map(target => target.path)).size, SEARCH_LANDING_TARGETS.length);
  assert.equal(new Set(SEARCH_LANDING_TARGETS.map(target => target.primaryQuery.toLowerCase())).size, SEARCH_LANDING_TARGETS.length);
  for (const target of SEARCH_LANDING_TARGETS) assert.ok(knownPaths.has(target.path));
});

test("current savings views retain every eligible sourced offer while rejecting pricing fallbacks", () => {
  const all = getAllDeals();
  const published = getPublishedSavingsOffers(all);
  assert.ok(published.every(deal => deal.dealType !== "pricing"));
  assert.equal(published.length, all.filter(deal => deal.dealType !== "pricing").length);
});

test("curated comparison indexing includes reverse aliases and excludes arbitrary selector pairs", () => {
  assert.equal(isCuratedComparison("coolify-vs-vercel"), true);
  assert.equal(isCuratedComparison("vercel-vs-coolify"), true);
  assert.equal(isCuratedComparison("notion-vs-linear"), false);
  assert.equal(isCuratedComparison("notion-vs-notion"), false);
});
