import React from "react";
import { notFound } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ComparisonView } from "@/components/compare/ComparisonView";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { COMPARISON_SLUGS, comparisonCanonicalSlug, isCuratedComparison } from "@/lib/data/comparisons-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema, softwareSchema } from "@/lib/structured-data";
import { getBrandDiscountData, hasBrandDiscountPage } from "@/lib/brand-discounts";
import { RelatedDiscountGuides } from "@/components/seo/RelatedDiscountGuides";

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
  const toolA = getToolBySlug(parts[0]);
  const toolB = getToolBySlug(parts[1]);
  if (!toolA || !toolB) notFound();

  return pageMetadata({
    title: `${toolA.name} vs ${toolB.name}: Pricing, Features & Deals`,
    description: `Compare ${toolA.name} and ${toolB.name}: features, pricing plans, pros and cons, and related software deals. Find the right tool for your needs.`,
    path: `/compare/${comparisonCanonicalSlug(slug)}`,
    noIndex: !isCuratedComparison(slug) || toolA.providerStatus === "unavailable" || toolB.providerStatus === "unavailable",
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parts = slug.split("-vs-");

  if (parts.length !== 2 || parts[0] === parts[1]) {
    notFound();
  }

  const toolA = getToolBySlug(parts[0]);
  const toolB = getToolBySlug(parts[1]);

  if (!toolA || !toolB) {
    notFound();
  }

  const dealsA = getDealsByTool(toolA.slug);
  const dealsB = getDealsByTool(toolB.slug);
  const allTools = getAllTools().map(({ id, slug, name }) => ({ id, slug, name }));
  const discountBrands = [toolA, toolB].filter(tool => hasBrandDiscountPage(tool.slug) && getBrandDiscountData(tool).indexable);

  return (
    <div data-comparison-indexing={isCuratedComparison(slug) && toolA.providerStatus !== "unavailable" && toolB.providerStatus !== "unavailable" ? "curated" : "interactive"} className="min-h-screen bg-[#050505]">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { ...webPageSchema(`${toolA.name} vs ${toolB.name}`, `Compare ${toolA.name} and ${toolB.name} pricing, features, pros and cons.`, `/compare/${comparisonCanonicalSlug(slug)}`), about: [softwareSchema(toolA), softwareSchema(toolB)] },
          breadcrumbSchema([{ name: "Compare SaaS Tools", path: "/compare" }, { name: `${toolA.name} vs ${toolB.name}`, path: `/compare/${comparisonCanonicalSlug(slug)}` }]),
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
      />
    </div>
  );
}
