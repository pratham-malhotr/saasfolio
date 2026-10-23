import type { SaaSDeal } from "@/lib/types";

export function publicHttpsUrl(value?: string): string | undefined {
  try {
    if (!value) return undefined;
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || !url.hostname.includes(".") ||
      /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) ||
      /\.(local|internal|test)$/.test(url.hostname)) return undefined;
    return url.toString();
  } catch { return undefined; }
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
  return deal.sourceKind === "coupon-site" ? "Reported by coupon source; not checkout tested" : "Vendor source checked; not checkout tested";
}
