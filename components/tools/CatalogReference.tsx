import Link from "next/link";
import type { DetailedTool } from "@/lib/types";
import { getPublishedTools } from "@/lib/published-catalog";

// Keep previously shared URLs useful without republishing unreviewed legacy
// features, prices, benchmarks, testimonials or compliance claims.
export function CatalogReference({ tool }: { tool: DetailedTool }) {
  const alternatives = getPublishedTools().filter(item => item.categorySlug === tool.categorySlug).slice(0, 4);
  return <article data-catalog-reference="true" className="mx-auto max-w-4xl px-4 pt-32 pb-24 space-y-8">
    <header className="space-y-4"><p className="text-xs font-mono text-zinc-400">Directory reference</p><h1 className="text-4xl font-display font-bold text-white">{tool.name}</h1><p className="text-zinc-300 leading-relaxed">This older directory reference is outside our published buying-guide collection. We do not present its previous generated features, prices or ratings as reviewed product information.</p></header>
    <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">Make a comparison you can use</h2><p className="text-zinc-400 leading-relaxed">Write down the work you need to complete, the people who need access and the amount of usage you expect. Obtain the provider’s current quote for that configuration, then compare its full commitment and renewal cost with the alternatives. A listed product name is not a recommendation or evidence of a discount.</p><Link href="/articles/build-a-saas-budget-before-buying" className="inline-block text-[#C6FF3D] underline">Build a software buying budget</Link></section>
    {alternatives.length > 0 && <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">Related software with published buying guidance</h2><ul className="space-y-3">{alternatives.map(item => <li key={item.slug}><Link href={`/tools/${item.slug}`} className="text-[#C6FF3D] underline">{item.name}</Link><p className="text-sm text-zinc-400 mt-1">{item.description}</p></li>)}</ul></section>}
    <nav aria-label="Continue reading" className="flex flex-wrap gap-6 text-[#C6FF3D]"><Link href="/tools" className="underline">Software buying guides</Link><Link href="/editorial-policy" className="underline">Editorial standards</Link><Link href={`/contact?brand=${tool.slug}`} className="underline">Suggest a correction</Link></nav>
  </article>;
}
