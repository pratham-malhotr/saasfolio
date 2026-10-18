import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
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

  if (!article) {
    return {
      title: "Article Not Found — SaaSFolio",
    };
  }

  return {
    title: `${article.title} | SaaSFolio Editorial`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = DETAILED_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.summary,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: {
          "@type": "Person",
          name: article.author.name,
          jobTitle: article.author.role,
        },
        publisher: {
          "@type": "Organization",
          name: "SaaSFolio",
          url: "https://saasfolio.tech",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://saasfolio.tech/articles/${article.slug}`,
        },
      },
      ...(article.faqs && article.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: article.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailClient article={article} />
    </>
  );
}
