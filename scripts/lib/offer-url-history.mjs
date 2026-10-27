// URL identity outlives the source evidence that made an offer publishable.
// This registry stores only exact recorded identifiers and their brand, never
// coupon terms, freshness, eligibility, or an assertion that an offer is active.
const segment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyOfferUrlHistory() {
  return {
    version: 1,
    origins: {
      description: "Exact legacy alias keys and offer slugs/deal IDs recorded in tracked offer-snapshot.json revisions or subsequent source refreshes. Brand aliases resolve to the current canonical profile where available. No active-offer claims are retained.",
      legacyAliases: "lib/data/legacy-deal-aliases.json",
      snapshotCommits: [],
    },
    offers: {},
  };
}

export function validateOfferUrlHistory(history) {
  if (history?.version !== 1 || !history.origins || !Array.isArray(history.origins.snapshotCommits) ||
      !history.offers || typeof history.offers !== "object" || Array.isArray(history.offers)) {
    throw new Error("Invalid offer URL history; refusing to discard known URL identities");
  }
  for (const [id, brand] of Object.entries(history.offers)) {
    if (!segment.test(id) || typeof brand !== "string" || !segment.test(brand)) {
      throw new Error("Invalid offer URL history identifier");
    }
  }
  return history;
}

export function rememberOfferIdentifiers(history, identifiers, canonicalize = slug => slug) {
  validateOfferUrlHistory(history);
  for (const [id, recordedBrand] of identifiers) {
    if (typeof id !== "string" || !segment.test(id) || typeof recordedBrand !== "string" || !segment.test(recordedBrand)) {
      throw new Error("Offer URL history requires an exact safe identifier and brand slug");
    }
    const brand = canonicalize(recordedBrand) || recordedBrand;
    if (!segment.test(brand)) throw new Error("Invalid canonical offer brand");
    const previous = Object.hasOwn(history.offers, id) ? history.offers[id] : undefined;
    if (previous && (canonicalize(previous) || previous) !== brand) {
      throw new Error(`Conflicting historical brand for offer identifier: ${id}`);
    }
    history.offers[id] = brand;
  }
  history.offers = Object.fromEntries(Object.entries(history.offers).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return history;
}

export function rememberOfferUrls(history, offers, canonicalize) {
  return rememberOfferIdentifiers(history, offers.flatMap(offer => [
    [offer.slug, offer.toolSlug],
    [`deal-${offer.slug}`, offer.toolSlug],
  ]), canonicalize);
}
