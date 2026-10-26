import Link from "next/link";
import type { DetailedTool, SaaSDeal } from "@/lib/types";
import { brandSavingsSummary, getBrandDiscountData, hasBrandDiscountPage } from "@/lib/brand-discounts";
import { BrandSourcePanel } from "@/components/seo/BrandSourcePanel";

// Server rendered on every tool profile, including brands without a dedicated guide.
export function BrandDiscountSummary({ tool, deals }: { tool: DetailedTool; deals: SaaSDeal[] }) {
  const { offers, coupons: codes, savingsOptions, purchaseChecks } = getBrandDiscountData(tool, deals);
  const guidePath = hasBrandDiscountPage(tool.slug) ? `/discounts/${tool.slug}` : undefined;
  return <div className="mb-10 space-y-6"><section className="p-6 rounded-2xl bg-[#09090C] border border-white/10 space-y-3">
    <h2 className="font-display text-xl font-bold text-white">{tool.name} discounts & coupon availability</h2>
    {guidePath && <p className="text-sm font-semibold text-[#C6FF3D]">{brandSavingsSummary(tool, deals)}</p>}
    <p className="text-sm text-zinc-400 leading-relaxed">{codes.length
      ? `${codes.length} sourced ${tool.name} ${codes.length === 1 ? "coupon is" : "coupons are"} recorded. Review each source, eligible plan, and renewal terms. Codes have not been checkout tested.`
      : `No current ${tool.name} discount code is recorded. ${offers.length ? "Any free plans or trials below are separate from a paid-plan coupon." : "Use the official pricing link for available plans and promotions."} An affiliate link alone does not apply a discount.`}</p>
    {guidePath && <>
      <Link href={guidePath} className="inline-block text-sm font-semibold text-[#C6FF3D] underline">{tool.name} discounts, offer terms & savings guide →</Link>
      <nav aria-label={`${tool.name} discount guide shortcuts`} className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-300">
        <Link href={`${guidePath}#${codes.length ? "coupon-codes" : "current-offers"}`} className="underline">{tool.name} coupon status</Link>
        {savingsOptions.length > 0 && <Link href={`${guidePath}#provider-savings`} className="underline">Savings without a code</Link>}
        {purchaseChecks && <Link href={`${guidePath}#eligibility`} className="underline">Discount eligibility</Link>}
        <Link href={`${guidePath}#redemption`} className="underline">How to claim an offer</Link>
      </nav>
    </>}
  </section><BrandSourcePanel tool={tool} /></div>;
}
