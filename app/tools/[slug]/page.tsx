import React from "react";
import { notFound } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ToolProfileClient } from "@/components/tools/ToolProfileClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema, softwareSchema } from "@/lib/structured-data";
import { getComparisonHref } from "@/lib/catalog-links";

export async function generateStaticParams() {
  const tools = getAllTools();
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
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  return pageMetadata({
    title: `${tool.name} Review, Pricing & Alternatives`,
    description: `${tool.name}: ${tool.description} Explore features, pricing, pros and cons, alternatives and related deals.`,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const deals = getDealsByTool(tool.slug);
  const allTools = getAllTools();
  const competitorTools = allTools.filter(
    (t) => t.categorySlug === tool.categorySlug && t.id !== tool.id
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { ...webPageSchema(`${tool.name} Review, Pricing & Alternatives`, tool.description, `/tools/${tool.slug}`), mainEntity: { "@id": softwareSchema(tool)["@id"] } },
          softwareSchema(tool),
          breadcrumbSchema([{ name: "SaaS Tools", path: "/tools" }, { name: tool.name, path: `/tools/${tool.slug}` }]),
        ],
      }} />
      <ToolProfileClient
        tool={tool}
        deals={deals}
        competitorTools={competitorTools}
        comparisonLinks={Object.fromEntries(tool.alternatives.map((alternative) => [alternative.slug, getComparisonHref(tool.slug, alternative.slug)]))}
      />
    </div>
  );
}
