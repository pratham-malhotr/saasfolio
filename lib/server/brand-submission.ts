import "server-only";
import { CATEGORIES } from "@/lib/catalog-categories";
import { BRAND_PRICING_MODELS, BRAND_RELATIONSHIPS } from "@/lib/brand-submission";
import { email, HttpError, text, website } from "@/lib/server/http";

export function readBrandSubmission(data: Record<string, unknown>) {
  if (data.consent !== true) throw new HttpError(400, "Please agree to the submission and privacy terms.");
  const categorySlug = text(data, "categorySlug", 1, 100);
  const category = CATEGORIES.find(item => item.slug === categorySlug);
  if (!category) throw new HttpError(400, "Choose a listed software category.");
  const pricingModel = text(data, "pricingModel", 1, 40);
  const relationship = text(data, "relationship", 1, 50);
  if (!BRAND_PRICING_MODELS.some(value => value === pricingModel)) throw new HttpError(400, "Choose a supported pricing model.");
  if (!BRAND_RELATIONSHIPS.some(value => value === relationship)) throw new HttpError(400, "Choose your relationship to the brand.");
  if (!Array.isArray(data.keyFeatures) || data.keyFeatures.length < 3 || data.keyFeatures.length > 8) throw new HttpError(400, "Include between three and eight product features.");
  const keyFeatures = data.keyFeatures.map(feature => text({ feature }, "feature", 5, 160));
  if (new Set(keyFeatures.map(value => value.toLowerCase())).size !== keyFeatures.length) throw new HttpError(400, "Describe distinct product features.");
  return {
    address: email(data, "founderEmail"),
    payload: {
      submissionType: "brand", toolName: text(data, "toolName", 2, 100),
      websiteUrl: website(data, "websiteUrl"), pricingUrl: website(data, "pricingUrl"),
      tagline: text(data, "tagline", 60, 300), differentiator: text(data, "differentiator", 200, 8000),
      categorySlug, category: category.name, pricingModel, keyFeatures,
      contactName: text(data, "contactName", 2, 100), relationship,
      reviewStatus: "pending", consent: true, submittedAt: new Date().toISOString(),
    },
  };
}
