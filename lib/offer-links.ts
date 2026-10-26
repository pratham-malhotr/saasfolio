import type { SaaSDeal } from "@/lib/types";
import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";

export function publicHttpsUrl(value?: string): string | undefined {
  return normalizePublicHttpsUrl(value);
}

// Offer destinations take precedence over generic affiliate homepages. A coupon
// must not lose its plan, campaign, eligibility page, or query parameters.
export function getOfferDestination(deal: Pick<SaaSDeal, "destinationUrl" | "affiliateUrl" | "toolSlug">): string {
  return publicHttpsUrl(deal.destinationUrl) || publicHttpsUrl(deal.affiliateUrl) || `/go/${deal.toolSlug}`;
}

export function getOfferHref(deal: Pick<SaaSDeal, "slug">): string {
  return `/go/${encodeURIComponent(deal.slug)}`;
}

export function offerActionLabel(deal: Pick<SaaSDeal, "dealType" | "code">): string {
  if (deal.dealType === "pricing") return "View pricing";
  if (deal.dealType === "free_plan") return "View free plan";
  if (deal.dealType === "free_trial") return "View free trial";
  return deal.code ? "Use code at provider" : "View offer";
}

export function offerLabel(deal: Pick<SaaSDeal, "discountPercentage" | "discountKind" | "dealType" | "code">): string {
  if (deal.discountPercentage > 0) return `${deal.discountKind === "up-to" ? "UP TO " : ""}${deal.discountPercentage}% OFF`;
  if (deal.code) return "PROMO CODE";
  if (deal.dealType === "free_plan") return "FREE PLAN";
  if (deal.dealType === "free_trial") return "FREE TRIAL";
  if (deal.dealType === "pricing") return "VIEW PRICING";
  return "VIEW OFFER";
}

export function offerStatus(deal: Pick<SaaSDeal, "checkedAt" | "sourceKind" | "dealType">): string {
  if (!deal.checkedAt || deal.dealType === "pricing") return "Check current vendor terms";
  if (deal.sourceKind === "coupon-site") return "Reported by coupon source; not checkout tested";
  return deal.sourceKind === "vendor" ? "Vendor source checked; not checkout tested" : "Recorded source check; not checkout tested";
}
