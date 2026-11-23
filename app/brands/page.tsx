import Link from "next/link";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBrandDirectory } from "@/lib/brand-directory";
import { includeApprovedBrands } from "@/lib/server/brand-listings";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";

const title = "Software Brands A–Z & SaaS Companies";
const description = "Find software brands by name or category, from AI tools to web hosting. Open product profiles and check coupon availability, free plans and trials.";
type BrandSearch = { q?: string | string[]; category?: string | string[] };

function getBrandFilters(params: BrandSearch) {
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.slice(0, 100).trim() || "";
  const category = (Array.isArray(params.category) ? params.category[0] : params.category)?.trim() || "all";
  return { query, category };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<BrandSearch> }) {
  const { query, category } = getBrandFilters(await searchParams);
  return pageMetadata({ title, description, path: "/brands", noIndex: Boolean(query || category !== "all") });
}
export const revalidate = 3600;

export default async function BrandsPage({ searchParams }: { searchParams: Promise<BrandSearch> }) {
  const { query, category } = getBrandFilters(await searchParams);
  const catalog = getBrandDirectory();
  const brands = await includeApprovedBrands(catalog);
  return <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
    <JsonLd data={collectionSchema(title, description, "/brands", catalog.map(brand => ({ name: brand.name, path: brand.hasGuide ? `/discounts/${brand.slug}` : `/tools/${brand.slug}` })))} />
    <header className="max-w-3xl space-y-4"><h1 className="font-display text-4xl sm:text-5xl font-bold text-white">Software brands A–Z</h1><p className="text-lg text-zinc-400">Browse {brands.length} software brands by name or category. Open a SaaS company’s product profile or check its coupon availability, free plans and trials.</p><p className="text-sm text-zinc-400">Evaluating the software itself? Read the <Link href="/tools" className="text-[#C6FF3D] underline">SaaS product profiles</Link> for workflow and plan guidance. <Link href="/about#standards" className="text-[#C6FF3D] underline">See how we check offers</Link>.</p></header>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/5 px-6 py-4"><p className="text-sm text-zinc-300">Building a useful product? Give readers a reason to discover it.</p><div className="flex flex-wrap gap-5"><Link href="/submit" className="text-sm font-semibold text-[#C6FF3D]">Add your brand →</Link><Link href="/brands/promote" className="text-sm font-semibold text-[#C6FF3D]">Promote your brand →</Link></div></div>
    <BrandDirectory key={`${query}:${category}`} brands={brands} initialQuery={query} initialCategory={category} />
  </article>;
}
