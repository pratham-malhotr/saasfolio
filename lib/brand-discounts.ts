import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import snapshot from "@/lib/data/offer-snapshot.json";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import { summarize } from "@/lib/seo";
import type { DetailedTool, SaaSDeal } from "@/lib/types";

const establishedBrands = new Set(snapshot.offers.filter(offer =>
  (offer.discountPercentage > 0 || ("code" in offer && offer.code)) && offer.sourceUrl && offer.evidence
).map(offer => offer.toolSlug));

export function hasBrandDiscountPage(slug: string): boolean {
  return Boolean(BRAND_DISCOUNT_GUIDES[slug]) || establishedBrands.has(slug);
}

export function getBrandDiscountData(tool: DetailedTool, catalogDeals = getAllDeals()) {
  const offers = catalogDeals.filter(deal => deal.toolSlug === tool.slug && deal.dealType !== "pricing");
  const coupons = offers.filter(offer => offer.code);
  const savings = offers.filter(offer => offer.discountPercentage > 0);
  const guide = BRAND_DISCOUNT_GUIDES[tool.slug];
  const indexable = Boolean(guide || coupons.length || savings.length);
  const dates = [guide?.reviewedAt ? `${guide.reviewedAt}T00:00:00.000Z` : undefined,
    ...offers.map(offer => offer.updatedAt || offer.checkedAt)].filter((date): date is string =>
    Boolean(date && Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now()));
  const modifiedAt = dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const sourceNotesCurrent = Boolean(guide && Date.now() - Date.parse(`${guide.reviewedAt}T00:00:00Z`) <= 30 * 86400000);
  return { offers, coupons, savings, guide, indexable, modifiedAt, sourceNotesCurrent };
}

export function getIndexableDiscountBrands() {
  const deals = getAllDeals();
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug) && getBrandDiscountData(tool, deals).indexable)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function brandDiscountTitle(tool: DetailedTool): string {
  return BRAND_DISCOUNT_GUIDES[tool.slug]?.searchTitle || `${tool.name} Discounts & Coupon Codes`;
}

export function brandDiscountDescription(tool: DetailedTool, offers: SaaSDeal[]): string {
  const editorialDescription = BRAND_DISCOUNT_GUIDES[tool.slug]?.metaDescription;
  if (editorialDescription) return summarize(editorialDescription, 155);
  const codes = offers.filter(offer => offer.code).length;
  const status = codes ? `${codes} sourced ${codes === 1 ? "code" : "codes"}, offer terms` : "Coupon availability, free options";
  return summarize(`${tool.name} discounts: ${status}, billing choices and how to claim. Compare sources and eligibility before you pay.`, 155);
}

export function getBrandDiscountFaqs(tool: DetailedTool, offers: SaaSDeal[]) {
  const codes = offers.filter(offer => offer.code);
  return [
    { question: `Is there a ${tool.name} discount code available?`, answer: codes.length
      ? `${codes.length} sourced ${codes.length === 1 ? "code is" : "codes are"} recorded above. Each listing identifies the publisher, source check date, and terms. Acceptance has not been tested at checkout; the provider determines eligibility.`
      : `No current ${tool.name} coupon code is recorded in our catalog. ${offers.length ? "The offers above are separately labeled, including any free plans or trials." : "Check the official provider for current pricing and promotions."} A referral link alone does not guarantee a discount.` },
    ...(BRAND_DISCOUNT_GUIDES[tool.slug]?.faqs || [
      { question: `How do I apply a ${tool.name} coupon?`, answer: "Open the offer details and review the eligible products, billing period, and customer restrictions. Follow the provider link, enter the recorded code if required, and confirm the final price and renewal cost before payment." },
      { question: `Can I combine ${tool.name} offers?`, answer: "Do not assume offers can be combined. Check the provider's rules for sale prices, coupon stacking, regional restrictions, and new-customer eligibility." },
    ]),
  ];
}
