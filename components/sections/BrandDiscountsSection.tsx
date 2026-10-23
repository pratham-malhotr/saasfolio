import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { brandSavingsSummary, getFeaturedDiscountBrands } from "@/lib/brand-discounts";
import type { SaaSDeal } from "@/lib/types";

// Keep the brand links and savings summaries in the initial server HTML.
export function BrandDiscountsSection({ deals }: { deals: SaaSDeal[] }) {
  const brands = getFeaturedDiscountBrands();
  return <section aria-labelledby="brand-discounts-heading" className="border-b border-white/10 bg-[#050505] py-12 sm:py-16">
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <Reveal className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 id="brand-discounts-heading" className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Find your next saving.</h2>
          <p className="text-sm text-zinc-400">Brand discounts, with the terms up front.</p>
        </div>
        <Link href="/discounts" className="group flex items-center gap-2 text-sm font-semibold text-[#C6FF3D]">All brand discounts <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
      </div>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-home-brands="">
        {brands.map((tool, index) => <Reveal key={tool.slug} delay={index * 0.045} className="h-full">
          <Link href={`/discounts/${tool.slug}`} className="group flex h-full items-center gap-4 rounded-2xl border border-white/10 bg-[#09090C] p-5 transition-colors hover:border-[#C6FF3D]/40 hover:bg-[#C6FF3D]/[0.03]">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-display text-sm font-bold text-zinc-300 transition-colors group-hover:border-[#C6FF3D]/30 group-hover:text-[#C6FF3D]">{tool.logoLetter || tool.name.slice(0, 2)}</span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <h3 className="font-display font-semibold text-white">{tool.name}</h3>
              <p className="text-xs leading-relaxed text-zinc-400">{brandSavingsSummary(tool, deals)}</p>
            </div>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#C6FF3D]" />
          </Link>
        </Reveal>)}
      </div>
      <p className="text-xs text-zinc-500">A selection across software categories. <Link href="/about#standards" className="underline underline-offset-4 hover:text-zinc-300">How we check offers</Link></p>
    </div>
  </section>;
}
