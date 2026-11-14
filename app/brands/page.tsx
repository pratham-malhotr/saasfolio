import Link from "next/link";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBrandDirectory } from "@/lib/brand-directory";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";

const title = "Software Brands A–Z: SaaS Tools, Hosting & Buying Guides";
const description = "Explore software brands by category, from AI and productivity to hosting. Read product profiles, compare alternatives and find sourced savings guides.";
export const metadata = pageMetadata({ title, description, path: "/brands" });
export const revalidate = 3600;

export default async function BrandsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const brands = getBrandDirectory();
  return <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
    <JsonLd data={collectionSchema(title, description, "/brands", brands.map(brand => ({ name: brand.name, path: brand.hasGuide ? `/discounts/${brand.slug}` : `/tools/${brand.slug}` })))} />
    <header className="max-w-3xl space-y-4"><p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">Find your software</p><h1 className="font-display text-4xl sm:text-5xl font-bold text-white">Software brands, A–Z</h1><p className="text-lg text-zinc-400">Browse {brands.length} listed SaaS brands. Find coupon availability, free plans, trials and the brands with an original savings guide.</p><p className="text-sm text-zinc-400">Only recorded codes appear under the coupon filter. Free access and standard pricing are labeled separately. <Link href="/about#standards" className="text-[#C6FF3D] underline">How we check offers</Link>.</p></header>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/5 px-6 py-4"><p className="text-sm text-zinc-300">Building a useful product? Give readers a reason to discover it.</p><Link href="/submit" className="text-sm font-semibold text-[#C6FF3D]">Add your brand →</Link></div>
    <BrandDirectory key={`${query}:${category}`} brands={brands} initialQuery={query} initialCategory={category} />
  </article>;
}
