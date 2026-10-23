import React from "react";
import type { Metadata } from "next";
import { pageMetadata, summarize } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/structured-data";
import { getToolHref } from "@/lib/catalog-links";
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
    // Local-only discussions remain usable in the browser, but have no public
    // server content for search engines to index.
    return pageMetadata({ title: "Community Discussion", description: "SaaSFolio community discussion.", path: `/community/${encodeURIComponent(slug)}`, noIndex: true });
  }
  return pageMetadata({ title: thread.title, description: thread.content, path: `/community/${thread.slug}`, noIndex: true });
}

import { CommunityThreadFallback } from "@/components/community/CommunityThreadFallback";

export default async function CommunityThreadPage({ params }: PageProps) {
  const { slug } = await params;
  const thread = DETAILED_THREADS.find((t) => t.slug === slug);

  if (!thread) {
    return <CommunityThreadFallback slug={slug} />;
  }

  const path = `/community/${thread.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // Dates in this legacy dataset are relative labels, not publication
      // timestamps. Use WebPage until real timestamps support forum rich results.
      webPageSchema(thread.title, summarize(thread.content), path),
      breadcrumbSchema([{ name: "SaaS Community", path: "/community" }, { name: thread.title, path }]),
    ],
  };

  return (
    <div data-community-preview="true">
      <JsonLd data={jsonLd} />
      <CommunityThreadClient thread={thread} toolLinks={Object.fromEntries(thread.toolTags.map((tag) => [tag.slug, getToolHref(tag.slug)]))} />
    </div>
  );
}
