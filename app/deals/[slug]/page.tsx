import React from "react";
import { notFound } from "next/navigation";
import { getAllDeals, getDealBySlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { DealDetailClient } from "@/components/deals/DealDetailClient";
import type { Metadata } from "next";

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

  if (!deal) {
    return { title: "Deal Not Found" };
  }

  return {
    title: `${deal.discountPercentage}% Off ${deal.toolName} — Verified Coupon Code`,
    description: deal.description,
    openGraph: {
      title: `${deal.discountPercentage}% Off ${deal.toolName} Coupon | SaaSFolio`,
      description: deal.description,
    },
  };
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
      <DealDetailClient
        deal={deal}
        tool={tool}
        relatedDeals={relatedDeals}
      />
    </div>
  );
}
