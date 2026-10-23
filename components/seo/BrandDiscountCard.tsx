import Link from "next/link";
import { brandSavingsSummary } from "@/lib/brand-discounts";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import type { DetailedTool, SaaSDeal } from "@/lib/types";

export function BrandDiscountCard({ tool, deals }: { tool: DetailedTool; deals: SaaSDeal[] }) {
  return <Link href={`/discounts/${tool.slug}`} className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#09090C] p-6 transition-colors hover:border-[#C6FF3D]/50 focus-visible:outline-2 focus-visible:outline-[#C6FF3D]">
    <span className="text-xs font-mono text-zinc-500">{tool.category}</span>
    <h3 className="font-display text-xl font-bold text-white">{tool.name} discounts & coupon codes</h3>
    <p className="text-sm font-semibold text-[#C6FF3D]">{brandSavingsSummary(tool, deals)}</p>
    <p className="flex-1 text-sm leading-relaxed text-zinc-400">{BRAND_DISCOUNT_GUIDES[tool.slug]?.intro || `Compare sourced ${tool.name} offers, eligible plans, code requirements and renewal terms.`}</p>
    <span className="pt-2 text-sm text-zinc-200">Compare savings & how to claim →</span>
  </Link>;
}
