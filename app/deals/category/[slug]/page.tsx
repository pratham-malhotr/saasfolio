import { notFound } from "next/navigation";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogCategories } from "@/lib/categories";
import { getAllDeals } from "@/lib/data/deals-data";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";
import { RelatedDiscountGuides } from "@/components/seo/RelatedDiscountGuides";

export function generateStaticParams() {
  return getCatalogCategories().map(category => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCatalogCategories().find(item => item.slug === slug);
  if (!category) notFound();
  return pageMetadata({ title: `${category.name} Software Deals & Free Trials`,
    description: `${category.description} Explore ${category.toolCount} brand profiles, sourced software offers, free trials, and official pricing links.`,
    path: `/deals/category/${slug}` });
}

export const revalidate = 3600;

export default async function CategoryDealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCatalogCategories().find(item => item.slug === slug);
  if (!category) notFound();
  const deals = getAllDeals();
  const categoryDeals = deals.filter(deal => deal.categorySlug === slug);
  const discountBrands = getIndexableDiscountBrands().filter(tool => tool.categorySlug === slug);
  return <div className="min-h-screen bg-[#050505]">
    <JsonLd data={collectionSchema(`${category.name} Software Offers`, category.description, `/deals/category/${slug}`,
      categoryDeals.map(deal => ({ name: deal.title, path: `/deals/${deal.slug}` })))} />
    <DealsExplorer initialDeals={deals} initialCategory={slug} heading={`${category.name} Offers`} description={category.description}
      discountGuides={<RelatedDiscountGuides brands={discountBrands} deals={deals} heading={`${category.name} discounts by brand`} />} />
  </div>;
}
