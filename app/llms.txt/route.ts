import { getAllDeals } from "@/lib/data/deals-data";
import { getIndexableDiscountBrands, brandHeadlineSaving, brandSavingsSummary } from "@/lib/brand-discounts";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { SAVINGS_COLLECTIONS } from "@/lib/data/savings-collections";
import { POPULAR_COMPARISONS } from "@/lib/data/comparisons-data";
import { getCatalogCategories } from "@/lib/categories";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/seo";

// A plain-text guide to the site for AI assistants and answer engines
// (https://llmstxt.org). Generated from the same data as the pages and sitemap.
export const revalidate = 3600;

const line = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;

export function GET() {
  const deals = getAllDeals();
  const brands = getIndexableDiscountBrands().sort((a, b) => a.name.localeCompare(b.name));
  const articles = [...DETAILED_ARTICLES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const body = [
    "# SaaSFolio",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "SaaSFolio lists software discounts, coupon codes, free trials and startup, student and nonprofit programs. Every offer names its source (the provider's own page or a coupon publisher) and the date the source was last checked. Offers older than 14 days, or past a published expiry, are removed automatically. Offers are source-checked, not tested at checkout: always confirm the final price with the provider.",
    "",
    "## Brand discount guides",
    "",
    "One page per brand answering \"is there a discount or coupon code?\", with sourced offers, official savings options, eligibility and FAQs.",
    "",
    ...brands.map(tool => line(`${tool.name} discounts`, `/discounts/${tool.slug}`, brandHeadlineSaving(tool, deals) || brandSavingsSummary(tool, deals))),
    "",
    "## Savings programs",
    "",
    ...SAVINGS_COLLECTIONS.map(collection => line(collection.navLabel, `/${collection.slug}`)),
    line("All software deals", "/deals"),
    ...getCatalogCategories().filter(category => category.dealCount > 0).map(category => line(`${category.name} deals`, `/deals/category/${category.slug}`, `${category.dealCount} offers`)),
    "",
    "## Comparisons and buying guides",
    "",
    ...articles.filter(article => article.category === "Comparisons").slice(0, 25).map(article => line(article.title, `/articles/${article.slug}`, article.summary)),
    ...POPULAR_COMPARISONS.map(comparison => line(comparison.title, `/compare/${comparison.slug}`)),
    "",
    "## Optional",
    "",
    ...articles.filter(article => article.category !== "Comparisons").slice(0, 30).map(article => line(article.title, `/articles/${article.slug}`)),
    line("How we check offers", "/about#standards"),
    line("Editorial policy", "/editorial-policy"),
    line("Affiliate disclosure", "/affiliate-disclosure", "Some links earn a commission; sponsored placements are labelled."),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
