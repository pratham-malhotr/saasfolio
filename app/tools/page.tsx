import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { getComparisonHref } from "@/lib/catalog-links";
import React from "react";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { getAllTools } from "@/lib/data/tools-data";

export const metadata = pageMetadata({
  title: 'SaaS Software Reviews, Pricing & Alternatives',
  description: 'Explore SaaS software reviews, features, pricing plans and alternatives. Compare business tools and find related software discounts on SaaSFolio.',
  path: "/tools",
});

export default function ToolsPage() {
  const allTools = getAllTools();

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={collectionSchema('SaaS Software Reviews, Pricing & Alternatives', 'Explore software features, pricing, alternatives and related deals.', "/tools", allTools.map((tool) => ({ name: tool.name, path: `/tools/${tool.slug}` })))} />
      <ToolsDirectoryClient initialTools={allTools} comparisonLinks={Object.fromEntries(allTools.map((tool) => [tool.slug, getComparisonHref(tool.slug, tool.alternatives[0]?.slug)]))} />
    </div>
  );
}
