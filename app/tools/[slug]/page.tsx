import React from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getPublishedTools, getPublishedTool, hasPublishedToolProfile } from "@/lib/published-catalog";
import { BrandBuyingGuides } from "@/components/articles/BrandBuyingGuides";
import { ToolBuyingNotes } from "@/components/seo/ToolBuyingNotes";
import { CatalogReference } from "@/components/tools/CatalogReference";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ToolProfileClient } from "@/components/tools/ToolProfileClient";
import type { Metadata } from "next";
import { pageMetadata, toolSearchTitle, toolMetaDescription } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbSchema,
  webPageSchema,
  softwareSchema,
} from "@/lib/structured-data";
import { getComparisonHref } from "@/lib/catalog-links";
import { BrandDiscountSummary } from "@/components/seo/BrandDiscountSummary";

export async function generateStaticParams() {
  const tools = getPublishedTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getPublishedTool(slug) || getToolBySlug(slug);

  if (!tool) notFound();
  const published = hasPublishedToolProfile(tool.slug);

  return pageMetadata({
    title: published ? toolSearchTitle(tool) : `${tool.name}: Directory Reference`,
    description: published ? toolMetaDescription(tool) : `An older ${tool.name} directory reference. Explore published software buying guides and current provider terms before choosing a subscription.`,
    path: `/tools/${tool.slug}`,
    noIndex: !published,
  });
}

export const revalidate = 3600;

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getPublishedTool(slug) || getToolBySlug(slug);

  if (!tool) {
    notFound();
  }
  if (slug !== tool.slug) permanentRedirect(`/tools/${tool.slug}`);
  if (tool.providerStatus !== "unavailable" && !hasPublishedToolProfile(tool.slug)) return <CatalogReference tool={tool} />;

  const deals = getDealsByTool(tool.slug);

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              ...webPageSchema(
                toolSearchTitle(tool),
                toolMetaDescription(tool),
                `/tools/${tool.slug}`
              ),
              mainEntity: { "@id": softwareSchema(tool)["@id"] },
            },
            softwareSchema(tool),
            breadcrumbSchema([
              { name: "SaaS Tools", path: "/tools" },
              { name: tool.name, path: `/tools/${tool.slug}` },
            ]),
          ],
        }}
      />
      <ToolProfileClient
        tool={tool}
        deals={deals}
        discountSummary={<BrandDiscountSummary tool={tool} deals={deals} />}
        buyingNotes={hasPublishedToolProfile(tool.slug) ? <><ToolBuyingNotes tool={tool} /><BrandBuyingGuides slug={tool.slug} />{tool.slug === "firecrawl" && <p className="text-zinc-300">Planning regular crawls? <Link href="/firecrawl-pricing-calculator" className="text-[#C6FF3D] underline">Calculate Firecrawl credits and monthly plan costs</Link>.</p>}</> : undefined}
        comparisonLinks={Object.fromEntries(
          tool.alternatives.map((alternative) => [
            alternative.slug,
            getComparisonHref(tool.slug, alternative.slug),
          ])
        )}
      />
    </div>
  );
}
