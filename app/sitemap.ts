import type { MetadataRoute } from "next";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { TOOLS_DATA } from "@/lib/data/tools-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";
import { COMPARISON_SLUGS } from "@/lib/data/comparisons-data";
import { absoluteUrl, isoDate } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use stable ISO timestamps so Google Search Console identifies accurate modification milestones.
  const baselineDate = "2026-10-20T00:00:00.000Z";
  const staticPageDate = "2026-10-15T00:00:00.000Z";

  // Core navigation pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: baselineDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/deals"),
      lastModified: baselineDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tools"),
      lastModified: baselineDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/compare"),
      lastModified: baselineDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/articles"),
      lastModified: baselineDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/community"),
      lastModified: baselineDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/advertise"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/affiliate-disclosure"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: staticPageDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Verified SaaS Deals
  const dealsRoutes: MetadataRoute.Sitemap = DEALS_DATA.map((deal) => ({
    url: absoluteUrl(`/deals/${deal.slug}`),
    lastModified: baselineDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Software Catalog Tools
  const toolsRoutes: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}`),
    lastModified: baselineDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Comparison Matrix Pages
  const comparisonRoutes: MetadataRoute.Sitemap = COMPARISON_SLUGS.map((slug) => ({
    url: absoluteUrl(`/compare/${slug}`),
    lastModified: baselineDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Editorial Articles & Reviews with verified publication timestamps
  const articlesRoutes: MetadataRoute.Sitemap = DETAILED_ARTICLES.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: isoDate(article.updatedAt || article.publishedAt) || baselineDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Community Discussion Threads
  const communityRoutes: MetadataRoute.Sitemap = DETAILED_THREADS.map((thread) => ({
    url: absoluteUrl(`/community/${thread.slug}`),
    lastModified: baselineDate,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Deduplicate and return complete canonical index
  const seen = new Set<string>();
  const combined = [
    ...coreRoutes,
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
