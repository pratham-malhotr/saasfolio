import { getToolBySlug } from "@/lib/data/tools-data";
import { comparisonCanonicalSlug } from "@/lib/data/comparisons-data";

// Resolve on the server and pass the small link map to interactive components.
// Missing alternatives must not generate links to non-existent product pages.
export function getComparisonHref(toolSlug: string, alternativeSlug?: string): string {
  if (!alternativeSlug || toolSlug === alternativeSlug || !getToolBySlug(toolSlug) || !getToolBySlug(alternativeSlug)) return "/compare";
  return `/compare/${comparisonCanonicalSlug(`${toolSlug}-vs-${alternativeSlug}`)}`;
}

export function getToolHref(slug: string): string {
  return getToolBySlug(slug) ? `/tools/${slug}` : "/tools";
}
