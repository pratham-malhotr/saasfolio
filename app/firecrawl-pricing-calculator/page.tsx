import Link from "next/link";
import { FirecrawlCalculator, FirecrawlPartnerLink } from "@/components/firecrawl/FirecrawlCalculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { FIRECRAWL_CALCULATOR_PATH as path, FIRECRAWL_PRICING } from "@/lib/firecrawl-cost.mjs";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/structured-data";

const title = "Firecrawl Pricing Calculator for Scraping and Crawling";
const description = "Estimate Firecrawl credits and monthly costs from pages per run, crawl frequency and output format. Compare Free, Hobby, Standard, Growth and Scale.";

export const metadata = pageMetadata({ title, description, path });

export default function FirecrawlPricingCalculatorPage() {
  return <article className="mx-auto max-w-6xl space-y-9 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [webPageSchema(title, description, path), breadcrumbSchema([
      { name: "SaaS savings calculator", path: "/savings-calculator" }, { name: "Firecrawl pricing calculator", path },
    ])] }} />
    <header className="max-w-3xl space-y-4">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">Firecrawl pricing calculator</h1>
      <p className="text-lg leading-relaxed text-zinc-300">Estimate what you’ll pay to scrape or crawl the same set of pages each month. Enter your page count, run frequency and output format. The estimates use Firecrawl’s monthly plan prices and credit rates.</p>
    </header>
    <FirecrawlCalculator />
    <section className="max-w-3xl space-y-4 leading-relaxed text-zinc-300">
      <h2 className="font-display text-2xl font-semibold text-white">What does Firecrawl cost for 500 pages a week?</h2>
      <p>Budgeting four runs, 500 pages per run cost 2,000 credits a month with basic Markdown output. The Free plan includes 1,000 credits each month. Hobby includes 5,000 credits at $19 a month.</p>
      <p>Request JSON on the same 2,000 pages and the estimate rises to 10,000 credits. Hobby covers the first 5,000 credits. Five pay-as-you-go blocks cost $25 more, for a total of $44. Standard costs $99 a month and includes 100,000 credits. Use five runs in the calculator for months when your weekly schedule produces five crawls.</p>
      <p>Use pages actually returned by each run. Firecrawl can charge for pages returned with error statuses such as 404. If you use Search, Interact, Agent or more than one advanced output, price those separately against the <a className="text-[#C6FF3D] underline" href={FIRECRAWL_PRICING}>official credit table</a>.</p>
    </section>
    <section className="max-w-3xl space-y-4 leading-relaxed text-zinc-300">
      <h2 className="font-display text-2xl font-semibold text-white">Check your spend cap before going live</h2>
      <p>Try a representative set of URLs first and check the credits deducted. Use that pilot to estimate how many unique pages a full run can return, whether you need structured output for every page, and whether the plan’s request and concurrency limits suit your schedule.</p>
      <p>On paid plans Firecrawl buys extra credits in $5 blocks when pay-as-you-go is on. Check your limit in Billing. A limit of $0 turns it off. Annual prices on Firecrawl’s site are shown as monthly equivalents and billed yearly. Compare the full upfront invoice in the <Link className="text-[#C6FF3D] underline" href="/savings-calculator">monthly vs annual savings calculator</Link>.</p>
    </section>
    <section className="max-w-3xl space-y-3 rounded-2xl border border-white/10 p-5 leading-relaxed text-zinc-300">
      <h2 className="font-display text-xl font-semibold text-white">First-purchase savings</h2>
      <p>Firecrawl&apos;s partner program gives new users 10% off their first purchase when they sign up through a partner link. It applies once, so budget renewals at the standard price and check the amount due before paying.</p>
      <p>Affiliate disclosure. SaaSFolio may earn a commission if you buy through this link.</p>
      <p><FirecrawlPartnerLink /></p>
    </section>
    <p className="text-sm text-zinc-400">Pricing checked <time dateTime="2026-11-28">November 28, 2026</time>. Read the <a href={FIRECRAWL_PRICING} className="text-[#C6FF3D] underline">Firecrawl pricing page</a> and Firecrawl&apos;s <a href="https://partners.dub.co/firecrawl" className="text-[#C6FF3D] underline">partner program terms</a>.</p>
  </article>;
}
