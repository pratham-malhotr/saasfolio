import { CATEGORIES } from "@/lib/catalog-categories";
import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";

export function getCatalogCategories() {
  const tools = getAllTools();
  const deals = getAllDeals();
  return CATEGORIES.map(category => ({ ...category,
    toolCount: tools.filter(tool => tool.categorySlug === category.slug).length,
    dealCount: deals.filter(deal => deal.categorySlug === category.slug && deal.dealType !== "pricing").length,
  }));
}
