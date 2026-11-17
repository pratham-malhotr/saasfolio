import Link from "next/link";
import { HOSTING_PROVIDERS } from "@/lib/data/hosting-providers";
import { getAllDeals } from "@/lib/data/deals-data";
import { getOfferHref } from "@/lib/offer-links";

export function HostingArticleActions({ slugs }: { slugs: string[] }) {
  const deals = getAllDeals();
  return <aside className="rounded-2xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/[0.03] p-6 sm:p-8"><p className="hosting-eyebrow">Turn the research into a shortlist</p><h2 className="mt-3 font-display text-2xl font-semibold">Check the exact product before buying.</h2><p className="mt-3 text-sm leading-7 text-zinc-400">Some provider links may earn SaaSFolio a commission. A referral link alone does not apply a discount. <Link href="/affiliate-disclosure" className="text-[#C6FF3D] underline">How affiliate funding works</Link>.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{slugs.flatMap(slug => {
    const p = HOSTING_PROVIDERS.find(item => item.slug === slug);
    if (!p) return [];
    const deal = deals.find(d => d.toolSlug === slug);
    return [<div key={slug} className="rounded-xl border border-white/10 p-4"><h3 className="font-semibold text-white">{p.name}</h3><p className="mb-4 mt-2 text-xs leading-6 text-zinc-500">{p.fit}</p><div className="flex flex-wrap gap-4 text-xs"><Link prefetch={false} href={`/tools/${slug}`} className="text-[#C6FF3D] underline">Provider profile</Link><a href={deal ? getOfferHref(deal) : p.sourceUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-[#C6FF3D] underline">Check current plans ↗</a></div></div>];
  })}</div><Link href="/hosting#cost-calculator" className="mt-5 inline-block text-sm text-[#C6FF3D] underline">Compare your quotes in the hosting cost calculator →</Link></aside>;
}
