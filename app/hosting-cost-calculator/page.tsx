import Link from "next/link";
import { HostingCostCalculator } from "@/components/hosting/HostingCostCalculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/structured-data";

const path = "/hosting-cost-calculator";
const title = "Web Hosting Renewal Cost Calculator";
const description = "Compare two web hosting quotes over 12–48 months. Include prepaid introductory terms, renewal prices, backups, email and migration to see the full cost.";
export const metadata = pageMetadata({ title, description, path });

export default function HostingCostCalculatorPage() {
  return (
    <article className="mx-auto max-w-6xl space-y-8 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [webPageSchema(title, description, path), breadcrumbSchema([
        { name: "Web hosting comparisons", path: "/hosting" }, { name: "Hosting renewal cost calculator", path },
      ])] }} />
      <header className="max-w-3xl space-y-4">
        <Link href="/hosting" className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline underline-offset-4">Compare web hosting providers</Link>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">Web hosting renewal cost calculator</h1>
        <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">Compare two web hosting quotes. Enter the first-term rate, how many months you prepay, the renewal price and extras such as backups or email. See the full budget over 12, 24, 36 or 48 months.</p>
      </header>
      <HostingCostCalculator />
      <section className="max-w-3xl space-y-4 leading-relaxed text-zinc-300">
        <h2 className="font-display text-2xl font-semibold text-white">How to calculate the full cost of web hosting</h2>
        <ol className="list-decimal space-y-3 pl-6">
          <li><strong className="text-white">Find the amount due today.</strong> Multiply the introductory monthly equivalent by the required prepaid months. If the host advertises $3 a month for a 36-month term, the hosting payment is $108 upfront before extras.</li>
          <li><strong className="text-white">Record the post-promotion renewal price.</strong> Use the rate for the same plan, region and currency. Include the months after the introduction within your comparison period. Check the separate invoice amount if the host bills renewals in advance.</li>
          <li><strong className="text-white">Add the services you’ll need.</strong> Quote backups, email, storage and paid licences for both plans. Include one-time migration or setup charges. For a domain with a free first year, price its later renewals separately.</li>
        </ol>
      </section>
      <section className="max-w-3xl space-y-4 leading-relaxed text-zinc-300">
        <h2 className="font-display text-2xl font-semibold text-white">Example with a $3 introductory rate and $15 renewal</h2>
        <p>Plan A starts at $3 per month with 12 months prepaid, then renews at $15 per month. Plan B costs $7 per month throughout. Over the first year, Plan A costs $36 and Plan B costs $84. Over two years, Plan A costs $216 and Plan B costs $168. Plan B costs $48 less over that period, before extras and taxes. These figures are illustrative.</p>
        <p>A cheaper quote may require you to handle backups, updates or incident recovery yourself. Compare equivalent workloads before using price to decide between <Link href="/articles/hostinger-vps-vs-managed-wordpress-solo-blogger" className="text-[#C6FF3D] underline underline-offset-4">a VPS and managed WordPress hosting</Link>.</p>
      </section>
      <section className="max-w-3xl space-y-4 leading-relaxed text-zinc-300">
        <h2 className="font-display text-2xl font-semibold text-white">What if the introductory term outlasts your budget period?</h2>
        <p>The calculator includes the full prepaid term because that amount is due now. Select a longer horizon to compare later renewal costs too. If cancellation or a move is likely, check which payments are refundable before paying for a multi-year term.</p>
        <p><Link href="/deals/category/hosting" className="text-[#C6FF3D] underline underline-offset-4">Check sourced web hosting deals</Link> and confirm that your renewal quote applies to the same plan and account.</p>
      </section>
    </article>
  );
}
