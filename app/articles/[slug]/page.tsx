import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl, pageMetadata, isoDate } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, faqSchema, organizationId, softwareSchema, webPageSchema } from "@/lib/structured-data";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { ArticleDetailClient } from "@/components/articles/ArticleDetailClient";
import { authConfigured } from "@/lib/server/supabase";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";
import { getPublishedOffers, getPublishedTool } from "@/lib/published-catalog";
import { HostingArticleActions } from "@/components/hosting/HostingArticleActions";

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
  const reviewedTool = article.toolSlug ? getPublishedTool(article.toolSlug) : undefined;
  const reviewedSoftware = reviewedTool ? softwareSchema(reviewedTool) : undefined;
  const sectionDeals = Object.fromEntries(getPublishedOffers().filter(deal => article.sections.some(section => section.dealCalloutSlug === deal.slug)).map(deal => [deal.slug, deal]));
  const relatedArticles = DETAILED_ARTICLES.filter(other => article.relatedArticlesSlugs.includes(other.slug)).map(({ id, slug, title, summary, category, readTime, author, tags, featured }) => ({ id, slug, title, summary, category, readTime, author, tags, featured }));
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
        image: article.coverImage ? {
          "@type": "ImageObject",
          url: absoluteUrl(article.coverImage.src),
          width: 1440,
          height: 810,
          caption: article.coverImage.alt,
          ...(article.coverImage.credit && {
            creditText: article.coverImage.credit.author,
            license: article.coverImage.credit.licenseUrl,
          }),
        } : absoluteUrl(`${path}/opengraph-image`),
        wordCount: article.sections.reduce((total, section) => total + section.content.split(/\s+/).length, 0),
        about: reviewedSoftware ? [{ "@id": reviewedSoftware["@id"] }] : article.tags.map(name => ({ "@type": "Thing", name })),
        ...(article.keyTakeaways?.length && { abstract: article.keyTakeaways.join(" ") }),
        articleSection: article.category,
        keywords: article.tags,
        inLanguage: "en",
      },
      ...(reviewedSoftware ? [reviewedSoftware] : []),
      ...(article.faqs?.length ? [{ ...faqSchema(article.faqs), "@id": absoluteUrl(`${path}#faq`) }] : []),
      breadcrumbSchema([{ name: "SaaS Articles", path: "/articles" }, { name: article.title, path }]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleDetailClient accountsAvailable={authConfigured()} article={article} relatedArticles={relatedArticles} sectionDeals={sectionDeals} hostingActions={article.providerSlugs ? <HostingArticleActions slugs={article.providerSlugs} /> : undefined} savingsLinks={article.providerSlugs ? undefined : <SavingsCollectionLinks heading="Find current offers for this buying decision" />} />
    </>
  );
}
