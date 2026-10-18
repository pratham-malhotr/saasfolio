import React from "react";
import { notFound } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ToolProfileClient } from "@/components/tools/ToolProfileClient";
import type { Metadata } from "next";

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

  if (!tool) {
    return { title: "Tool Not Found" };
  }

  return {
    title: `${tool.name} Review, Pricing Plans & Active Coupons`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — Reviews, Specs & Deals | SaaSFolio`,
      description: tool.description,
    },
  };
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
      <ToolProfileClient
        tool={tool}
        deals={deals}
        competitorTools={competitorTools}
      />
    </div>
  );
}
