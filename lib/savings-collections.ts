import { getAllDeals } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";
import { publicHttpsUrl } from "@/lib/offer-links";
import { SAVINGS_COLLECTIONS, type SavingsCollectionSlug } from "@/lib/data/savings-collections";
import type { SaaSDeal } from "@/lib/types";

const REVIEW_WINDOW = 14 * 24 * 60 * 60 * 1000;

// Explicit membership prevents a generic free trial or annual plan from being
// relabelled as a student, startup or nonprofit benefit for the same vendor.
export const COLLECTION_OFFER_SLUGS: Record<Exclude<SavingsCollectionSlug, "coupon-codes">, readonly string[]> = {
  "startup-deals": ["notion-startup-program", "hubspot-startup-program", "digitalocean-hatch-startup-program", "fibery-startup-pro-access", "linear-partner-startup-business", "sentry-startup-credits", "rootly-startup-program", "intercom-early-stage-year-one"],
  "student-discounts": ["github-student-developer-pack", "adobe-creative-cloud-education-offer"],
  "nonprofit-discounts": ["asana-nonprofit-program", "airtable-nonprofit-team", "monday-nonprofit-additional-seats", "jira-community-cloud", "confluence-community-cloud", "trello-nonprofit-program", "smartsuite-organization-program", "baserow-organization-program", "dropbox-organization-program", "nifty-nonprofit-education", "microsoft-365-nonprofit-program"],
};

export function getPublishedSavingsOffers(deals: SaaSDeal[] = getAllDeals(), now = Date.now()) {
  return deals.filter(deal => {
    const checkedAt = Date.parse(deal.checkedAt || "");
    const expiry = deal.expiryDate ? Date.parse(deal.expiryDate) : undefined;
    return deal.dealType !== "pricing" && ["vendor", "coupon-site"].includes(deal.sourceKind || "") && publicHttpsUrl(deal.sourceUrl) &&
      publicHttpsUrl(deal.destinationUrl || deal.affiliateUrl) &&
      Number.isFinite(checkedAt) && checkedAt <= now && now - checkedAt <= REVIEW_WINDOW &&
      (expiry === undefined || Number.isFinite(expiry) && expiry > now);
  });
}

export function getCollectionOffers(slug: SavingsCollectionSlug, deals: SaaSDeal[] = getAllDeals(), now = Date.now()) {
  const current = getPublishedSavingsOffers(deals, now);
  if (slug === "coupon-codes") return current.filter(deal => Boolean(deal.code?.trim()));
  const included = new Set(COLLECTION_OFFER_SLUGS[slug]);
  return current.filter(deal => included.has(deal.slug));
}

export function getCollectionPrograms(slug: SavingsCollectionSlug) {
  const guideSlugs = new Set(getIndexableDiscountBrands().map(tool => tool.slug));
  return (SAVINGS_COLLECTIONS.find(collection => collection.slug === slug)?.programs || []).flatMap(program => {
    const tool = getToolBySlug(program.brandSlug);
    if (!tool || tool.providerStatus === "unavailable") return [];
    return [{ ...program, path: `/${guideSlugs.has(tool.slug) ? "discounts" : "tools"}/${tool.slug}`, hasGuide: guideSlugs.has(tool.slug) }];
  });
}

export function getBrandCollectionLinks(brandSlug: string) {
  return SAVINGS_COLLECTIONS.filter(collection => collection.programs.some(program => program.brandSlug === brandSlug))
    .map(collection => ({ label: collection.navLabel, href: `/${collection.slug}` }));
}
