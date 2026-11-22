import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { getPublishedOffers } from "@/lib/published-catalog";
import Link from "next/link";
import { getPublishedSavingsOffers } from "@/lib/savings-collections";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";
import { CATEGORY_SEARCH_CONTENT } from "@/lib/data/category-search-content";

const title = "SaaS Deals, Software Offers & Free Trials";
const description = "Browse sourced SaaS deals by category. Compare software offers, free plans and trials with published terms, check dates and eligibility details.";
type DealSearch = { category?: string | string[]; type?: string | string[] };

function getDealFilters(params: DealSearch) {
  const category = (Array.isArray(params.category) ? params.category[0] : params.category)?.trim().toLowerCase() || "all";
  const type = (Array.isArray(params.type) ? params.type[0] : params.type)?.trim().toLowerCase() || "all";
  return { category, type };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<DealSearch> }) {
  const { category, type } = getDealFilters(await searchParams);
  return pageMetadata({ title, description, path: "/deals", noIndex: category !== "all" || type !== "all" });
}

export default async function DealsPage({ searchParams }: { searchParams: Promise<DealSearch> }) {
  const { category, type } = getDealFilters(await searchParams);
  const allDeals = getPublishedSavingsOffers(getPublishedOffers());

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd data={collectionSchema(title, description, "/deals", allDeals.filter((deal) =>
        (deal.dealPrice ?? 0) <= 500 &&
        (category === "all" || deal.categorySlug === category || deal.category.toLowerCase() === category) &&
        (type === "all" || deal.dealType === type)
      ).sort((a, b) => b.revealsCount - a.revealsCount).map((deal) => ({ name: deal.title, path: `/deals/${deal.slug}` })))} />
      <DealsExplorer
        key={`${category}:${type}`}
        initialDeals={allDeals}
        initialCategory={category}
        initialType={type}
        heading="SaaS deals & software offers"
        description="Compare sourced SaaS deals, free plans and free trials. Check what the offer covers, when it was recorded and what you’ll pay after the promotion."
        afterResults={<>
          <nav aria-label="Software deals by category" className="my-8 space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">Software deals by category</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
              {Object.entries(CATEGORY_SEARCH_CONTENT).map(([slug, content]) => <li key={slug}><Link prefetch={false} href={`/deals/category/${slug}`} className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline underline-offset-4">{content.heading}</Link></li>)}
            </ul>
          </nav>
          <SavingsCollectionLinks heading="Need a code or an eligibility-based program?" />
        </>}
      />
      <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-zinc-400 text-sm">Looking for a particular provider? <Link href="/discounts" className="text-[#C6FF3D] underline">Compare discounts and coupon availability by brand</Link>.</p>
    </div>
  );
}
