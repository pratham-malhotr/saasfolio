import { CATEGORIES } from "@/lib/catalog-categories";

export const BRAND_PRICING_MODELS = ["Paid", "Freemium", "Free Trial", "Open Source"] as const;
export const BRAND_RELATIONSHIPS = ["Founder / owner", "Team member", "Agency / representative", "Community recommendation"] as const;

export function brandDraftFromSubmission(payload: Record<string, unknown>) {
  const name = String(payload.toolName || "");
  const slug = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/, "");
  return {
    slug,
    payload: {
      name, website: String(payload.websiteUrl || ""), pricingUrl: String(payload.pricingUrl || ""),
      categorySlug: CATEGORIES.find(category => category.slug === payload.categorySlug || category.name === payload.category)?.slug || "ai-tools",
      description: String(payload.tagline || ""), longDescription: String(payload.differentiator || ""),
      keyFeatures: Array.isArray(payload.keyFeatures) ? payload.keyFeatures : [],
      pricingModel: BRAND_PRICING_MODELS.includes(payload.pricingModel as typeof BRAND_PRICING_MODELS[number]) ? payload.pricingModel : "Paid",
      // Submission is not an editorial review. An editor supplies the date.
      reviewedAt: "",
    },
  };
}
