import fs from "node:fs";
import assert from "node:assert/strict";
import { safePublicUrl } from "./lib/offer-sources.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { managedPublicIndex } from "../lib/managed-catalog.mjs";
import { checkedManagedRelease } from "./lib/managed-release.mjs";

const read = name => JSON.parse(fs.readFileSync(new URL(`../lib/data/${name}`, import.meta.url), "utf8"));
const seeds = read("catalog-seeds.json");
const tools = read("expanded-tools.json");
const snapshot = read("offer-snapshot.json");
const reviewed = read("reviewed-offers.json");
const managed = checkedManagedRelease(read("managed-catalog.json"));
assert.deepEqual(read("managed-public-index.json"), managedPublicIndex(managed), "Generate both managed release files with catalog:export");
const managedBrands = managed.entries.filter(entry => entry.kind === "brand");
assert.equal(new Set([...seeds, ...tools].map(tool => tool.slug)).size, seeds.length + tools.length, "Repository brand slugs must be unique");
const all = [...new Map([...seeds, ...tools, ...managedBrands.map(entry => ({ ...entry.payload, slug: entry.slug }))].map(tool => [tool.slug, tool])).values()];
const slugs = new Set(all.map(t => t.slug));
assert.equal(slugs.size, all.length, "New brand slugs must not duplicate existing ones");
for (const tool of tools) {
  assert.match(tool.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(safePublicUrl(tool.website) && safePublicUrl(tool.pricingUrl), `${tool.name}: public provider URL`);
  assert.ok(tool.description.length > 40 && tool.keyFeatures.length >= 3, `${tool.name}: useful brand-specific content`);
  assert.equal(tool.reviewCount, 0, "No invented reviews");
  assert.equal(tool.rating, 0, "No invented ratings");
}
assert.equal(new Set(snapshot.offers.map(o => o.slug)).size, snapshot.offers.length, "Offer slugs are unique");
for (const offer of snapshot.offers) {
  assert.ok(slugs.has(offer.toolSlug), `Unknown brand: ${offer.toolSlug}`);
  assert.ok(safePublicUrl(offer.sourceUrl) && safePublicUrl(offer.destinationUrl), `${offer.slug}: source and destination`);
  assert.ok(offer.evidence.length >= 8 && offer.terms.length > 40, `${offer.slug}: evidence and eligibility`);
  assert.ok(Date.parse(offer.checkedAt) <= Date.now(), `${offer.slug}: actual source check date`);
  assert.ok(snapshot.sources[offer.sourceKey]?.contentHash, `${offer.slug}: source evidence fingerprint`);
  assert.ok(offer.discountPercentage >= 0 && offer.discountPercentage <= 100);
  if (offer.code || offer.discountPercentage > 0) assert.ok(reviewed.some(o => o.slug === offer.slug) || managed.entries.some(entry => entry.kind === "offer" && entry.slug === offer.slug), `${offer.slug}: monetary claims require an explicit reviewed source`);
  if (offer.expiryDate) assert.ok(Number.isFinite(Date.parse(offer.expiryDate)));
}
for (const [key, source] of Object.entries(snapshot.sources)) {
  if (source.status === "error" && source.checkedAt && source.lastAttemptAt) assert.ok(source.checkedAt <= source.lastAttemptAt, `${key}: failed fetch cannot advance verification`);
}
const canonicalBrands = new Set(all.map(tool => tool.name.toLowerCase().replace(/[^a-z0-9]/g, ""))).size;
// New reviewed additions must ship their profile and complete brand search page.
const { EXPANSION_BRAND_SLUGS } = loadCatalogModule("lib/data/expansion-discount-guides.ts");
const { NEW_DISCOUNT_BRAND_SLUGS, DISCOUNT_EXPANSION_ENTRIES } = loadCatalogModule("lib/data/discount-brand-expansion.ts");
const { getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
const { BRAND_DISCOUNT_GUIDES } = loadCatalogModule("lib/data/brand-discount-guides.ts");
const { BRAND_PURCHASE_CHECKS } = loadCatalogModule("lib/data/brand-purchase-checks.ts");
for (const tool of tools.filter(tool => tool.updatedAt.slice(0, 10) >= "2026-10-23")) assert.ok(BRAND_DISCOUNT_GUIDES[tool.slug], `${tool.slug}: newly reviewed brands need an original discount guide`);
assert.equal(new Set(DISCOUNT_EXPANSION_ENTRIES.map(entry => entry.slug)).size, DISCOUNT_EXPANSION_ENTRIES.length, "New discount guides must have distinct brand identities");
for (const entry of DISCOUNT_EXPANSION_ENTRIES) {
  const tool = getToolBySlug(entry.slug);
  assert.ok(tool, `${entry.slug}: reviewed brand resolves to a canonical profile`);
  assert.equal(tool.slug, entry.slug, `${entry.slug}: no duplicate alias profile`);
  assert.equal(tool.pricingUrl, entry.url, `${entry.slug}: current official pricing destination`);
  assert.equal(tool.pricingModel, entry.profile.pricingModel, `${entry.slug}: reviewed access model`);
  assert.equal(tool.updatedAt.slice(0, 10), entry.reviewedAt, `${entry.slug}: actual profile review date`);
  assert.ok(entry.sections.map(([, text]) => text).join(" ").split(/\s+/).length >= 280, `${entry.slug}: substantive original buying guidance`);
  assert.ok(entry.meta.length >= 70 && entry.meta.length <= 155, `${entry.slug}: useful search description`);
  assert.ok(safePublicUrl(entry.url) && (entry.sources || []).every(source => safePublicUrl(source.url)) && entry.faqs.length >= 3, `${entry.slug}: provider sources and specific questions`);
}
for (const slug of [...EXPANSION_BRAND_SLUGS, ...NEW_DISCOUNT_BRAND_SLUGS]) {
  const tool = getToolBySlug(slug), guide = BRAND_DISCOUNT_GUIDES[slug], checks = BRAND_PURCHASE_CHECKS[slug];
  assert.ok(tool && guide && checks, `${slug}: a new brand needs a profile, discount guide and purchase checks`);
  assert.equal(tool.updatedAt.slice(0, 10), guide.reviewedAt, `${slug}: profile and guide preserve their actual review date`);
  assert.ok(guide.bestDiscountAnswer?.length >= 150 && guide.sections.length >= 4, `${slug}: original brand-level search guidance`);
  assert.ok(guide.decisionRows.length >= 3 && guide.redemptionSteps.length === 4 && guide.faqs.length >= 2, `${slug}: actionable buying and claim instructions`);
  assert.ok(checks.eligibility.length >= 3 && checks.troubleshooting.length >= 2, `${slug}: eligibility and coupon troubleshooting`);
  for (const related of guide.relatedSlugs) assert.ok(getToolBySlug(related) && BRAND_DISCOUNT_GUIDES[related], `${slug}: related guide exists: ${related}`);
}
console.log(`Catalog validated: ${canonicalBrands} canonical brands (${tools.length} additions), ${snapshot.offers.length} sourced offers, ${Object.keys(snapshot.sources).length} source records.`);
