import type { DetailedTool } from "@/lib/types";
import { buildDiscountGuides, buildPurchaseChecks } from "@/lib/data/discount-guide-builder";
import { MEETING_DISCOUNT_ENTRIES } from "@/lib/data/meeting-discount-guides";
import { PRODUCTIVITY_DISCOUNT_ENTRIES } from "@/lib/data/productivity-discount-guides";
import { RESEARCH_MARKETING_DISCOUNT_ENTRIES } from "@/lib/data/research-marketing-discount-guides";

export const DISCOUNT_EXPANSION_ENTRIES = [
  ...MEETING_DISCOUNT_ENTRIES,
  ...PRODUCTIVITY_DISCOUNT_ENTRIES,
  ...RESEARCH_MARKETING_DISCOUNT_ENTRIES,
];

export const NEW_DISCOUNT_BRAND_SLUGS = DISCOUNT_EXPANSION_ENTRIES.filter(entry => entry.profile.isNew).map(entry => entry.slug);
export const NEW_DISCOUNT_GUIDES = buildDiscountGuides(DISCOUNT_EXPANSION_ENTRIES);
export const NEW_DISCOUNT_PURCHASE_CHECKS = buildPurchaseChecks(DISCOUNT_EXPANSION_ENTRIES);

// Editorial/generator source only. Browser-facing catalog code imports the
// compact file emitted by catalog:expand instead of these complete guides.
export type DiscountReviewedProfileCopy = Pick<DetailedTool,
  "name" | "website" | "pricingUrl" | "updatedAt" | "pricingModel" | "tagline" | "description" | "longDescription" | "keyFeatures">;

export const NEW_REVIEWED_BRAND_COPY: Record<string, DiscountReviewedProfileCopy> = Object.fromEntries(DISCOUNT_EXPANSION_ENTRIES.map(entry => [entry.slug, {
  name: entry.name, website: new URL(entry.url).origin, pricingUrl: entry.url,
  updatedAt: `${entry.reviewedAt}T00:00:00.000Z`, pricingModel: entry.profile.pricingModel,
  tagline: entry.profile.description, description: entry.profile.description,
  longDescription: `${entry.profile.description}\n\nCompare ${entry.profile.features.join(", ").toLowerCase()} against the work you need to complete. Evaluate the relevant plan, people and usage before committing to a subscription.\n\nThe original discount guide explains provider-published savings, code availability, eligibility and redemption. Follow the official sources for the current invoice and renewal conditions.`,
  keyFeatures: entry.profile.features,
}]));
