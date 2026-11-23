import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBrandDirectory } from "@/lib/brand-directory";
import { includeApprovedBrands } from "@/lib/server/brand-listings";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";
import "./brands.css";

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
  return <article className="brand-page">
    <JsonLd data={collectionSchema(title, description, "/brands", catalog.map(brand => ({ name: brand.name, path: brand.hasGuide ? `/discounts/${brand.slug}` : `/tools/${brand.slug}` })))} />
    <div className="brand-intro">
      <div className="brand-shell brand-intro-grid">
        <header>
          <h1>Software brands <span>A–Z</span></h1>
          <p>Search {brands.length} software brands by name or category. Explore product profiles, free plans, trials, and recorded coupons.</p>
          <Link href="/tools" className="brand-text-link">Browse product profiles <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </header>
        <aside aria-label="For software makers">
          <Link href="/submit" className="brand-text-link">Add your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link href="/brands/promote" className="brand-text-link">Promote your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </aside>
      </div>
    </div>
    <div className="brand-shell brand-results">
      <BrandDirectory key={`${query}:${category}`} brands={brands} initialQuery={query} initialCategory={category} />
    </div>
  </article>;
}
