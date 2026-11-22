import React from "react";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getPublishedTools, getPublishedTool } from "@/lib/published-catalog";
import { COMPARISON_GUIDES } from "@/lib/data/comparison-guides";
import { ComparisonBuyingGuide } from "@/components/seo/ComparisonBuyingGuide";
import CompareHubClient from "@/components/compare/CompareHubClient";
import { POPULAR_COMPARISONS } from "@/lib/data/comparisons-data";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ComparisonView } from "@/components/compare/ComparisonView";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { COMPARISON_SLUGS, comparisonCanonicalSlug, isCuratedComparison } from "@/lib/data/comparisons-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema, softwareSchema } from "@/lib/structured-data";
import { getBrandDiscountData, hasBrandDiscountPage } from "@/lib/brand-discounts";
import { RelatedDiscountGuides } from "@/components/seo/RelatedDiscountGuides";

const searchFocus: Record<string, { topic: string; description: string }> = {
  "coolify-vs-vercel": { topic: "Self-Hosted vs Managed Deployments", description: "Compare Coolify and Vercel for web app deployment. See who owns the server, TLS, previews, backups and ongoing maintenance." },
  "carrd-vs-framer": { topic: "Landing Page Builders Compared", description: "Compare Carrd and Framer for landing pages. Check forms, CMS requirements, custom domains, editing and the cost of maintaining the site." },
  "obsidian-vs-notion": { topic: "Local Notes vs Team Workspaces", description: "Compare Obsidian’s local Markdown vault with Notion’s shared workspace. Check offline access, collaboration, exports and who owns the files." },
  "pocketbase-vs-supabase": { topic: "SQLite vs PostgreSQL Backends", description: "Compare PocketBase and Supabase for your application backend. Evaluate SQLite vs PostgreSQL, deployment, backups and upgrade responsibilities." },
  "umami-vs-plausible": { topic: "Web Analytics Compared", description: "Compare Umami and Plausible for website analytics. Check event tracking, reporting, deployment choices and ownership of your analytics data." },
  "vaultwarden-vs-bitwarden": { topic: "Self-Hosted Password Managers", description: "Compare Vaultwarden and Bitwarden for password management. Check support, server ownership, client compatibility, backups and account recovery." },
};

function getSearchCopy(slug: string, first: string, second: string) {
  const focus = searchFocus[slug];
  return {
    title: `${first} vs ${second}: ${focus?.topic || "Features & Pricing"}`,
    description: focus?.description || `Compare ${first} and ${second} by features, pricing, limitations and available alternatives.`,
  };
}

export async function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parts = slug.split("-vs-");

  if (parts.length !== 2 || parts[0] === parts[1]) notFound();
  const toolA = getPublishedTool(parts[0]) || getToolBySlug(parts[0]);
  const toolB = getPublishedTool(parts[1]) || getToolBySlug(parts[1]);
  if (!toolA || !toolB) notFound();

  const canonical = comparisonCanonicalSlug(slug);
  return pageMetadata({
    ...getSearchCopy(canonical, toolA.name, toolB.name),
    path: `/compare/${canonical}`,
    noIndex: !isCuratedComparison(slug) || toolA.providerStatus === "unavailable" || toolB.providerStatus === "unavailable",
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonical = comparisonCanonicalSlug(slug);
  const parts = slug.split("-vs-");

  if (parts.length !== 2 || parts[0] === parts[1]) {
    notFound();
  }

  const toolA = getPublishedTool(parts[0]) || getToolBySlug(parts[0]);
  const toolB = getPublishedTool(parts[1]) || getToolBySlug(parts[1]);

  if (!toolA || !toolB) {
    notFound();
  }
  if (!getPublishedTool(toolA.slug) || !getPublishedTool(toolB.slug)) {
    const tools = getPublishedTools().map(({ id, slug, name, category }) => ({ id, slug, name, category }));
    return <div data-comparison-indexing="interactive"><CompareHubClient tools={tools} comparisons={POPULAR_COMPARISONS} /></div>;
  }

  const dealsA = getDealsByTool(toolA.slug);
  const dealsB = getDealsByTool(toolB.slug);
  const allTools = getPublishedTools().map(({ id, slug, name }) => ({ id, slug, name }));
  const guide = COMPARISON_GUIDES[slug];
  const { title, description } = getSearchCopy(slug, toolA.name, toolB.name);
  const discountBrands = [toolA, toolB].filter(tool => hasBrandDiscountPage(tool.slug) && getBrandDiscountData(tool).indexable);

  return (
    <div data-comparison-indexing={isCuratedComparison(slug) && toolA.providerStatus !== "unavailable" && toolB.providerStatus !== "unavailable" ? "curated" : "interactive"} className="min-h-screen bg-[#050505]">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { ...webPageSchema(title, description, `/compare/${canonical}`), about: [softwareSchema(toolA), softwareSchema(toolB)] },
          breadcrumbSchema([{ name: "Compare SaaS Tools", path: "/compare" }, { name: `${toolA.name} vs ${toolB.name}`, path: `/compare/${canonical}` }]),
        ],
      }} />
      <ComparisonView
        key={`${toolA.slug}:${toolB.slug}`}
        toolA={toolA}
        toolB={toolB}
        dealsA={dealsA}
        dealsB={dealsB}
        allTools={allTools}
        discountGuides={<RelatedDiscountGuides brands={discountBrands} deals={[...dealsA, ...dealsB]} heading="Compare discounts before subscribing" />}
        editorialGuide={guide ? <ComparisonBuyingGuide guide={guide} /> : undefined}
      />
    </div>
  );
}
