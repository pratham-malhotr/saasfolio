import fs from "node:fs";
import assert from "node:assert/strict";
import { safePublicUrl } from "./lib/offer-sources.mjs";

const read = name => JSON.parse(fs.readFileSync(new URL(`../lib/data/${name}`, import.meta.url), "utf8"));
const seeds = read("catalog-seeds.json");
const tools = read("expanded-tools.json");
const snapshot = read("offer-snapshot.json");
const reviewed = read("reviewed-offers.json");
const all = [...seeds, ...tools];
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
  if (offer.code || offer.discountPercentage > 0) assert.ok(reviewed.some(o => o.slug === offer.slug), `${offer.slug}: monetary claims require an explicit reviewed source`);
  if (offer.expiryDate) assert.ok(Number.isFinite(Date.parse(offer.expiryDate)));
}
for (const [key, source] of Object.entries(snapshot.sources)) {
  if (source.status === "error" && source.checkedAt && source.lastAttemptAt) assert.ok(source.checkedAt <= source.lastAttemptAt, `${key}: failed fetch cannot advance verification`);
}
const canonicalBrands = new Set(all.map(tool => tool.name.toLowerCase().replace(/[^a-z0-9]/g, ""))).size;
console.log(`Catalog validated: ${canonicalBrands} canonical brands (${tools.length} additions), ${snapshot.offers.length} sourced offers, ${Object.keys(snapshot.sources).length} source records.`);
