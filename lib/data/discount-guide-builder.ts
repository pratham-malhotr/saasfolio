import type { BrandDiscountGuide, BrandSavingsOption } from "@/lib/data/brand-discount-guides";
import type { BrandPurchaseChecks } from "@/lib/data/brand-purchase-checks";
import type { DetailedTool } from "@/lib/types";

type Pair = [string, string];

export interface DiscountGuideEntry {
  slug: string;
  name: string;
  reviewedAt: string;
  url: string;
  meta: string;
  intro: string;
  summary: string;
  best: string;
  related: string[];
  options: [string, string, string][];
  sections: Pair[];
  redeem: string[];
  eligibility: Pair[];
  troubleshooting: Pair[];
  notes: string[];
  faqs: Pair[];
  savings?: BrandSavingsOption[];
  sources?: { label: string; url: string }[];
  billingModel?: "subscription" | "usage";
  profile: {
    isNew: boolean;
    categorySlug: string;
    pricingModel: DetailedTool["pricingModel"];
    description: string;
    features: string[];
  };
}

export function buildDiscountGuides(entries: DiscountGuideEntry[]): Record<string, BrandDiscountGuide> {
  return Object.fromEntries(entries.map(entry => [entry.slug, {
    reviewedAt: entry.reviewedAt, sourceUrl: entry.url,
    searchTitle: `${entry.name} Discounts & Coupon Codes`,
    metaDescription: entry.meta, intro: entry.intro, summary: entry.summary,
    bestDiscountAnswer: entry.best, billingModel: entry.billingModel,
    relatedSlugs: entry.related,
    decisionRows: entry.options.map(([option, bestFor, check]) => ({ option, bestFor, check })),
    sections: entry.sections.map(([heading, text]) => ({ heading, text })),
    redemptionSteps: entry.redeem, savingsOptions: entry.savings || [],
    sourceNotes: entry.notes, sources: entry.sources,
    faqs: entry.faqs.map(([question, answer]) => ({ question, answer })),
  }]));
}

export function buildPurchaseChecks(entries: DiscountGuideEntry[]): Record<string, BrandPurchaseChecks> {
  return Object.fromEntries(entries.map(entry => [entry.slug, {
    eligibility: entry.eligibility.map(([label, detail]) => ({ label, detail })),
    troubleshooting: entry.troubleshooting.map(([problem, action]) => ({ problem, action })),
  }]));
}
