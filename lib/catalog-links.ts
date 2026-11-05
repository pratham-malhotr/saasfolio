import { getToolBySlug } from "@/lib/data/tools-data";
import { comparisonCanonicalSlug, isCuratedComparison } from "@/lib/data/comparisons-data";
import { hasPublishedToolProfile } from "@/lib/published-catalog";

// Resolve on the server and pass the small link map to interactive components.
// Missing alternatives must not generate links to non-existent product pages.
export function getComparisonHref(toolSlug: string, alternativeSlug?: string): string {
  if (!alternativeSlug || toolSlug === alternativeSlug || !getToolBySlug(toolSlug) || !getToolBySlug(alternativeSlug)) return "/compare";
  const slug = comparisonCanonicalSlug(`${toolSlug}-vs-${alternativeSlug}`);
  return isCuratedComparison(slug) ? `/compare/${slug}` : "/compare";
}

export function getToolHref(slug: string): string {
  return hasPublishedToolProfile(slug) ? `/tools/${getToolBySlug(slug)!.slug}` : "/tools";
}
