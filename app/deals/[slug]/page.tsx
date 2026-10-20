import React from "react";
import { notFound } from "next/navigation";
import { getAllDeals, getDealBySlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { DealDetailClient } from "@/components/deals/DealDetailClient";
import type { Metadata } from "next";
import { pageMetadata, dealSearchTitle } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema, softwareSchema } from "@/lib/structured-data";
import { getComparisonHref } from "@/lib/catalog-links";

export async function generateStaticParams() {
  const deals = getAllDeals();
  return deals.map((deal) => ({
    slug: deal.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deal = getDealBySlug(slug);

  if (!deal) notFound();

  return pageMetadata({
    title: dealSearchTitle(deal),
    description: deal.description,
    path: `/deals/${deal.slug}`,
  });
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deal = getDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  const tool = getToolBySlug(deal.toolSlug);
  const allDeals = getAllDeals();
  const relatedDeals = allDeals.filter(
    (d) => d.categorySlug === deal.categorySlug && d.id !== deal.id
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { ...webPageSchema(dealSearchTitle(deal), deal.description, `/deals/${deal.slug}`),
            ...(tool ? { about: { "@id": softwareSchema(tool)["@id"] } } : {}),
          },
          ...(tool ? [softwareSchema(tool)] : []),
          breadcrumbSchema([{ name: "SaaS Deals", path: "/deals" }, { name: `${deal.toolName} Deal`, path: `/deals/${deal.slug}` }]),
        ],
      }} />
      <DealDetailClient
        deal={deal}
        tool={tool}
        relatedDeals={relatedDeals}
        comparisonHref={tool ? getComparisonHref(tool.slug, tool.alternatives[0]?.slug) : "/compare"}
      />
    </div>
  );
}
