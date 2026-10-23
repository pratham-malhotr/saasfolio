import Link from "next/link";
import { SavingsCalculator } from "@/components/deals/SavingsCalculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/structured-data";

const title = "SaaS Savings Calculator: Monthly vs Annual Billing";
const description = "Compare monthly and annual software costs using your provider quotes. Include membership fees and see net yearly savings before committing to a SaaS plan.";
export const metadata = pageMetadata({ title, description, path: "/savings-calculator" });

export default function SavingsCalculatorPage() {
  return <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-10">
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [webPageSchema(title, description, "/savings-calculator"), breadcrumbSchema([{ name: "Savings calculator", path: "/savings-calculator" }])] }} />
    <header className="max-w-3xl space-y-4"><p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">SaaSFolio buying tools</p><h1 className="font-display text-4xl sm:text-5xl font-bold text-white">SaaS savings calculator</h1><p className="text-lg text-zinc-400">A headline discount doesn’t tell you the full cost. Compare 12 monthly payments with an annual quote, including the fee to access that annual offer.</p></header>
    <SavingsCalculator />
    <section className="max-w-3xl space-y-4 text-zinc-400 leading-relaxed"><h2 className="font-display text-2xl font-bold text-white">Compare equivalent plans before paying upfront</h2><p>Use the same seats, subscriber allowance, usage and included features for both quotes. Enter the full annual payment rather than an advertised monthly equivalent. If a deal marketplace charges a membership fee that you need only for the annual offer, add that fee too.</p><p>A lower yearly total can still be a poor fit if you only need the tool for a few months. Check the cancellation policy and first renewal price. Promotional introductory rates may not continue into the next year, and usage or infrastructure costs can change the total.</p><p>For example, a monthly quote of $30 totals $360 over 12 months. An annual quote of $300 plus an $80 access fee costs $380. The annual route costs $20 more despite the lower subscription quote. These are illustrative amounts, not prices for a listed brand.</p><p><Link href="/discounts" className="text-[#C6FF3D] underline">Explore brand savings guides</Link> for official references and eligibility, or <Link href="/brands" className="text-[#C6FF3D] underline">find your software brand</Link>.</p></section>
  </article>;
}
