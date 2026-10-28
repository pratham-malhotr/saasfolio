import Link from "next/link";
import { CATEGORY_SEARCH_CONTENT } from "@/lib/data/category-search-content";
import { getArticleBySlug } from "@/lib/data/articles-data";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";
import { isoDate } from "@/lib/seo";

export function CategoryBuyingGuide({ slug }: { slug: string }) {
  const content = CATEGORY_SEARCH_CONTENT[slug];
  if (!content) return null;
  const articles = content.articleSlugs.flatMap(articleSlug => { const article = getArticleBySlug(articleSlug); return article ? [article] : []; });
  return <div data-category-buying-guide={slug} className="mt-12 space-y-8 border-t border-white/10 pt-10">
    <section className="max-w-4xl space-y-4"><h2 className="font-display text-2xl font-bold text-white">How to compare {content.heading.toLowerCase()}</h2><p className="text-sm leading-relaxed text-zinc-400">{content.overview}</p></section>
    <section className="space-y-5"><h2 className="font-display text-2xl font-bold text-white">Compare the workload and the full cost</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[620px] text-left text-sm"><caption className="sr-only">Category buying criteria and costs to check</caption>
        <thead className="bg-[#09090C] text-white"><tr>{["Measure", "Match these details", "Cost to check"].map(label => <th scope="col" key={label} className="p-4 font-semibold">{label}</th>)}</tr></thead>
        <tbody>{content.decisions.map(row => <tr key={row.measure} className="border-t border-white/10"><th scope="row" className="p-4 font-medium text-zinc-200">{row.measure}</th><td className="p-4 leading-relaxed text-zinc-400">{row.compare}</td><td className="p-4 leading-relaxed text-zinc-400">{row.risk}</td></tr>)}</tbody>
      </table></div>
      <ul className="list-disc space-y-3 pl-5 text-sm text-zinc-400">{content.checklist.map(item => <li key={item}>{item}</li>)}</ul>
      <p className="text-sm text-zinc-400">Use the provider’s current quotes to <Link href="/savings-calculator" className="text-[#C6FF3D] underline">compare monthly and annual billing</Link>. Source dates describe observations, and the provider determines eligibility and the final payable amount.</p>
    </section>
    <section className="space-y-4"><h2 className="font-display text-2xl font-bold text-white">Questions about these software offers</h2>{content.faqs.map(faq => <details key={faq.question} className="rounded-2xl border border-white/10 bg-[#09090C] p-5"><summary className="cursor-pointer font-semibold text-white">{faq.question}</summary><p className="pt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p></details>)}</section>
    {articles.length > 0 && <nav aria-label="Read the buying guidance" className="space-y-3"><h2 className="font-display text-xl font-semibold text-white">Read the buying guidance</h2><ul className="space-y-3 text-sm text-[#C6FF3D]">{articles.map(article => <li key={article.slug}><Link prefetch={false} href={`/articles/${article.slug}`} className="underline">{article.title}</Link></li>)}</ul></nav>}
    <SavingsCollectionLinks slugs={content.collections} heading="Find an eligible savings route" />
    <p className="text-xs leading-relaxed text-zinc-500">Buying guidance by <Link href="/about#standards" className="underline">SaaSFolio editorial</Link>, updated <time dateTime={isoDate(content.updatedAt)}>{content.updatedAt}</time>. Offer source checks and published expiry dates are recorded separately.</p>
  </div>;
}
