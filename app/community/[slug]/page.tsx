import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DETAILED_THREADS } from "@/lib/data/community-data";
import { CommunityThreadClient } from "@/components/community/CommunityThreadClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DETAILED_THREADS.map((thread) => ({
    slug: thread.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const thread = DETAILED_THREADS.find((t) => t.slug === slug);

  if (!thread) {
    return {
      title: "Discussion Not Found — SaaSFolio Community",
    };
  }

  return {
    title: `${thread.title} | SaaSFolio Community`,
    description: thread.content.slice(0, 160),
    openGraph: {
      title: thread.title,
      description: thread.content.slice(0, 160),
      type: "article",
    },
  };
}

import { CommunityThreadFallback } from "@/components/community/CommunityThreadFallback";

export default async function CommunityThreadPage({ params }: PageProps) {
  const { slug } = await params;
  const thread = DETAILED_THREADS.find((t) => t.slug === slug);

  if (!thread) {
    return <CommunityThreadFallback slug={slug} />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: thread.title,
    articleBody: thread.content,
    author: {
      "@type": "Person",
      name: thread.author.name,
      alternateName: thread.author.username,
    },
    datePublished: thread.createdAt,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: thread.upvotes,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: thread.commentCount,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CommunityThreadClient thread={thread} />
    </>
  );
}
