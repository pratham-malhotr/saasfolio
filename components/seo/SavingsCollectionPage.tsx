import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";
import { SavingsOfferCard } from "@/components/seo/SavingsOfferCard";
import { getSavingsCollection, type SavingsCollectionSlug } from "@/lib/data/savings-collections";
import { getCollectionOffers, getCollectionPrograms } from "@/lib/savings-collections";
import { getArticleBySlug } from "@/lib/data/articles-data";
import { collectionSchema } from "@/lib/structured-data";
import { isoDate, pageMetadata } from "@/lib/seo";

export function savingsCollectionMetadata(slug: SavingsCollectionSlug) {
  const collection = getSavingsCollection(slug)!;
  return pageMetadata({ title: collection.title, description: collection.description, path: `/${slug}`, image: `/${slug}/opengraph-image` });
}

export function SavingsCollectionPage({ slug }: { slug: SavingsCollectionSlug }) {
  const collection = getSavingsCollection(slug)!;
  const offers = getCollectionOffers(slug);
  const programs = getCollectionPrograms(slug);
  const articles = collection.articleSlugs.flatMap(articleSlug => { const article = getArticleBySlug(articleSlug); return article ? [article] : []; });
  const items = [...offers.map(deal => ({ name: deal.title, path: `/deals/${deal.slug}` })), ...programs.map(program => ({ name: program.name, path: program.path }))];
  const schema = collectionSchema(collection.title, collection.description, `/${slug}`, items);
  return <article data-savings-collection={slug} className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-32 sm:px-6 lg:px-8">
    <JsonLd data={{ ...schema, "@graph": schema["@graph"].map((entry, index) => index === 0 ? { ...entry, dateModified: isoDate(collection.updatedAt) } : entry) }} />
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-zinc-400"><Link href="/" className="hover:text-[#C6FF3D]">Home</Link><span aria-hidden="true">/</span><span>{collection.navLabel}</span></nav>
    <header className="max-w-4xl space-y-5">
      <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">SaaSFolio savings collections</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">{collection.heading}</h1>
      <p data-collection-answer="" className="text-lg leading-relaxed text-zinc-300">{collection.answer}</p>
      <p className="text-xs leading-relaxed text-zinc-500">By <Link href="/about#standards" className="underline">SaaSFolio editorial</Link> · Updated <time dateTime={isoDate(collection.updatedAt)}>{collection.updatedAt}</time></p>
    </header>
    <nav aria-label="On this page" className="flex flex-wrap gap-3 text-sm text-[#C6FF3D]">
      <a href="#current-offers" className="rounded-full border border-white/15 px-4 py-2">Current records ({offers.length})</a>
      {programs.length > 0 && <a href="#program-directory" className="rounded-full border border-white/15 px-4 py-2">Program routes ({programs.length})</a>}
      <a href="#compare-options" className="rounded-full border border-white/15 px-4 py-2">Compare options</a>
      <a href="#questions" className="rounded-full border border-white/15 px-4 py-2">Questions</a>
    </nav>
    <section id="current-offers" className="scroll-mt-28 space-y-5">
      <h2 className="font-display text-2xl font-bold text-white">{slug === "coupon-codes" ? "Currently recorded software coupon codes" : "Current source-backed program records"}</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">{slug === "coupon-codes" ? `${offers.length} recorded codes across ${new Set(offers.map(deal => deal.toolSlug)).size} brands. A source check records what the source reports; these codes are not checkout tested.` : `${offers.length} current catalog records match the program routes in this collection. Application approval, signup and checkout have not been tested. A program directory entry is not itself a current offer record.`}</p>
      {offers.length ? <div className="grid gap-5 md:grid-cols-2">{offers.map(deal => <SavingsOfferCard key={deal.slug} deal={deal} />)}</div> : <div className="rounded-2xl border border-white/10 bg-[#09090C] p-6 space-y-3">
        <p className="font-semibold text-white">No qualifying current records are available in this collection.</p>
        <p className="text-sm text-zinc-400">The provider may still have a program or a pricing option. Check its official terms through the routes below or <Link href="/discounts" className="text-[#C6FF3D] underline">find your brand discount guide</Link>. An empty list does not establish that a guessed code works.</p>
      </div>}
    </section>
    <p className="max-w-4xl text-sm leading-relaxed text-zinc-400">{collection.intro}</p>
    {programs.length > 0 && <section id="program-directory" className="scroll-mt-28 space-y-5">
      <h2 className="font-display text-2xl font-bold text-white">Official program routes and eligibility checks</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">Selected provider programs to investigate for your situation. Availability and application rules can change; follow the official source for a current decision. These descriptions do not grant approval or apply a promotion.</p>
      <div className="grid gap-4 md:grid-cols-2">{programs.map(program => <article key={program.brandSlug} data-program-brand={program.brandSlug} className="space-y-4 rounded-2xl border border-white/10 p-6">
        <h3 className="font-display text-xl font-semibold text-white">{program.name}</h3>
        <dl className="space-y-3 text-sm leading-relaxed"><div><dt className="text-zinc-500">Who should check</dt><dd className="text-zinc-300">{program.audience}</dd></div><div><dt className="text-zinc-500">Before applying</dt><dd className="text-zinc-400">{program.check}</dd></div></dl>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#C6FF3D]">
          <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Official program source ↗</a>
          <Link prefetch={false} href={program.path} className="underline">{program.hasGuide ? "Brand discount guide" : "Software profile and current offers"}</Link>
        </div>
      </article>)}</div>
    </section>}
    <section id="compare-options" className="scroll-mt-28 space-y-5">
      <h2 className="font-display text-2xl font-bold text-white">Compare the type of saving before choosing an offer</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="min-w-[620px] w-full text-left text-sm">
        <caption className="sr-only">Saving routes, eligibility requirements and costs to compare</caption>
        <thead className="bg-[#09090C] text-white"><tr>{["Route", "What qualifies", "What to cost"].map(label => <th key={label} scope="col" className="p-4 font-semibold">{label}</th>)}</tr></thead>
        <tbody className="text-zinc-400">{collection.comparison.map(row => <tr key={row.route} className="border-t border-white/10"><th scope="row" className="p-4 font-medium text-zinc-200">{row.route}</th><td className="p-4 leading-relaxed">{row.requirement}</td><td className="p-4 leading-relaxed">{row.costCheck}</td></tr>)}</tbody>
      </table></div>
      <p className="text-sm text-zinc-400">Have equivalent monthly and annual quotes? <Link href="/savings-calculator" className="text-[#C6FF3D] underline">Compare the twelve-month cost including any access fee</Link>. The calculator does not validate a coupon or an application.</p>
    </section>
    <section id="buying-checklist" className="scroll-mt-28 space-y-5">
      <h2 className="font-display text-2xl font-bold text-white">A practical buying checklist</h2>
      <ol className="grid gap-5 md:grid-cols-2">{collection.steps.map((step, index) => <li key={step.title} className="space-y-3 rounded-2xl border border-white/10 p-6">
        <h3 className="font-display text-lg font-semibold text-white">{index + 1}. {step.title}</h3><p className="text-sm leading-relaxed text-zinc-400">{step.text}</p>
      </li>)}</ol>
    </section>
    <section id="questions" className="scroll-mt-28 space-y-4">
      <h2 className="font-display text-2xl font-bold text-white">{collection.navLabel}: common questions</h2>
      {collection.faqs.map(faq => <details key={faq.question} className="rounded-2xl border border-white/10 bg-[#09090C] p-5"><summary className="cursor-pointer font-semibold text-white">{faq.question}</summary><p className="pt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p></details>)}
    </section>
    {articles.length > 0 && <nav aria-label="Related software buying guides" className="space-y-4"><h2 className="font-display text-2xl font-bold text-white">Work through the buying decision</h2><ul className="space-y-3 text-sm text-[#C6FF3D]">{articles.map(article => <li key={article.slug}><Link prefetch={false} href={`/articles/${article.slug}`} className="underline">{article.title}</Link></li>)}</ul></nav>}
    <SavingsCollectionLinks current={slug} />
    <aside className="space-y-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-zinc-500">
      <p>Records leave the current catalog when their source check becomes older than 14 days or a published expiry passes. Editorial guidance and program links do not substitute for an approved offer.</p>
      <p>Some provider links may earn SaaSFolio a commission. A referral does not itself create a discount. <Link href="/about#standards" className="underline">How we check sources</Link> · <Link href="/affiliate-disclosure" className="underline">Affiliate disclosure</Link> · <Link href="/contact" className="underline">Report an incorrect listing</Link></p>
    </aside>
  </article>;
}
