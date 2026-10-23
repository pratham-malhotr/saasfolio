import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { ArticlesHubClient } from "@/components/articles/ArticlesHubClient";

export const metadata = pageMetadata({
  title: 'SaaS Buying Guides: Coupons, Pricing & Renewal Costs',
  description: 'Read original SaaS buying guides with references. Compare coupon terms, usage limits, access fees and renewal costs before choosing a software subscription.',
  path: "/articles",
});

export default function ArticlesPage() {
  return <><JsonLd data={collectionSchema('SaaS Buying Guides', 'Original buying guides about coupon terms, pricing limits, subscription budgets and renewal costs.', "/articles", DETAILED_ARTICLES.map((article) => ({ name: article.title, path: `/articles/${article.slug}` })))} /><ArticlesHubClient /></>;
}
