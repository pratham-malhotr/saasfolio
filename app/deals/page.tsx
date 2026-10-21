import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { getAllDeals } from "@/lib/data/deals-data";
import Link from "next/link";

export const metadata = pageMetadata({
  title: 'SaaS Discounts, Coupon Codes & Lifetime Deals',
  description: 'Browse SaaS discounts, software coupon codes, lifetime deals, free plans and extended trials. Compare offers for business, developer and AI tools.',
  path: "/deals",
});

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const allDeals = getAllDeals();

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={collectionSchema('SaaS Discounts & Software Deals', 'Software discounts, coupon codes, lifetime deals and free trials.', "/deals", allDeals.filter((deal) =>
        (deal.dealPrice ?? 0) <= 500 &&
        (!params.category || params.category === "all" || deal.categorySlug === params.category || deal.category.toLowerCase() === params.category.toLowerCase()) &&
        (!params.type || params.type === "all" || deal.dealType === params.type)
      ).sort((a, b) => b.revealsCount - a.revealsCount).map((deal) => ({ name: deal.title, path: `/deals/${deal.slug}` })))} />
      <DealsExplorer
        initialDeals={allDeals}
        initialCategory={params.category}
        initialType={params.type}
      />
      <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-zinc-400 text-sm">Looking for a particular provider? <Link href="/discounts" className="text-[#C6FF3D] underline">Compare discounts and coupon availability by brand</Link>.</p>
    </div>
  );
}
