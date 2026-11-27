import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { brandSavingsSummary, getFeaturedDiscountBrands } from "@/lib/brand-discounts";
import type { SaaSDeal } from "@/lib/types";

export function BrandDiscountsSection({ deals }: { deals: SaaSDeal[] }) {
  const brands = getFeaturedDiscountBrands(12);

  return (
    <section aria-labelledby="brand-discounts-heading" className="market-section">
      <div className="home-section-head" data-motion="">
        <div>
          <p className="market-kicker">Brand guides</p>
          <h2 id="brand-discounts-heading" className="home-section-title">SaaS discounts by brand</h2>
          <p>Check coupon availability, annual billing options, and program eligibility.</p>
        </div>
        <Link href="/discounts" className="market-button market-button-secondary">All brand discounts <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className="home-brand-grid" data-home-brands="">
        {brands.map((tool, index) => (
          <Link key={tool.slug} href={`/discounts/${tool.slug}`} prefetch={false} className="home-brand-link motion-card" data-motion={index % 4}>
            <BrandAvatar name={tool.name} letters={tool.logoLetter} category={tool.categorySlug} />
            <span><strong>{tool.name}</strong><small>{brandSavingsSummary(tool, deals)}</small></span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
