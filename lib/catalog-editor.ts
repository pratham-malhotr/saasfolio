export type EditorField = { key: string; label: string; type?: string; choices?: string[]; children?: [string, string][]; minimum?: number };
const f = (key: string, label: string, type = "text"): EditorField => ({ key, label, type });
export const EDITOR_FIELDS: Record<string, EditorField[]> = {
  brand: [f("name", "Brand name"), f("categorySlug", "Category", "category"), f("website", "Official website", "url"), f("pricingUrl", "Official pricing source", "url"), f("description", "Short description", "long"), f("longDescription", "Original product and buying explanation", "long"), f("keyFeatures", "Features — one per line", "lines"), { key: "pricingModel", label: "Access model", choices: ["Paid", "Freemium", "Free Trial", "Open Source"] }, f("reviewedAt", "Actual review date", "date")],
  offer: [f("toolSlug", "Canonical brand slug"), f("title", "Offer title"), { key: "dealType", label: "Offer type", choices: ["coupon", "offer", "free_trial", "free_plan", "lifetime"] }, f("code", "Exact public code — coupons only"), f("discountPercentage", "Recorded percentage — use 0 for fixed-dollar or unspecified savings", "number"), { key: "discountKind", label: "Percentage scope", choices: ["exact", "up-to"] }, { key: "sourceKind", label: "Reporting source", choices: ["vendor", "coupon-site"] }, f("sourceUrl", "Public source URL", "url"), f("destinationUrl", "Provider destination", "url"), f("evidence", "Exact public evidence fragments — one per line", "lines"), f("terms", "Eligibility, billing and renewal conditions", "long"), f("expiryDate", "Published expiry including timezone — leave empty when none is given")],
  guide: [f("reviewedAt", "Actual review date", "date"), f("sourceUrl", "Official pricing or program source", "url"), f("searchTitle", "Search title including the brand"), f("metaDescription", "Search description — 70–155 characters", "long"), f("intro", "Introduction", "long"), f("summary", "Buying summary", "long"), f("bestDiscountAnswer", "Best eligible purchase route", "long"), { key: "billingModel", label: "Buying model", choices: ["subscription", "usage"] },
    { key: "decisionRows", label: "Buying routes", minimum: 3, children: [["option", "Route"], ["bestFor", "Suitable workflow"], ["check", "What to check"]] },
    { key: "sections", label: "Buying sections", minimum: 4, children: [["heading", "Heading"], ["text", "Original buying explanation"]] },
    f("redemptionSteps", "Four redemption steps — one per line", "lines"), f("relatedSlugs", "Related canonical guide slugs — one per line", "lines"),
    { key: "faqs", label: "Questions", minimum: 3, children: [["question", "Question"], ["answer", "Answer"]] }, f("sourceNotes", "Source and review notes — one per line", "lines"),
    { key: "sources", label: "Additional citations", children: [["label", "Source label"], ["url", "Public HTTPS URL"]] },
    { key: "savingsOptions", label: "Provider savings options", children: [["type", "Type: Annual billing, Team discount, Bundle discount, Education offer, Nonprofit discount or Organization offer"], ["saving", "Published saving"], ["terms", "Conditions"], ["sourceUrl", "Provider source URL"]] }],
};
export function blankCatalogEntry(kind: string): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  for (const field of EDITOR_FIELDS[kind]) {
    value[field.key] = field.children ? Array.from({ length: field.minimum || 0 }, () => Object.fromEntries(field.children!.map(([key]) => [key, ""]))) : field.type === "lines" ? field.key === "redemptionSteps" ? ["", "", "", ""] : [] : field.type === "number" ? 0 : field.choices?.[0] || "";
  }
  if (kind !== "offer") value.reviewedAt = new Date().toISOString().slice(0, 10);
  if (kind === "brand") value.categorySlug = "ai-tools";
  return value;
}
