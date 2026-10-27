import CompareHubClient from "@/components/compare/CompareHubClient";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { POPULAR_COMPARISONS } from "@/lib/data/comparisons-data";
import { getAllTools } from "@/lib/data/tools-data";

export const metadata = pageMetadata({
  title: 'Compare SaaS Tools: Pricing, Features & Deals',
  description: 'Compare SaaS tools side by side. Explore software pricing, features, pros and cons, alternatives and available discounts before choosing your stack.',
  path: "/compare",
});

export default function Page() {
  const tools = getAllTools().map(({ id, slug, name, category }) => ({ id, slug, name, category }));
  return <><JsonLd data={collectionSchema('Compare SaaS Tools: Pricing, Features & Deals', 'Compare SaaS tools side by side. Explore software pricing, features, pros and cons, alternatives and available discounts before choosing your stack.', "/compare", POPULAR_COMPARISONS.map((item) => ({ name: item.title, path: `/compare/${item.slug}` })))} /><CompareHubClient tools={tools} comparisons={POPULAR_COMPARISONS} /></>;
}
