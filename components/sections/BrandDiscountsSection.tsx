import Link from "next/link";
import { brandSavingsSummary, getFeaturedDiscountBrands } from "@/lib/brand-discounts";
import type { SaaSDeal } from "@/lib/types";

export function BrandDiscountsSection({ deals }: { deals: SaaSDeal[] }) {
  const brands = getFeaturedDiscountBrands();

  return (
    <section aria-labelledby="brand-discounts-heading" className="border-y border-white/10 bg-[#0d1113] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div data-motion="" className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <h2 id="brand-discounts-heading" className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">SaaS discounts by brand</h2>
            <p className="text-base leading-relaxed text-zinc-400">Compare coupon availability, annual savings and the terms for your software.</p>
          </div>
          <Link href="/discounts" className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline decoration-[#C6FF3D]/40 underline-offset-4 hover:decoration-current">All brand discounts</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-home-brands="">
          {brands.map((tool, index) => (
            <Link key={tool.slug} data-motion={index % 4} prefetch={false} href={`/discounts/${tool.slug}`} className="motion-card group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-[#141a1b] p-4 sm:p-5">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/[0.07] font-display text-sm font-bold text-[#C6FF3D]">{tool.logoLetter || tool.name.slice(0, 2)}</span>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-display font-semibold text-white group-hover:text-[#C6FF3D]">{tool.name} discounts</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{brandSavingsSummary(tool, deals)}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/about#standards" className="inline-flex min-h-11 items-center text-sm text-zinc-400 underline underline-offset-4 hover:text-white">How we check offers</Link>
      </div>
    </section>
  );
}
