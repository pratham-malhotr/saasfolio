import { notFound } from "next/navigation";
import { DealsExplorer } from "@/components/deals/DealsExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogCategories } from "@/lib/categories";
import { getAllDeals } from "@/lib/data/deals-data";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";
import { RelatedDiscountGuides } from "@/components/seo/RelatedDiscountGuides";
import { CATEGORY_SEARCH_CONTENT } from "@/lib/data/category-search-content";
import { CategoryBuyingGuide } from "@/components/seo/CategoryBuyingGuide";
import { getPublishedSavingsOffers } from "@/lib/savings-collections";

export function generateStaticParams() {
  return getCatalogCategories().map(category => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCatalogCategories().find(item => item.slug === slug);
  if (!category) notFound();
  const content = CATEGORY_SEARCH_CONTENT[slug];
  return pageMetadata({ title: content?.title || `${category.name} Software Deals & Free Trials`,
    description: content?.description || category.description,
    path: `/deals/category/${slug}` });
}

export const revalidate = 3600;

export default async function CategoryDealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCatalogCategories().find(item => item.slug === slug);
  if (!category) notFound();
  const deals = getPublishedSavingsOffers(getAllDeals());
  const categoryDeals = deals.filter(deal => deal.categorySlug === slug);
  const content = CATEGORY_SEARCH_CONTENT[slug];
  const discountBrands = getIndexableDiscountBrands().filter(tool => tool.categorySlug === slug);
  return <div className="min-h-screen bg-[#050505]">
    <JsonLd data={collectionSchema(content?.heading || `${category.name} Software Offers`, content?.description || category.description, `/deals/category/${slug}`,
      categoryDeals.filter(deal => (deal.dealPrice ?? 0) <= 500).map(deal => ({ name: deal.title, path: `/deals/${deal.slug}` })))} />
    <DealsExplorer key={slug} initialDeals={deals} initialCategory={slug} heading={content?.heading || `${category.name} Offers`} description={content?.answer || category.description}
      discountGuides={<RelatedDiscountGuides brands={discountBrands} deals={deals} heading={`${category.name} discounts by brand`} />}
      afterResults={<CategoryBuyingGuide slug={slug} />} />
  </div>;
}
