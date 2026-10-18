import { MetadataRoute } from "next";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { TOOLS_DATA } from "@/lib/data/tools-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech";

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic deal pages (42 deals)
  const dealRoutes: MetadataRoute.Sitemap = DEALS_DATA.map((deal) => ({
    url: `${baseUrl}/deals/${deal.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Dynamic tool profile pages (32 tools)
  const toolRoutes: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic editorial articles (8 in-depth articles)
  const articleRoutes: MetadataRoute.Sitemap = DETAILED_ARTICLES.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic community threads (8 threads)
  const threadRoutes: MetadataRoute.Sitemap = DETAILED_THREADS.map((thread) => ({
    url: `${baseUrl}/community/${thread.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...dealRoutes,
    ...toolRoutes,
    ...articleRoutes,
    ...threadRoutes,
  ];
}
