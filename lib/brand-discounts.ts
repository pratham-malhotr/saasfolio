import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import snapshot from "@/lib/data/offer-snapshot.json";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import { BRAND_PURCHASE_CHECKS } from "@/lib/data/brand-purchase-checks";
import { summarize } from "@/lib/seo";
import type { DetailedTool, SaaSDeal } from "@/lib/types";
import type { DiscountSearchEntry } from "@/lib/discount-search";
import { DISCOUNT_BRAND_ALIASES } from "@/lib/data/brand-discount-aliases.mjs";
import { editorialGuideIssues } from "@/lib/editorial-quality.mjs";
import { evergreenPurchaseChecks } from "@/lib/brand-purchase-guidance";
import guideSourceChecks from "@/lib/data/guide-source-checks.json";
import { getAffiliateProgram } from "@/lib/data/affiliate-links";
import { GUIDE_FRESHNESS_DAYS, guideEvidenceDate } from "@/lib/guide-claims.mjs";

type GuideSourceCheck = { status: string; verifiedAt?: string; method?: string };
const sourceChecks = guideSourceChecks as Record<string, GuideSourceCheck>;

// The latest date a guide's observations were established: its editorial review,
// or a later automated check that found its stated figures on the official sources.
export function guideEvidenceAt(slug: string): string | undefined {
  const guide = BRAND_DISCOUNT_GUIDES[slug];
  const date = guideEvidenceDate(guide, sourceChecks[slug], Date.now());
  return Number.isFinite(date) ? new Date(date).toISOString() : undefined;
}

export function guideSourceVerifiedAt(slug: string): string | undefined {
  const check = sourceChecks[slug];
  const guide = BRAND_DISCOUNT_GUIDES[slug];
  if (check?.status !== "verified" || !check.verifiedAt || !guide) return undefined;
  return Date.parse(check.verifiedAt) > Date.parse(`${guide.reviewedAt}T00:00:00Z`) && Date.parse(check.verifiedAt) <= Date.now() ? check.verifiedAt : undefined;
}

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
  // A fetched code does not create a new editorial landing page by itself.
  const indexable = Boolean(guide && editorialGuideIssues(guide).length === 0);
  const evidenceAt = guide ? guideEvidenceAt(tool.slug) : undefined;
  const dates = [evidenceAt, ...offers.map(offer => offer.updatedAt || offer.checkedAt)].filter((date): date is string =>
    Boolean(date && Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now()));
  const modifiedAt = dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const reviewAge = evidenceAt ? Date.now() - Date.parse(evidenceAt) : NaN;
  const sourceNotesCurrent = reviewAge >= 0 && reviewAge <= GUIDE_FRESHNESS_DAYS * 86400000;
  const savingsOptions = sourceNotesCurrent ? guide?.savingsOptions || [] : [];
  const purchaseChecks = sourceNotesCurrent && BRAND_PURCHASE_CHECKS[tool.slug]
    ? BRAND_PURCHASE_CHECKS[tool.slug] : guide ? evergreenPurchaseChecks(tool, guide) : undefined;
  return { offers, coupons, savings, savingsOptions, purchaseChecks, guide, indexable, modifiedAt, sourceNotesCurrent, evidenceAt, sourceVerifiedAt: guideSourceVerifiedAt(tool.slug) };
}

export function getIndexableDiscountBrands() {
  const deals = getAllDeals();
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug) && getBrandDiscountData(tool, deals).indexable)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFeaturedDiscountBrands(limit = 12) {
  const brands = getIndexableDiscountBrands();
  // Keep the established editorial priorities discoverable from the homepage.
  // Fill the remaining places across categories.
  // Partner brands lead the list (labelled on their pages), then editorial priorities.
  const partners = brands.filter(tool => getAffiliateProgram(tool.slug)).map(tool => tool.slug);
  const priority = ["beehiiv", "predis-ai", "taplio", "baremetrics"];
  const featured = [...priority, ...partners.filter(slug => !priority.includes(slug)), ...["notion", "canva", "slack", "hostinger"]]
    .flatMap(slug => brands.filter(tool => tool.slug === slug));
  const remaining = brands.filter(tool => !featured.includes(tool));
  const seen = new Set(featured.map(tool => tool.categorySlug));
  const varied = remaining.filter(tool => {
    if (seen.has(tool.categorySlug)) return false;
    seen.add(tool.categorySlug);
    return true;
  });
  return [...featured, ...varied, ...remaining.filter(tool => !varied.includes(tool))].slice(0, limit);
}

