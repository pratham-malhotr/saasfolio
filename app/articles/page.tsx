import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { ArticlesHubClient } from "@/components/articles/ArticlesHubClient";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";

export const metadata = pageMetadata({
  title: 'Software Reviews, Hosting Research & SaaS Buying Guides',
  description: 'Read sourced software and hosting reviews, compare product trade-offs and evaluate pricing, renewal costs and operating responsibilities before subscribing.',
  path: "/articles",
});

export default function ArticlesPage() {
  const articles = DETAILED_ARTICLES.map(({ id, slug, title, summary, category, readTime, author, tags, featured }) => ({ id, slug, title, summary, category, readTime, author, tags, featured }));
  return <><JsonLd data={collectionSchema('SaaS Buying Guides', 'Original buying guides about coupon terms, pricing limits, subscription budgets and renewal costs.', "/articles", DETAILED_ARTICLES.map((article) => ({ name: article.title, path: `/articles/${article.slug}` })))} /><ArticlesHubClient articles={articles} savingsLinks={<SavingsCollectionLinks heading="Put the buying guide into practice" />} /></>;
}
