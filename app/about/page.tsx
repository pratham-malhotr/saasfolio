import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";

export const metadata = pageMetadata({
  title: "About SaaSFolio: Offer Sources & Editorial Standards",
  description: "How SaaSFolio sources software offers, labels coupon reports, handles expired listings and discloses affiliate links. Read our editorial standards.",
  path: "/about",
});
export const revalidate = 3600;

const standards = [
  { title: "Sources you can inspect", text: "Offer listings identify the recorded source and when it was checked. Vendor-published promotions are distinguished from codes reported by third party coupon publishers. A source check confirms what a page reports; it does not establish that a code works at checkout." },
  { title: "Clear offer types", text: "Coupons, paid-plan offers, free plans, and trials are labeled separately. A standard pricing link does not represent a verified discount. Referral or affiliate tracking alone does not establish a lower price." },
  { title: "Current catalog rules", text: "The current offer catalog excludes source checks older than 14 days, future check dates, and offers whose published expiry has passed. Prices, eligibility, availability, and renewal terms remain subject to the provider. A failed or missing source check does not justify inventing an offer." },
  { title: "Original brand guidance", text: "Brand savings guides explain billing choices, offer restrictions, and how to compare costs. Pricing observations carry their own review date and official source. Observations are removed from display after 30 days until reviewed again; the evergreen guidance remains available." },
];

export default function AboutPage() {
  const tools = getAllTools();
  const offers = getAllDeals().filter(deal => deal.dealType !== "pricing");
  return <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-12">
    <header className="max-w-3xl space-y-5">
      <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">About SaaSFolio</p>
      <h1 className="font-display font-bold text-4xl sm:text-6xl text-white">Software offers with sources you can check.</h1>
      <p className="text-lg text-zinc-400 leading-relaxed">SaaSFolio helps you discover software, compare alternatives, and understand available ways to save. Our goal is to make offer status, eligibility, and the difference between a promotion and standard pricing clear before you visit a provider.</p>
    </header>
    <div className="grid sm:grid-cols-2 gap-4">
      {[{ count: tools.length, label: "Software profiles in the catalog" }, { count: offers.length, label: "Currently sourced offers, free plans & trials" }].map(item => <div key={item.label} className="rounded-2xl border border-white/10 p-6 bg-[#09090C]">
        <p className="font-display text-4xl font-bold text-[#C6FF3D]">{item.count}</p>
        <p className="text-sm text-zinc-400 mt-2">{item.label}</p>
      </div>)}
    </div>
    <section className="space-y-6">
      <h2 className="font-display text-3xl font-bold text-white">Our sourcing and editorial standards</h2>
      <div className="grid md:grid-cols-2 gap-5">{standards.map(item => <div key={item.title} className="rounded-2xl border border-white/10 p-6 bg-[#09090C] space-y-3">
        <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{item.text}</p>
      </div>)}</div>
    </section>
    <section className="space-y-4 max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-white">What has been tested?</h2>
      <p className="text-zinc-400 leading-relaxed">Current offer listings have not been tested through signup or checkout. A vendor source check and a coupon publisher’s report are recorded as evidence, rather than a guarantee of acceptance. Always confirm the final payable amount and renewal terms with the provider.</p>
      <p className="text-zinc-400 leading-relaxed">We do not publish invented customer ratings or coupon success rates as structured data. Feedback shown during a browser session is not an independently verified measurement of how often a coupon succeeds.</p>
    </section>
    <section className="space-y-4 max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-white">Affiliates and corrections</h2>
      <p className="text-zinc-400 leading-relaxed">Some provider links may earn SaaSFolio a commission. This relationship does not guarantee a promotion, a lower price, or an extended trial. Read the <Link href="/affiliate-disclosure" className="text-[#C6FF3D] underline">affiliate disclosure</Link> for details.</p>
      <p className="text-zinc-400 leading-relaxed">Found an incorrect code, expired promotion, or outdated plan detail? <Link href="/contact" className="text-[#C6FF3D] underline">Contact us</Link> with the listing URL and the provider’s current terms so the information can be reviewed.</p>
    </section>
    <nav aria-label="Explore SaaSFolio" className="flex flex-wrap gap-4 text-sm text-[#C6FF3D]">
      <Link href="/discounts" className="underline">Brand discount guides</Link><Link href="/deals" className="underline">Browse current offers</Link><Link href="/tools" className="underline">Software directory</Link>
    </nav>
  </article>;
}
