import Link from "next/link";
import { BrandDiscountCard } from "@/components/seo/BrandDiscountCard";
import { getFeaturedDiscountBrands } from "@/lib/brand-discounts";
import type { SaaSDeal } from "@/lib/types";

// Keep the brand links and savings summaries in the initial server HTML.
export function BrandDiscountsSection({ deals }: { deals: SaaSDeal[] }) {
  const brands = getFeaturedDiscountBrands();
  return <section aria-labelledby="brand-discounts-heading" className="border-b border-white/10 bg-[#050505] py-20">
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">Save on the brands you use</p>
          <h2 id="brand-discounts-heading" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">SaaS discounts by brand</h2>
          <p className="leading-relaxed text-zinc-400">Looking for a beehiiv promo code, a Predis.ai discount, Taplio savings or a Baremetrics offer? Start with the brand guide to compare sourced savings, coupon availability and the steps to claim.</p>
        </div>
        <Link href="/discounts" className="text-sm font-semibold text-[#C6FF3D] underline underline-offset-4">View all brand discounts →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {brands.map(tool => <BrandDiscountCard key={tool.slug} tool={tool} deals={deals} />)}
      </div>
      <p className="text-sm leading-relaxed text-zinc-500">Annual billing offers, coupon codes, free plans and trials have different terms. Each guide shows what is sourced and when it was reviewed. <Link href="/about" className="text-zinc-300 underline">How we check offers</Link>.</p>
    </div>
  </section>;
}
