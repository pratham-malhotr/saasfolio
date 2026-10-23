import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";

export function getBrandDirectory() {
  const offers = getAllDeals().filter(offer => offer.dealType !== "pricing");
  const guides = new Set(getIndexableDiscountBrands().map(tool => tool.slug));
  return getAllTools().map(tool => {
    const current = offers.filter(offer => offer.toolSlug === tool.slug);
    const initial = tool.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
    return { slug: tool.slug, name: tool.name, category: tool.category, letter: /^[A-Z]$/.test(initial) ? initial : "#", codeCount: current.filter(offer => offer.code).length, hasFreeOption: current.some(offer => offer.dealType === "free_plan" || offer.dealType === "free_trial"), hasOffer: current.length > 0, hasGuide: guides.has(tool.slug) };
  }).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}
export type BrandDirectoryEntry = ReturnType<typeof getBrandDirectory>[number];