// Send only a compact directory to interactive search, never the guide corpus.
export function getDiscountSearchEntries(): DiscountSearchEntry[] {
  const all = getIndexableDiscountBrands();
  const featured = getFeaturedDiscountBrands();
  const deals = getAllDeals();
  return [...featured, ...all.filter(tool => !featured.some(item => item.slug === tool.slug))].map(tool => {
    const data = getBrandDiscountData(tool, deals);
    const deadlines = data.offers.flatMap(offer => [
      offer.checkedAt ? Date.parse(offer.checkedAt) + 14 * 86400000 : NaN,
      offer.expiryDate ? Date.parse(offer.expiryDate) : NaN,
    ]).filter(Number.isFinite);
    if (data.sourceNotesCurrent && data.evidenceAt) deadlines.push(Date.parse(data.evidenceAt) + GUIDE_FRESHNESS_DAYS * 86400000);
    return {
      slug: tool.slug, name: tool.name, category: tool.category,
      aliases: Object.entries(DISCOUNT_BRAND_ALIASES).filter(([, slug]) => slug === tool.slug).map(([alias]) => alias),
      summary: brandSavingsSummary(tool, deals), couponCount: data.coupons.length,
      freshUntil: deadlines.length ? Math.min(...deadlines) : undefined,
    };
  });
}

export function brandSavingsSummary(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { coupons, savings, savingsOptions, offers } = getBrandDiscountData(tool, catalogDeals);
  if (coupons.length) return `${coupons.length} sourced coupon ${coupons.length === 1 ? "code" : "codes"}; check eligibility`;
  if (getAffiliateProgram(tool.slug)?.code) return "SaaSFolio partner code available";
  if (savings.length) return "Sourced discounts available; compare offer terms";
  if (savingsOptions.length) return savingsOptions[0].saving;
  if (offers.some(offer => offer.dealType === "free_trial")) return "Free trial listed; compare paid billing options";
  if (offers.some(offer => offer.dealType === "free_plan")) return "Free plan listed; compare upgrade costs";
  return "Compare billing options and coupon availability";
}

export function brandDiscountTitle(tool: DetailedTool): string {
  return BRAND_DISCOUNT_GUIDES[tool.slug]?.searchTitle || `${tool.name} Discounts & Coupon Codes`;
}

const SAVING_AUDIENCE: Record<string, string> = {
  "Annual billing": "Annual Plans", "Education offer": "for Students", "Nonprofit discount": "for Nonprofits",
  "Team discount": "for Teams", "Bundle discount": "Bundles", "Organization offer": "",
};

// Who a sourced offer is for, so a restricted saving is never shown as general.
function offerAudience(offer: SaaSDeal): string {
  const text = `${offer.slug} ${offer.title}`.toLowerCase();
  if (/non-?profit|charit|community cloud/.test(text)) return "for Nonprofits";
  if (/student|education|academic/.test(text)) return "for Students";
  if (/startup|early[- ]stage/.test(text)) return "for Startups";
  if (/annual|yearly|prepaid/.test(text)) return "Annual Plans";
  if (/introductory|intro|first[- ](?:term|year|month)|new[- ]license/.test(text)) return "First Term";
  return "";
}

