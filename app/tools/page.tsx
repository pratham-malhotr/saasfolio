import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getComparisonHref } from "@/lib/catalog-links";
import React from "react";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { getPublishedTools } from "@/lib/published-catalog";

const description = "Explore software with original buying guidance and linked sources. Compare workflows, billing requirements and operating responsibilities before subscribing.";
const pageNumber = (value?: string | string[]) => typeof value === "string" && /^[1-9]\d{0,3}$/.test(value) ? Number(value) : 1;
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = pageNumber((await searchParams).page);
  return pageMetadata({ title: `Software Buying Guides & Product Profiles${page > 1 ? `: Page ${page}` : ""}`, description, path: page > 1 ? `/tools?page=${page}` : "/tools" });
}

export const revalidate = 3600;

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const allTools = getPublishedTools();
  const page = pageNumber((await searchParams).page);
  if (page > Math.max(1, Math.ceil(allTools.length / 24))) notFound();
  const listedTools = allTools.slice((page - 1) * 24, page * 24);

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={collectionSchema('Software Buying Guides & Product Profiles', description, page > 1 ? `/tools?page=${page}` : "/tools", listedTools.map((tool) => ({ name: tool.name, path: `/tools/${tool.slug}` })))} />
      <ToolsDirectoryClient key={page} initialPage={page} initialTools={allTools.map(({ id, slug, name, category, categorySlug, tagline, description, logoLetter, keyFeatures }) => ({ id, slug, name, category, categorySlug, tagline, description, logoLetter, keyFeatures }))} comparisonLinks={Object.fromEntries(allTools.map((tool) => [tool.slug, getComparisonHref(tool.slug, tool.alternatives[0]?.slug)]))} />
    </div>
  );
}
