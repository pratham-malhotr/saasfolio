import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandDiscountCard } from "@/components/seo/BrandDiscountCard";
import { getIndexableDiscountBrands } from "@/lib/brand-discounts";
import { getAllDeals } from "@/lib/data/deals-data";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";

const title = "Software Discounts by Brand: SaaS Savings Guides";
const description = "Find SaaS discounts by brand. Compare sourced coupon availability, annual savings and education or nonprofit offers, with eligibility and renewal checks.";
export const metadata = pageMetadata({ title, description, path: "/discounts" });
export const revalidate = 3600;

export default function BrandDiscountsPage() {
  const brands = getIndexableDiscountBrands();
  const deals = getAllDeals();
  const categories = [...new Set(brands.map(tool => tool.categorySlug))].map(slug => ({
    slug,
    name: brands.find(tool => tool.categorySlug === slug)!.category,
    brands: brands.filter(tool => tool.categorySlug === slug),
  }));
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
    <JsonLd data={collectionSchema(title, description, "/discounts", brands.map(tool => ({ name: `${tool.name} discounts`, path: `/discounts/${tool.slug}` })))} />
    <header className="max-w-3xl space-y-4">
      <p className="text-[#C6FF3D] font-mono text-xs uppercase tracking-widest">Brand savings guides</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">Software discounts by brand</h1>
      <p className="text-lg text-zinc-400 leading-relaxed">Find your software brand, compare the eligible ways to save, and check the full cost before subscribing.</p>
      <p className="text-sm text-zinc-400 leading-relaxed">Browse {brands.length} brand guides below. Each explains the available ways to save, links to its sources, and separates paid discounts from free plans and trials.</p>
      <p className="text-sm text-zinc-400">Looking for another tool? <Link href="/brands" className="text-[#C6FF3D] underline">Search all software brands A–Z</Link>. Comparing a yearly commitment? <Link href="/savings-calculator" className="text-[#C6FF3D] underline">Calculate the full annual cost</Link>.</p>
    </header>
    <SavingsCollectionLinks heading="Choose a code or an eligibility route" />
    <nav aria-label="Discount categories" className="flex flex-wrap gap-3">{categories.map(category => <a key={category.slug} href={`#${category.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#C6FF3D] hover:border-[#C6FF3D]/50">{category.name}</a>)}</nav>
    <nav aria-label="Find a brand discount" className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-3">
      <h2 className="font-display text-xl font-bold text-white">Find your brand, A–Z</h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">{brands.map(tool => <li key={tool.slug}><Link href={`/discounts/${tool.slug}`} className="text-[#C6FF3D] underline underline-offset-4">{tool.name} discounts</Link></li>)}</ul>
    </nav>
    {categories.map(category => <section key={category.slug} id={category.slug} className="scroll-mt-28 space-y-4 pt-4">
      <h2 className="font-display text-2xl font-bold text-white">{category.name} discounts</h2>
      <div className="grid gap-4 sm:grid-cols-2">{category.brands.map(tool => <BrandDiscountCard key={tool.slug} tool={tool} deals={deals} />)}</div>
    </section>)}
    <section className="space-y-5 border-t border-white/10 pt-8 max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-white">How to find a SaaS discount that fits your business</h2>
      <ol className="list-decimal space-y-4 pl-5 text-zinc-400 leading-relaxed">
        <li><strong className="text-zinc-200">Choose the brand and plan.</strong> Match your subscriber count, team seats or usage to the plan you need. Compare the same features and billing period across offers.</li>
        <li><strong className="text-zinc-200">Compare the kind of saving.</strong> A coupon can reduce an eligible checkout price. Annual billing changes your payment commitment. A free trial gives temporary access, and a free plan has its own limits.</li>
        <li><strong className="text-zinc-200">Check the full cost.</strong> Read the source, offer duration, customer eligibility and renewal price. Follow the guide’s redemption steps and confirm the provider’s payable total.</li>
      </ol>
      <p className="text-sm text-zinc-400">Our <Link href="/about" className="text-[#C6FF3D] underline">offer sourcing standards</Link> explain check dates and how expired listings are handled. Some provider links may earn us a commission; read the <Link href="/affiliate-disclosure" className="text-[#C6FF3D] underline">affiliate disclosure</Link>.</p>
    </section>
    <section className="space-y-4 max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-white">SaaS discount questions</h2>
      {[
        { question: "Can I save on SaaS without a promo code?", answer: "Some providers offer annual billing savings, team pricing or eligible bundles without a coupon. Compare these with the plan and commitment you need. The brand guide lists sourced options and links to the provider’s terms." },
        { question: "Are the coupon codes checkout tested?", answer: "Current listings identify their sources and check dates. Codes have not been checkout tested, and the provider decides whether your account, plan and billing period qualify. Confirm the total before paying." },
        { question: "How do I find the best discount for a software brand?", answer: "Open the matching brand guide and compare eligible options for the same plan, usage and billing period. Include add-ons, any access fee and the renewal cost. The biggest advertised percentage may not produce the lowest total for your account." },
      ].map(faq => <details key={faq.question} className="rounded-2xl border border-white/10 bg-[#09090C] p-5">
        <summary className="cursor-pointer font-semibold text-white">{faq.question}</summary>
        <p className="pt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
      </details>)}
    </section>
    <p className="text-sm text-zinc-400">More software: <Link href="/deals" className="text-[#C6FF3D] underline">Browse all offers</Link> · <Link href="/tools" className="text-[#C6FF3D] underline">Explore the software directory</Link></p>
  </div>;
}
