import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { brandSavingsSummary } from "@/lib/brand-discounts";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import type { DetailedTool, SaaSDeal } from "@/lib/types";

export function BrandDiscountCard({ tool, deals }: { tool: DetailedTool; deals: SaaSDeal[] }) {
  return (
    <Link href={`/discounts/${tool.slug}`} prefetch={false} className="discount-card motion-card">
      <div className="discount-card-top">
        <BrandAvatar name={tool.name} slug={tool.slug} letters={tool.logoLetter} category={tool.categorySlug} />
        <span>{tool.category}</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </div>
      <h3>{tool.name} discounts</h3>
      <p>{brandSavingsSummary(tool, deals)}</p>
      <p>{BRAND_DISCOUNT_GUIDES[tool.slug]?.intro || `Compare sourced ${tool.name} offers, eligible plans, code requirements and renewal terms.`}</p>
    </Link>
  );
}
