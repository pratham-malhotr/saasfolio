import { CatalogValidationError, validateManagedCatalog } from "./managed-catalog.mjs";

// Run before an approved database release can replace the deployed snapshot.
export function validateManagedRelease(input, { previous, tools = [], guideSlugs = [], offerIdentities = {} } = {}) {
  const catalog = validateManagedCatalog(input);
  const fail = message => { throw new CatalogValidationError(message); };
  if (previous) {
    if (catalog.revision < previous.revision) fail("The source release is older than the deployed release.");
    for (const old of previous.entries) {
      const next = catalog.entries.find(entry => entry.kind === old.kind && entry.slug === old.slug);
      if (!next) fail(`Retire ${old.kind}:${old.slug} instead of removing its identity.`);
      if (next.revision < old.revision) fail(`Revision moved backwards for ${old.slug}.`);
      if (old.kind === "offer" && next.payload.toolSlug !== old.payload.toolSlug) fail(`Offer ${old.slug} cannot move to another brand.`);
    }
  }
  const brands = new Map(tools.map(tool => [tool.slug, tool]));
  for (const entry of catalog.entries.filter(entry => entry.kind === "brand")) brands.set(entry.slug, { ...entry.payload, slug: entry.slug, providerStatus: entry.retired ? "unavailable" : "available" });
  const names = new Map();
  for (const brand of brands.values()) {
    const key = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (names.has(key) && names.get(key) !== brand.slug) fail(`Duplicate brand identity: ${brand.name}. Use its existing canonical slug.`);
    names.set(key, brand.slug);
  }
  const guides = new Set(guideSlugs);
  for (const entry of catalog.entries.filter(entry => entry.kind === "guide")) { if (entry.retired) guides.delete(entry.slug); else guides.add(entry.slug); }
  for (const entry of catalog.entries.filter(entry => !entry.retired)) {
    const brandSlug = entry.kind === "offer" ? entry.payload.toolSlug : entry.slug;
    const brand = brands.get(brandSlug);
    if (!brand || brand.providerStatus === "unavailable") fail(`${entry.slug} needs an available canonical brand.`);
    if (entry.kind === "brand" && !guides.has(entry.slug)) fail(`${entry.slug} needs an approved original discount guide in the same release.`);
    if (entry.kind === "guide") for (const related of entry.payload.relatedSlugs) {
      if (related === entry.slug || !guides.has(related) || !brands.has(related) || brands.get(related).providerStatus === "unavailable") fail(`${entry.slug} links to a missing, retired or self-referencing guide: ${related}.`);
    }
    if (entry.kind === "offer") {
      const known = offerIdentities[entry.slug] || offerIdentities[`deal-${entry.slug}`];
      if (known && known !== brandSlug) fail(`${entry.slug} already belongs to another brand.`);
      const host = value => new URL(value).hostname.replace(/^www\./, "");
      const official = host(brand.website);
      const belongs = value => host(value) === official || host(value).endsWith(`.${official}`);
      if (!belongs(entry.payload.destinationUrl) || entry.payload.sourceKind === "vendor" && !belongs(entry.payload.sourceUrl)) fail(`${entry.slug} must link to its reviewed provider domain.`);
    }
  }
  return catalog;
}
