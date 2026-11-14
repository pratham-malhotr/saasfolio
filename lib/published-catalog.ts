import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import { EDITORIAL_TOOL_NOTES } from "@/lib/data/editorial-tool-notes";
import { REVIEWED_BRAND_COPY } from "@/lib/data/reviewed-brand-tools";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import type { PublicSearchCatalog } from "@/lib/search-catalog-types";
import { editorialGuideIssues } from "@/lib/editorial-quality.mjs";
import type { DetailedTool, SaaSDeal } from "@/lib/types";
import { MANAGED_BRANDS } from "@/lib/data/managed-content";

// Publication is an editorial decision, independent of word count, commissions
// and the existence of a generated record or an automatically fetched offer.
export function hasPublishedToolProfile(slug: string): boolean {
  const tool = getToolBySlug(slug);
  if (!tool || tool.providerStatus === "unavailable") return false;
  const guide = BRAND_DISCOUNT_GUIDES[tool.slug];
  return Boolean(MANAGED_BRANDS.some(brand => brand.slug === tool.slug && brand.providerStatus !== "unavailable") || EDITORIAL_TOOL_NOTES[tool.slug] || guide && editorialGuideIssues(guide).length === 0);
}

export function getPublishedTool(slug: string): DetailedTool | undefined {
  const tool = getToolBySlug(slug);
  if (!tool || !hasPublishedToolProfile(tool.slug)) return undefined;
  const notes = EDITORIAL_TOOL_NOTES[tool.slug];
  const guide = BRAND_DISCOUNT_GUIDES[tool.slug];
  const editorialCopy = !notes && !REVIEWED_BRAND_COPY[tool.slug] && guide
    ? { description: guide.intro, tagline: guide.intro, longDescription: guide.summary, keyFeatures: [], bestFor: guide.decisionRows.map(row => row.bestFor).join("; ") }
    : {};
  return {
    ...tool,
    ...editorialCopy,
    ...(notes ? { description: notes.summary, longDescription: notes.summary, tagline: notes.summary, keyFeatures: notes.features, sourceUrl: notes.sourceUrl, pricingVerified: false, pricingPlans: [], verified: false, reviews: [], reviewCount: 0, rating: 0 } : {}),
    alternatives: tool.alternatives.filter(alternative => hasPublishedToolProfile(alternative.slug)),
  };
}

export function getPublishedTools(): DetailedTool[] {
  return getAllTools().flatMap(tool => {
    const published = getPublishedTool(tool.slug);
    return published ? [published] : [];
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function getPublishedOffers(deals: SaaSDeal[] = getAllDeals()): SaaSDeal[] {
  return deals.filter(deal => deal.dealType !== "pricing" && hasPublishedToolProfile(deal.toolSlug));
}

export function getPublicSearchCatalog(): PublicSearchCatalog {
  return {
    tools: getPublishedTools().map(({ id, slug, name, category, tagline, bestFor, logoLetter }) => ({ id, slug, name, category, tagline, bestFor, logoLetter })),
    offers: getPublishedOffers(),
    articles: DETAILED_ARTICLES.map(({ id, slug, title, summary, category, readTime, author, tags, featured }) => ({ id, slug, title, summary, category, readTime, author, tags, featured })),
  };
}
