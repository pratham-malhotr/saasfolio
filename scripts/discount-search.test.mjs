import assert from "node:assert/strict";
import test from "node:test";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const { searchDiscountBrands, discountSearchSummary } = loadCatalogModule("lib/discount-search.ts");
const current = Date.parse("2026-10-26T12:00:00Z");
const make = (slug, name, aliases = [], couponCount = 0) => ({ slug, name, aliases, couponCount, category: "Software", summary: "A sourced current option", freshUntil: current + 86400000 });
const entries = [make("predis-ai", "Predis.ai", ["predis"]), make("convertkit", "Kit (ConvertKit)", ["kit", "kit-convertkit"]), make("tldv", "tl;dv", ["tl-dv"]), make("hostinger", "Hostinger", [], 2), make("fathom", "Fathom", ["fathom-ai"]), make("notion", "Notion"), make("ahrefs", "Ahrefs"), make("semrush", "Semrush")];

test("brand discount intent finds the canonical guide across actual name variants", () => {
  for (const [query, slug] of [["best discount for Predis", "predis-ai"], ["Predis.ai promo codes", "predis-ai"], ["ConvertKit coupon", "convertkit"], ["Kit discount", "convertkit"], ["tl;dv discount code", "tldv"], ["tl-dv coupons", "tldv"], ["Fathom AI deals", "fathom"]]) {
    assert.equal(searchDiscountBrands(entries, query, 5, current)[0]?.slug, slug, query);
  }
});

test("purchase qualifiers route to a brand guide without claiming that an offer exists", () => {
  for (const [query, slug] of [["Notion student discount", "notion"], ["Ahrefs annual discount", "ahrefs"], ["Semrush yearly discount", "semrush"], ["Notion non-profit pricing", "notion"], ["Hostinger coupon code not working", "hostinger"]]) assert.equal(searchDiscountBrands(entries, query, 5, current)[0]?.slug, slug, query);
});

test("intent-only queries prioritize recorded codes and never match unrelated brand words", () => {
  assert.equal(searchDiscountBrands(entries, "coupon codes", 5, current)[0].slug, "hostinger");
  assert.deepEqual(searchDiscountBrands(entries, "unknownproviderzz discount", 5, current), []);
  assert.equal(searchDiscountBrands(entries, "", 2, current).length, 2);
});

test("cached search entries stop displaying dated savings after their evidence expires", () => {
  const entry = { ...entries[0], summary: "20% published annual savings", freshUntil: current - 1 };
  assert.doesNotMatch(discountSearchSummary(entry, current), /20%/);
  assert.match(discountSearchSummary({ ...entry, freshUntil: current + 1 }, current), /20%/);
  assert.doesNotMatch(discountSearchSummary({ ...entry, freshUntil: undefined }, current), /20%/);
});

test("the server search index contains only canonical indexable guides and compact public fields", () => {
  const { getDiscountSearchEntries, getIndexableDiscountBrands } = loadCatalogModule("lib/brand-discounts.ts");
  const index = getDiscountSearchEntries();
  assert.deepEqual(new Set(index.map(entry => entry.slug)), new Set(getIndexableDiscountBrands().map(tool => tool.slug)));
  assert.equal(new Set(index.map(entry => entry.slug)).size, index.length);
  assert.ok(index.every(entry => !Object.hasOwn(entry, "sections") && !Object.hasOwn(entry, "offers") && !Object.hasOwn(entry, "sources")));
  assert.equal(searchDiscountBrands(index, "best discount for Predis")[0].slug, "predis-ai");
});
