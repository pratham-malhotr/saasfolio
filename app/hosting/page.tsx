import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Server, Calculator, ShieldCheck } from "lucide-react";
import { FolioArtwork } from "@/components/animations/FolioArtwork";
import { ScrollMotion } from "@/components/animations/ScrollMotion";
import { HOSTING_PROVIDERS, HOSTING_REVIEWED_AT } from "@/lib/data/hosting-providers";
import { HOSTING_ARTICLES } from "@/lib/data/hosting-articles";
import { getPublishedOffers } from "@/lib/published-catalog";
import { pageMetadata } from "@/lib/seo";
import { collectionSchema, breadcrumbSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { HostingFinder } from "@/components/hosting/HostingFinder";
import { HostingCostCalculator } from "@/components/hosting/HostingCostCalculator";
import { SavingsOfferCard } from "@/components/seo/SavingsOfferCard";

const title = "Web Hosting Comparisons: VPS & Managed Hosting";
const description = "Compare VPS, managed WordPress hosting and app platforms by workload, maintenance, backups and renewal costs. Build a shortlist for your website.";
export const metadata = pageMetadata({ title, description, path: "/hosting", image: "/hosting/opengraph-image" });
export const revalidate = 3600;
export default function HostingPage() {
  const offers = getPublishedOffers().filter(offer => HOSTING_PROVIDERS.some(p => p.slug === offer.toolSlug)).sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 4);
  return <ScrollMotion className="hosting-hub min-h-screen bg-[#080a0c] text-[#ededeb]">
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [collectionSchema(title, description, "/hosting", HOSTING_ARTICLES.map(a => ({ name: a.title, path: `/articles/${a.slug}` }))), breadcrumbSchema([{ name: "Hosting research", path: "/hosting" }])] }} />
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_78%_12%,#182d38,transparent_65%)]">
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-9 pt-28 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-36 md:grid-cols-[1.08fr_.92fr] lg:px-8">
        <div>
          <p className="hosting-eyebrow flex items-center gap-2"><Server aria-hidden="true" className="h-4 w-4" />Hosting research</p>
          <h1 className="mt-4 font-display text-[clamp(2.35rem,8.6vw,5rem)] font-semibold leading-[1.03] tracking-[-0.055em] md:text-[clamp(2.6rem,5.4vw,5rem)]">Web hosting<br /><span className="text-[#C6FF3D]">comparisons.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">Compare VPS, managed WordPress hosting and app platforms by what you run, who maintains it and what it costs at renewal.</p>
          <div className="mt-6 flex flex-wrap gap-3"><a href="#finder" className="hosting-primary">Find your fit</a><a href="#cost-calculator" className="hosting-secondary">Calculate renewal costs</a></div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400"><span>{HOSTING_PROVIDERS.length} provider profiles</span><span>{HOSTING_ARTICLES.length} buying guides</span><Link href="/affiliate-disclosure" className="underline underline-offset-4 hover:text-[#C6FF3D]">Affiliate funded</Link></div>
        </div>
        <div className="hosting-enter"><FolioArtwork variant="hosting" /></div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Hosting research tools" className="grid gap-3 sm:grid-cols-3">{[{ href: "#finder", icon: Server, title: "Build a shortlist", text: "Filter by workload and compare the work involved." }, { href: "#cost-calculator", icon: Calculator, title: "Price the full commitment", text: "Introductory term, renewal and running extras." }, { href: "#offers", icon: ShieldCheck, title: "Inspect sourced savings", text: "Read duration and eligibility beside the headline." }].map(({ href, icon: Icon, title, text }) => <a key={href} href={href} data-motion="" className="motion-card flex gap-4 rounded-2xl border border-white/10 bg-[#101216] p-5"><Icon className="mt-1 h-5 w-5 shrink-0 text-[#C6FF3D]" /><div><h2 className="text-sm font-semibold text-white">{title}</h2><p className="mt-2 text-xs leading-6 text-zinc-500">{text}</p></div></a>)}</nav>
      <HostingFinder providers={HOSTING_PROVIDERS} />
      <div className="space-y-3"><HostingCostCalculator /><Link href="/hosting-cost-calculator" className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline underline-offset-4">Open the hosting renewal cost calculator and worked example</Link></div>
      <section id="guides" className="scroll-mt-28"><div data-motion="" className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="hosting-eyebrow">Specific questions. Useful answers.</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Read before you move.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">VPS comparisons, WordPress ownership, regional choices and migration plans. Each guide names its reader, shows the decision criteria and links to its sources.</p></div><Link href="/editorial-policy" className="text-xs text-[#C6FF3D] underline">Our research method</Link></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{HOSTING_ARTICLES.map((article, index) => <article key={article.slug} data-motion={index % 3} className="motion-card flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101216]"><Link prefetch={false} href={`/articles/${article.slug}`} tabIndex={-1} aria-hidden="true"><Image src={article.coverImage!.src} alt="" width={1440} height={810} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="aspect-video w-full object-cover" /></Link><div className="flex flex-1 flex-col p-6"><p className="text-[10px] uppercase tracking-widest text-[#C6FF3D]">{article.category} · {article.readTime}</p><h3 className="mt-4 font-display text-xl font-semibold leading-snug"><Link prefetch={false} href={`/articles/${article.slug}`} className="hover:text-[#C6FF3D]">{article.title}</Link></h3><p className="mb-5 mt-3 text-sm leading-7 text-zinc-400">{article.summary}</p><Link prefetch={false} href={`/articles/${article.slug}`} className="mt-auto inline-flex items-center gap-2 text-xs text-[#C6FF3D]">Read the decision guide<ArrowUpRight className="h-3 w-3" /></Link></div></article>)}</div></section>
      <section id="offers" className="scroll-mt-28"><p className="hosting-eyebrow">Read the conditions first</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Hosting savings, with the fine print.</h2><p className="mb-7 mt-4 max-w-3xl text-sm leading-7 text-zinc-400">A short promotion can have a large headline and a modest annual saving. Check the term, prepaid total and renewal. Source observations expire from our catalog; availability is confirmed by the provider.</p>{offers.length ? <div className="grid gap-4 md:grid-cols-2">{offers.map(deal => <SavingsOfferCard key={deal.slug} deal={deal} />)}</div> : <p className="rounded-xl border border-white/10 p-5 text-sm text-zinc-400">No recently sourced hosting offers are available. Use the provider profiles for current terms.</p>}</section>
      <aside className="rounded-2xl border border-white/10 bg-[#101216] p-6 text-xs leading-7 text-zinc-500"><p><strong className="text-zinc-300">How this desk works.</strong> Provider notes reviewed {HOSTING_REVIEWED_AT}. Recommendations reflect documented capabilities and explicit operating requirements; they do not claim independent speed testing. Prices and offers are separate, dated observations. Some outbound links may earn a referral commission.</p><div className="mt-3 flex flex-wrap gap-5"><Link href="/affiliate-disclosure" className="text-[#C6FF3D] underline">Affiliate disclosure</Link><Link href="/contact" className="text-[#C6FF3D] underline">Suggest a correction</Link><Link href="/brands?category=hosting" className="text-[#C6FF3D] underline">Full hosting directory</Link></div></aside>
    </div>
  </ScrollMotion>;
}
