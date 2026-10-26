import Link from "next/link";
import type { DetailedTool, SaaSDeal } from "@/lib/types";
import { brandSavingsSummary } from "@/lib/brand-discounts";

// Resolve brands on the server; these links remain available without filtering
// or JavaScript, including when no individual coupon listing is current.
export function RelatedDiscountGuides({ brands, deals, heading }: {
  brands: DetailedTool[];
  deals: SaaSDeal[];
  heading: string;
}) {
  if (!brands.length) return null;
  return <section aria-label={heading} data-related-discount-guides="" className="mb-10 space-y-4 rounded-2xl border border-white/10 bg-[#09090C] p-5 sm:p-6">
    <h2 className="font-display text-xl font-bold text-white">{heading}</h2>
    <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">Compare the provider’s billing options, coupon availability and eligibility before choosing a subscription.</p>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map(tool => <li key={tool.slug} className="space-y-1 rounded-xl border border-white/10 p-4">
        <Link href={`/discounts/${tool.slug}`} className="font-semibold text-[#C6FF3D] underline underline-offset-4">{tool.name} discounts & coupon codes</Link>
        <p className="text-xs leading-relaxed text-zinc-400">{brandSavingsSummary(tool, deals)}</p>
      </li>)}
    </ul>
  </section>;
}