// The strongest sourced saving, phrased the way people search for it.
export function brandHeadlineSaving(tool: DetailedTool, catalogDeals = getAllDeals()): string | undefined {
  const { offers, savingsOptions } = getBrandDiscountData(tool, catalogDeals);
  const best = offers.filter(offer => offer.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  if (best) return `${best.discountKind === "up-to" ? "Up to " : ""}${best.discountPercentage}% Off ${offerAudience(best)}`.trim();
  const partnerSaving = getAffiliateProgram(tool.slug)?.codeSaving;
  if (partnerSaving) return partnerSaving;
  for (const option of savingsOptions) {
    const percent = option.saving.match(/(up to\s+)?(\d+(?:\.\d+)?)\s?%/i);
    if (percent) return `${percent[1] ? "Up to " : ""}${percent[2]}% Off ${SAVING_AUDIENCE[option.type] || ""}`.trim();
    const months = option.saving.match(/\b(\w+) months? free\b/i);
    if (months) return `${months[1][0].toUpperCase()}${months[1].slice(1)} Months Free ${option.type === "Annual billing" ? "on Annual Plans" : SAVING_AUDIENCE[option.type] || ""}`.trim();
  }
  return undefined;
}

// Search title: the sourced value first, then the month the evidence was last
// confirmed. The date is shown only while that evidence is inside its window.
export function brandSearchTitle(tool: DetailedTool, catalogDeals = getAllDeals(), now = Date.now()): string {
  const { modifiedAt, coupons, sourceNotesCurrent, offers } = getBrandDiscountData(tool, catalogDeals);
  const freshOffer = offers.some(offer => offer.checkedAt && now - Date.parse(offer.checkedAt) <= 14 * 86400000);
  const dated = modifiedAt && (sourceNotesCurrent || freshOffer) && now - Date.parse(modifiedAt) <= 30 * 86400000
    ? ` (${new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(Date.parse(modifiedAt))})` : "";
  const saving = brandHeadlineSaving(tool, catalogDeals);
  const kind = coupons.length || getAffiliateProgram(tool.slug)?.code ? "Discount Code" : "Discount";
  const candidates = [
    saving && `${tool.name} ${kind}: ${saving}${dated}`,
    saving && `${tool.name} ${kind}: ${saving}`,
    `${brandDiscountTitle(tool)}${dated}`,
    `${tool.name} Discounts & Coupon Codes${dated}`,
    brandDiscountTitle(tool),
  ].filter((title): title is string => Boolean(title));
  // Leave room for " | SaaSFolio" inside a typical result-title width.
  return candidates.find(title => title.length <= 62) || candidates.at(-1)!;
}

export function brandBestDiscountAnswer(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { guide, sourceNotesCurrent, coupons, savingsOptions } = getBrandDiscountData(tool, catalogDeals);
  if (coupons.length) return `Compare ${coupons.length === 1 ? "the sourced code" : "the sourced codes"} below with ${tool.name}'s direct billing options for the same package. ${coupons.map(offer => `${offer.code}: ${offer.terms}`).join(" ")} Choose by the final eligible invoice and continuing cost; the largest headline percentage is not automatically the best offer for your account.`;
  if (sourceNotesCurrent && guide?.bestDiscountAnswer) return guide.bestDiscountAnswer;
  if (guide?.summary) return `${guide.summary} Compare current plans for the same features and usage, including the cost at renewal.`;
  const options = coupons.length || savingsOptions.length ? "Compare the sourced options above" : "Check the provider's current options";
  return `${options} for the ${tool.name} package you need. Match the account, usage and billing period, include any access fee or add-ons, and compare the full payable and renewal amounts. The largest advertised percentage is not necessarily the lowest eligible total.`;
}

export function brandDiscountAnswer(tool: DetailedTool, catalogDeals = getAllDeals()): string {
  const { coupons, savingsOptions, offers } = getBrandDiscountData(tool, catalogDeals);
  if (coupons.length) return `${coupons.length} sourced ${tool.name} ${coupons.length === 1 ? "coupon code is" : "coupon codes are"} listed below. Match each code to the eligible product, account and billing period. Acceptance has not been tested at checkout.`;
  const partnerCode = getAffiliateProgram(tool.slug)?.code;
  if (partnerCode) return `SaaSFolio's ${tool.name} partner code is ${partnerCode}${getAffiliateProgram(tool.slug)?.codeSaving ? `, which gives ${getAffiliateProgram(tool.slug)!.codeSaving!.toLowerCase()} according to ${tool.name}'s partner program` : ""}. Open ${tool.name} through the partner link and enter the code at checkout; ${tool.name} shows the discount it applies before you pay. No separate public ${tool.name} coupon is recorded in our sourced catalog. ${savingsOptions.length ? `Published savings options also include: ${savingsOptions.map(option => option.saving).join("; ")}.` : ""}`.trim();
  if (savingsOptions.length) return `${tool.name} savings options published by the provider include: ${savingsOptions.map(option => option.saving).join("; ")}. No separate public coupon code is recorded in our current catalog. Review eligibility and the full renewal cost before paying.`;
  return `No current ${tool.name} coupon code is recorded. ${offers.length ? "Any sourced free plans or trials below are separate from a discount on a paid subscription." : "Check official pricing for current plans and available promotions."} A referral link alone does not establish a saving.`;
}

export function brandDiscountDescription(tool: DetailedTool, offers: SaaSDeal[]): string {
  const { guide, sourceNotesCurrent } = getBrandDiscountData(tool, offers);
  const editorialDescription = sourceNotesCurrent ? guide?.metaDescription : undefined;
  if (editorialDescription) return summarize(editorialDescription, 155);
  const codes = offers.filter(offer => offer.code).length;
  const status = codes ? `${codes} sourced ${codes === 1 ? "code" : "codes"}, offer terms` : "Coupon availability, free options";
  return summarize(`${tool.name} discounts: ${status}, billing choices and how to claim. Compare sources and eligibility before you pay.`, 155);
}

export function getBrandDiscountFaqs(tool: DetailedTool, offers: SaaSDeal[]) {
  const codes = offers.filter(offer => offer.code);
  const { guide, savingsOptions, sourceNotesCurrent } = getBrandDiscountData(tool, offers);
  return [
    { question: `Is there a ${tool.name} discount code available?`, answer: !codes.length && getAffiliateProgram(tool.slug)?.code
      ? `Yes. SaaSFolio's ${tool.name} partner code is ${getAffiliateProgram(tool.slug)!.code}${getAffiliateProgram(tool.slug)?.codeSaving ? ` (${getAffiliateProgram(tool.slug)!.codeSaving!.toLowerCase()})` : ""}, supplied through ${tool.name}'s affiliate program. Enter it at ${tool.name} checkout; the provider confirms the discount before payment. It has not been checkout tested by SaaSFolio.`
      : codes.length
      ? `${codes.length} sourced ${codes.length === 1 ? "code is" : "codes are"} recorded above. Each listing identifies the publisher, source check date, and terms. Acceptance has not been tested at checkout; the provider determines eligibility.`
      : `No current ${tool.name} coupon code is recorded in our catalog. ${offers.length ? "The offers above are separately labeled, including any free plans or trials." : "Check the official provider for current pricing and promotions."} A referral link alone does not guarantee a discount.` },
    ...(savingsOptions.length ? [{
      question: `What ${tool.name} savings options does the provider publish?`,
      answer: `The reviewed provider sources describe these options: ${savingsOptions.map(option => `${option.saving}. ${option.terms}`).join(" ")} Each option has its own billing, code or eligibility requirements. Follow the linked provider terms and any application or redemption process.`,
    }] : []),
    ...((sourceNotesCurrent ? guide?.faqs : undefined) || [
      { question: `How do I apply a ${tool.name} coupon?`, answer: "Open the offer details and review the eligible products, billing period, and customer restrictions. Follow the provider link, enter the recorded code if required, and confirm the final price and renewal cost before payment." },
      { question: `Can I combine ${tool.name} offers?`, answer: "Do not assume offers can be combined. Check the provider's rules for sale prices, coupon stacking, regional restrictions, and new-customer eligibility." },
    ]),
  ];
}
