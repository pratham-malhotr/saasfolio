import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { getAllDeals } from "@/lib/data/deals-data";
import Link from "next/link";
import { getPublishedSavingsOffers } from "@/lib/savings-collections";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";

export const metadata = pageMetadata({
  title: 'SaaS Deals: Software Offers, Free Plans & Trials',
  description: 'Browse sourced SaaS deals, software offers, free plans and trials. Compare offer types, check dates, eligibility and billing terms before subscribing.',
  path: "/deals",
});

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const allDeals = getPublishedSavingsOffers(getAllDeals());

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={collectionSchema('SaaS Deals: Software Offers, Free Plans & Trials', 'Sourced software offers, free plans and trials with eligibility and billing checks.', "/deals", allDeals.filter((deal) =>
        (deal.dealPrice ?? 0) <= 500 &&
        (!params.category || params.category === "all" || deal.categorySlug === params.category || deal.category.toLowerCase() === params.category.toLowerCase()) &&
        (!params.type || params.type === "all" || deal.dealType === params.type)
      ).sort((a, b) => b.revealsCount - a.revealsCount).map((deal) => ({ name: deal.title, path: `/deals/${deal.slug}` })))} />
      <DealsExplorer
        key={`${params.category || "all"}:${params.type || "all"}`}
        initialDeals={allDeals}
        initialCategory={params.category}
        initialType={params.type}
        heading="SaaS deals & software offers"
        description="Compare current sourced offers, free plans and trials by their actual type. Ordinary pricing links are in the software directory; a listing here is still subject to the provider’s eligibility and billing terms."
        afterResults={<SavingsCollectionLinks heading="Need a code or an eligibility-based program?" />}
      />
      <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-zinc-400 text-sm">Looking for a particular provider? <Link href="/discounts" className="text-[#C6FF3D] underline">Compare discounts and coupon availability by brand</Link>.</p>
    </div>
  );
}
