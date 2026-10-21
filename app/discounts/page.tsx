import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";

const title = "Software Discounts & Coupon Codes by Brand";
const description = "Find brand-specific software discounts, coupon availability and savings guides. Compare sourced offers, free options, eligibility and renewal terms.";
export const metadata = pageMetadata({ title, description, path: "/discounts" });
export const revalidate = 3600;

export default function BrandDiscountsPage() {
  const brands = getIndexableDiscountBrands();
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
    <JsonLd data={collectionSchema(title, description, "/discounts", brands.map(tool => ({ name: `${tool.name} discounts`, path: `/discounts/${tool.slug}` })))} />
    <header className="max-w-3xl space-y-4">
      <p className="text-[#C6FF3D] font-mono text-xs uppercase tracking-widest">Brand savings guides</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">Software discounts by brand</h1>
      <p className="text-lg text-zinc-400 leading-relaxed">Choose a brand to check coupon availability, compare ways to save, and understand the terms before you pay. Each guide separates paid discounts from free plans and trials.</p>
    </header>
    <div className="grid sm:grid-cols-2 gap-4">{brands.map(tool => <Link key={tool.slug} href={`/discounts/${tool.slug}`} className="p-6 rounded-2xl border border-white/10 bg-[#09090C] hover:border-[#C6FF3D]/40 space-y-3">
      <span className="text-xs font-mono text-zinc-500">{tool.category}</span>
      <h2 className="font-display text-xl text-white font-bold">{tool.name} discounts & coupon codes</h2>
      <p className="text-sm text-zinc-400 leading-relaxed">{BRAND_DISCOUNT_GUIDES[tool.slug]?.intro || `Offer status, eligibility, redemption steps, and ways to save on ${tool.name}.`}</p>
      <span className="inline-block text-sm text-[#C6FF3D]">Read the savings guide →</span>
    </Link>)}</div>
    <p className="text-sm text-zinc-400">More software: <Link href="/deals" className="text-[#C6FF3D] underline">Browse all offers</Link> · <Link href="/tools" className="text-[#C6FF3D] underline">Explore the software directory</Link></p>
  </div>;
}
