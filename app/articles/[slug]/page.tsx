import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl, pageMetadata, isoDate } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, organizationId, webPageSchema } from "@/lib/structured-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { ArticleDetailClient } from "@/components/articles/ArticleDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DETAILED_ARTICLES.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = DETAILED_ARTICLES.find((a) => a.slug === slug);

  if (!article) notFound();

  return pageMetadata({
    title: article.title,
    description: article.summary,
    path: `/articles/${article.slug}`,
    image: `/articles/${article.slug}/opengraph-image`,
    article: {
      publishedTime: isoDate(article.publishedAt)!,
      modifiedTime: isoDate(article.updatedAt),
      authors: [article.author.name],
      tags: article.tags,
      section: article.category,
    },
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = DETAILED_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const path = `/articles/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { ...webPageSchema(article.title, article.summary, path), mainEntity: { "@id": absoluteUrl(`${path}#article`) } },
      {
        "@type": "Article",
        "@id": absoluteUrl(`${path}#article`),
        headline: article.title,
        description: article.summary,
        datePublished: isoDate(article.publishedAt),
        dateModified: isoDate(article.updatedAt),
        author: { "@id": organizationId },
        citation: article.sources?.map(source => source.url),
        publisher: { "@id": organizationId },
        mainEntityOfPage: { "@id": absoluteUrl(`${path}#webpage`) },
        image: absoluteUrl(`${path}/opengraph-image`),
        articleSection: article.category,
        keywords: article.tags,
        inLanguage: "en",
      },
      breadcrumbSchema([{ name: "SaaS Articles", path: "/articles" }, { name: article.title, path }]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleDetailClient article={article} />
    </>
  );
}
