import type { MetadataRoute } from "next";
import { getAllDeals } from "@/lib/data/deals-data";
import { TOOLS_DATA } from "@/lib/data/tools-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";
import { COMPARISON_SLUGS } from "@/lib/data/comparisons-data";
import { getCatalogCategories } from "@/lib/categories";
import { absoluteUrl, isoDate } from "@/lib/seo";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  // Use stable ISO timestamps so Google Search Console identifies accurate modification milestones.

  // Core navigation pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/deals"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tools"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/compare"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/articles"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/community"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/advertise"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/affiliate-disclosure"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/terms"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Verified SaaS Deals
  const dealsRoutes: MetadataRoute.Sitemap = getAllDeals().filter(deal => deal.dealType !== "pricing").map((deal) => ({
    url: absoluteUrl(`/deals/${deal.slug}`),
    lastModified: deal.updatedAt || deal.checkedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Software Catalog Tools
  const toolsRoutes: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}`),
    lastModified: tool.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Comparison Matrix Pages
  const comparisonRoutes: MetadataRoute.Sitemap = COMPARISON_SLUGS.map((slug) => ({
    url: absoluteUrl(`/compare/${slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Editorial Articles & Reviews with verified publication timestamps
  const articlesRoutes: MetadataRoute.Sitemap = DETAILED_ARTICLES.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: isoDate(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Community Discussion Threads
  const communityRoutes: MetadataRoute.Sitemap = DETAILED_THREADS.map((thread) => ({
    url: absoluteUrl(`/community/${thread.slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Deduplicate and return complete canonical index
  const seen = new Set<string>();
  const combined = [
    ...coreRoutes,
    ...getCatalogCategories().map(category => ({ url: absoluteUrl(`/deals/category/${category.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...dealsRoutes,
    ...toolsRoutes,
    ...comparisonRoutes,
    ...articlesRoutes,
    ...communityRoutes,
  ];

  return combined.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
