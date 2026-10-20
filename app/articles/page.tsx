import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { ArticlesHubClient } from "@/components/articles/ArticlesHubClient";

export const metadata = pageMetadata({
  title: 'SaaS Reviews, Software Comparisons & Buying Guides',
  description: 'Read SaaS reviews, software comparisons, tool roundups and guides to choosing a software stack and reducing business software costs.',
  path: "/articles",
});

export default function ArticlesPage() {
  return <><JsonLd data={collectionSchema('SaaS Reviews & Buying Guides', 'Software reviews, comparisons, tool roundups and SaaS buying guides.', "/articles", DETAILED_ARTICLES.map((article) => ({ name: article.title, path: `/articles/${article.slug}` })))} /><ArticlesHubClient /></>;
}
