import type { SaaSDeal } from "@/lib/types";
import { TOOLS_DATA, getToolBySlug } from "./tools-data";
import snapshot from "./offer-snapshot.json";
import aliases from "./legacy-deal-aliases.json";
import offerUrlHistory from "./offer-url-history.json";
import { publicHttpsUrl } from "@/lib/offer-links";
import { discoverVendorOffer } from "@/lib/offer-evidence.mjs";
import { MANAGED_CATALOG, MANAGED_OFFERS, MANAGED_OFFER_IDENTITIES, RETIRED_MANAGED_OFFERS } from "./managed-content";

const MAX_AGE = 14 * 24 * 60 * 60 * 1000;
type SourceOffer = { slug: string; toolSlug: string; title: string; dealType: string; discountPercentage: number; code?: string; sourceKind: string; sourceUrl: string; destinationUrl: string; sourceKey: string; evidence: string; checkedAt: string; updatedAt?: string; terms: string; expiryDate?: string; discountKind?: string; managedRevision?: number };
const managedSlugs = new Set(MANAGED_CATALOG.entries.filter(entry => entry.kind === "offer").map(entry => entry.slug));
const managedSources = snapshot.sources as Record<string, { status: string; checkedAt?: string; managedRevision?: number }>;
const managedOffers = (MANAGED_OFFERS as SourceOffer[]).flatMap(offer => {
  const source = managedSources[offer.sourceKey];
  if (source?.managedRevision === offer.managedRevision && source.status === "ok" && Date.parse(source.checkedAt || "") >= Date.parse(offer.checkedAt)) {
    return snapshot.offers.filter(item => item.slug === offer.slug) as SourceOffer[];
  }
  return [offer];
});
const checkedOffers: SaaSDeal[] = ([...snapshot.offers.filter(offer => !managedSlugs.has(offer.slug)), ...managedOffers] as SourceOffer[])
  .filter(offer => !RETIRED_MANAGED_OFFERS.has(offer.slug))
  .filter(offer => getToolBySlug(offer.toolSlug) && getToolBySlug(offer.toolSlug)?.providerStatus !== "unavailable" &&
    (!offer.sourceKey.startsWith("vendor:") || discoverVendorOffer(offer.evidence)?.type === offer.dealType) &&
    ![404, 410].includes((snapshot.sources as Record<string, { httpStatus?: number | null }>)[offer.sourceKey]?.httpStatus || 0) &&
    Date.parse(offer.checkedAt) <= Date.now() && Date.now() - Date.parse(offer.checkedAt) <= MAX_AGE &&
    (!("expiryDate" in offer) || !offer.expiryDate || Date.parse(String(offer.expiryDate)) > Date.now()) &&
    publicHttpsUrl(offer.destinationUrl))
  .map(offer => {
    const tool = getToolBySlug(offer.toolSlug)!;
    return {
      ...offer, id: `deal-${offer.slug}`, slug: offer.slug, toolSlug: tool.slug, toolName: tool.name,
      title: offer.title, description: `${offer.title}. ${tool.tagline}`,
      terms: offer.sourceKey.startsWith("vendor:") ? `Provider wording: “${offer.evidence}” ${offer.terms}` : offer.terms,
      dealType: offer.dealType as SaaSDeal["dealType"], category: tool.category, categorySlug: tool.categorySlug,
      discountKind: "discountKind" in offer && offer.discountKind === "up-to" ? "up-to" as const : undefined,
      affiliateUrl: offer.destinationUrl, expiryDate: "expiryDate" in offer ? String(offer.expiryDate || "") : "",
      verifiedAt: offer.checkedAt.slice(0, 10), successRate: 0, votesUp: 0, votesDown: 0, revealsCount: 0,
      sourceKind: offer.sourceKind as SaaSDeal["sourceKind"], checkoutTested: false, featured: true,
    };
  }).filter((offer, index, all) => all.findIndex(other => other.slug === offer.slug ||
    (other.toolSlug === offer.toolSlug && other.dealType === offer.dealType &&
     other.code === offer.code && other.sourceKey.startsWith("vendor:") && offer.sourceKey.startsWith("vendor:"))) === index);

