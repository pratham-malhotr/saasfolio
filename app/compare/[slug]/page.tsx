import React from "react";
import { notFound } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getDealsByTool } from "@/lib/data/deals-data";
import { ComparisonView } from "@/components/compare/ComparisonView";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return [
    { slug: "cogniflow-ai-vs-syntaxai" },
    { slug: "edgebase-cloud-vs-deployjet" },
    { slug: "pulsemail-pro-vs-viralpeak" },
    { slug: "vaultguard-security-vs-armorid" },
    { slug: "vectorcraft-vs-framegen" },
    { slug: "metricpulse-vs-insightstream" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parts = slug.split("-vs-");

  if (parts.length !== 2) {
    return { title: "Comparison Not Found" };
  }

  const toolA = getToolBySlug(parts[0]);
  const toolB = getToolBySlug(parts[1]);

  if (!toolA || !toolB) {
    return { title: "Tools Comparison | SaaSFolio" };
  }

  return {
    title: `${toolA.name} vs. ${toolB.name} (2026 Comparison) — Which SaaS Tool Wins?`,
    description: `Compare ${toolA.name} vs ${toolB.name} side-by-side. Uncover latency benchmarks, pricing plans, pros/cons, and verified coupon deals.`,
    openGraph: {
      title: `${toolA.name} vs. ${toolB.name} — Full Spec Comparison | SaaSFolio`,
      description: `Unbiased head-to-head comparison of ${toolA.name} and ${toolB.name}.`,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parts = slug.split("-vs-");

  if (parts.length !== 2) {
    notFound();
  }

  const toolA = getToolBySlug(parts[0]);
  const toolB = getToolBySlug(parts[1]);

  if (!toolA || !toolB) {
    notFound();
  }

  const dealsA = getDealsByTool(toolA.slug);
  const dealsB = getDealsByTool(toolB.slug);
  const allTools = getAllTools();

  return (
    <div className="min-h-screen bg-[#050505]">
      <ComparisonView
        toolA={toolA}
        toolB={toolB}
        dealsA={dealsA}
        dealsB={dealsB}
        allTools={allTools}
      />
    </div>
  );
}
