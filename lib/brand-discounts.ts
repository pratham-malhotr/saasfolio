import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import snapshot from "@/lib/data/offer-snapshot.json";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import { BRAND_PURCHASE_CHECKS } from "@/lib/data/brand-purchase-checks";
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
  const reviewAge = guide ? Date.now() - Date.parse(`${guide.reviewedAt}T00:00:00Z`) : NaN;
  const sourceNotesCurrent = reviewAge >= 0 && reviewAge <= 30 * 86400000;
  const savingsOptions = sourceNotesCurrent ? guide?.savingsOptions || [] : [];
  const purchaseChecks = sourceNotesCurrent ? BRAND_PURCHASE_CHECKS[tool.slug] : undefined;
  return { offers, coupons, savings, savingsOptions, purchaseChecks, guide, indexable, modifiedAt, sourceNotesCurrent };
}

export function getIndexableDiscountBrands() {
  const deals = getAllDeals();
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug) && getBrandDiscountData(tool, deals).indexable)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFeaturedDiscountBrands(limit = 8) {
  const brands = getIndexableDiscountBrands();
  // Give different software categories space before repeating a category.
  // Alphabetical selection is independent of affiliate links or commission.
  const seen = new Set<string>();
  const varied = brands.filter(tool => {
    if (seen.has(tool.categorySlug)) return false;
    seen.add(tool.categorySlug);
    return true;
  });
  return [...varied, ...brands.filter(tool => !varied.includes(tool))].slice(0, limit);
}

export function brandSavingsSummary(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { coupons, savings, savingsOptions, offers } = getBrandDiscountData(tool, catalogDeals);
  if (coupons.length) return `${coupons.length} sourced coupon ${coupons.length === 1 ? "code" : "codes"}; check eligibility`;
  if (savings.length) return "Sourced discounts available; compare offer terms";
  if (savingsOptions.length) return savingsOptions[0].saving;
  if (offers.some(offer => offer.dealType === "free_trial")) return "Free trial listed; compare paid billing options";
  if (offers.some(offer => offer.dealType === "free_plan")) return "Free plan listed; compare upgrade costs";
  return "Compare billing options and coupon availability";
}

export function brandDiscountTitle(tool: DetailedTool): string {
  return BRAND_DISCOUNT_GUIDES[tool.slug]?.searchTitle || `${tool.name} Discounts & Coupon Codes`;
}

export function brandBestDiscountAnswer(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { guide, sourceNotesCurrent, coupons, savingsOptions } = getBrandDiscountData(tool, catalogDeals);
  if (sourceNotesCurrent && guide?.bestDiscountAnswer) return guide.bestDiscountAnswer;
  if (guide?.summary) return guide.summary;
  const options = coupons.length || savingsOptions.length ? "Compare the sourced options above" : "Check the provider's current options";
  return `${options} for the ${tool.name} package you need. Match the account, usage and billing period, include any access fee or add-ons, and compare the full payable and renewal amounts. The largest advertised percentage is not necessarily the lowest eligible total.`;
}

export function brandDiscountAnswer(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { coupons, savingsOptions, offers } = getBrandDiscountData(tool, catalogDeals);
  if (coupons.length) return `${coupons.length} sourced ${tool.name} ${coupons.length === 1 ? "coupon code is" : "coupon codes are"} listed below. Match each code to the eligible product, account and billing period. Acceptance has not been tested at checkout.`;
  if (savingsOptions.length) return `${tool.name} savings options published by the provider include: ${savingsOptions.map(option => option.saving).join("; ")}. No separate public coupon code is recorded in our current catalog. Review eligibility and the full renewal cost before paying.`;
  return `No current ${tool.name} coupon code is recorded. ${offers.length ? "Any sourced free plans or trials below are separate from a discount on a paid subscription." : "Check official pricing for current plans and available promotions."} A referral link alone does not establish a saving.`;
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
  const { savingsOptions } = getBrandDiscountData(tool, offers);
  return [
    { question: `Is there a ${tool.name} discount code available?`, answer: codes.length
      ? `${codes.length} sourced ${codes.length === 1 ? "code is" : "codes are"} recorded above. Each listing identifies the publisher, source check date, and terms. Acceptance has not been tested at checkout; the provider determines eligibility.`
      : `No current ${tool.name} coupon code is recorded in our catalog. ${offers.length ? "The offers above are separately labeled, including any free plans or trials." : "Check the official provider for current pricing and promotions."} A referral link alone does not guarantee a discount.` },
    ...(savingsOptions.length ? [{
      question: `Can I save on ${tool.name} without a coupon code?`,
      answer: `The reviewed provider sources describe these options: ${savingsOptions.map(option => `${option.saving}. ${option.terms}`).join(" ")} These are billing or eligibility programs, separate from a public coupon listing. Follow any provider application or redemption process.`,
    }] : []),
    ...(BRAND_DISCOUNT_GUIDES[tool.slug]?.faqs || [
      { question: `How do I apply a ${tool.name} coupon?`, answer: "Open the offer details and review the eligible products, billing period, and customer restrictions. Follow the provider link, enter the recorded code if required, and confirm the final price and renewal cost before payment." },
      { question: `Can I combine ${tool.name} offers?`, answer: "Do not assume offers can be combined. Check the provider's rules for sale prices, coupon stacking, regional restrictions, and new-customer eligibility." },
    ]),
  ];
}