// Brands without a sourced discount still have a useful, honest vendor link.
// These entries never advertise a code, percentage saving, or free subscription.
const pricingLinks: SaaSDeal[] = TOOLS_DATA.filter(tool => tool.providerStatus !== "unavailable").map(tool => ({
  id: `deal-${tool.slug}-pricing`, slug: `${tool.slug}-pricing`, toolSlug: tool.slug, toolName: tool.name,
  title: `Current ${tool.name} pricing and offers`, category: tool.category, categorySlug: tool.categorySlug,
  dealType: "pricing", discountPercentage: 0, description: `${tool.tagline} Visit the provider for current plans and any available promotions.`,
  terms: "No verified discount code is currently recorded for this brand. Prices, promotions, and eligibility are determined by the provider. An affiliate link alone does not apply a discount.",
  expiryDate: "", successRate: 0, votesUp: 0, votesDown: 0, revealsCount: 0, verifiedAt: "Not checkout tested",
  affiliateUrl: tool.pricingUrl || tool.website, destinationUrl: tool.pricingUrl || tool.website,
  sourceUrl: tool.pricingUrl || tool.website, sourceKind: "vendor", checkoutTested: false,
}));

function offerScore(offer: SaaSDeal): number {
  return (offer.code ? offer.sourceKind === "vendor" ? 100 : 60 : offer.dealType === "offer" ? 30 : 10) + offer.discountPercentage / 100;
}
export function getAllDeals(): SaaSDeal[] {
  const active = checkedOffers.filter(offer => Date.now() - Date.parse(offer.checkedAt!) <= MAX_AGE &&
    (!offer.expiryDate || Date.parse(offer.expiryDate) > Date.now())).sort((a, b) => offerScore(b) - offerScore(a));
  const activeBrands = new Set(active.map(offer => offer.toolSlug));
  return [...active, ...pricingLinks.filter(offer => !activeBrands.has(offer.toolSlug))];
}
export const DEALS_DATA: SaaSDeal[] = getAllDeals();
export function getHistoricOfferToolSlug(id: string): string | undefined {
  if (Object.hasOwn(MANAGED_OFFER_IDENTITIES, id)) return MANAGED_OFFER_IDENTITIES[id];
  if (Object.hasOwn(offerUrlHistory.offers, id)) return (offerUrlHistory.offers as Record<string, string>)[id];
  if (Object.hasOwn(aliases, id)) return (aliases as Record<string, string>)[id];
  return snapshot.offers.find(offer => id === offer.slug || id === `deal-${offer.slug}`)?.toolSlug;
}
// A known retired URL keeps its brand identity, but never becomes a fresh
// coupon or trial merely because another offer for that brand is available.
export function getRetiredOfferToolSlug(id: string): string | undefined {
  if (getAllDeals().some(deal => id === deal.slug || id === deal.id)) return undefined;
  const tool = getToolBySlug(getHistoricOfferToolSlug(id) || "");
  return tool && tool.providerStatus !== "unavailable" ? tool.slug : undefined;
}
export function getDealBySlug(slug: string): SaaSDeal | undefined {
  const current = getAllDeals();
  const exact = current.find(deal => deal.slug === slug || deal.id === slug);
  if (exact) return exact;
  const oldToolSlug = Object.hasOwn(aliases, slug) ? (aliases as Record<string, string>)[slug] : undefined;
  const oldOffer = snapshot.offers.find(offer => offer.slug === slug);
  const toolSlug = getToolBySlug(oldToolSlug || oldOffer?.toolSlug || "")?.slug;
  return toolSlug ? current.find(deal => deal.toolSlug === toolSlug && (!oldOffer || deal.dealType === oldOffer.dealType)) : pricingLinks.find(deal => deal.slug === slug);
}
export function getDealsByTool(toolSlug: string): SaaSDeal[] { return getAllDeals().filter(deal => deal.toolSlug === toolSlug); }
export function getDealsByCategory(categorySlug: string): SaaSDeal[] { return getAllDeals().filter(deal => deal.categorySlug === categorySlug); }
