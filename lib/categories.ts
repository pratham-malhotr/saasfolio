import { CATEGORIES } from "@/lib/catalog-categories";
import { getPublishedTools, getPublishedOffers } from "@/lib/published-catalog";

export function getCatalogCategories() {
  const tools = getPublishedTools();
  const deals = getPublishedOffers();
  return CATEGORIES.map(category => ({ ...category,
    toolCount: tools.filter(tool => tool.categorySlug === category.slug).length,
    dealCount: deals.filter(deal => deal.categorySlug === category.slug && deal.dealType !== "pricing").length,
  }));
}
