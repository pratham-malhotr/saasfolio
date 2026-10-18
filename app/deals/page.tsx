import React from "react";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { getAllDeals } from "@/lib/data/deals-data";

export const metadata = {
  title: "SaaS Deals & Coupons — Verified Discounts",
  description: "Browse 1,200+ verified SaaS coupons, lifetime discounts, and free trials across 12 software verticals.",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const allDeals = getAllDeals();

  return (
    <div className="min-h-screen bg-[#050505]">
      <DealsExplorer
        initialDeals={allDeals}
        initialCategory={params.category}
        initialType={params.type}
      />
    </div>
  );
}
