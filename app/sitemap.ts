import type { MetadataRoute } from "next";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { TOOLS_DATA } from "@/lib/data/tools-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";
import { COMPARISON_SLUGS } from "@/lib/data/comparisons-data";
import { absoluteUrl, isoDate } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Include canonical public content only. Do not manufacture lastmod dates on
  // every build: Google uses them to identify substantive content changes.
  const paths = [
    "/", "/deals", "/tools", "/articles", "/community", "/compare",
    "/about", "/contact", "/advertise", "/affiliate-disclosure", "/privacy", "/terms",
    ...DEALS_DATA.map((deal) => `/deals/${deal.slug}`),
    ...TOOLS_DATA.map((tool) => `/tools/${tool.slug}`),
    ...DETAILED_THREADS.map((thread) => `/community/${thread.slug}`),
    ...COMPARISON_SLUGS.map((slug) => `/compare/${slug}`),
  ];
  return [
    ...[...new Set(paths)].map((path) => ({ url: absoluteUrl(path) })),
    ...DETAILED_ARTICLES.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: isoDate(article.updatedAt || article.publishedAt),
    })),
  ];
}
