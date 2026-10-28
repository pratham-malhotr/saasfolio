import Link from "next/link";
import { CouponCode } from "@/components/deals/CouponCode";
import { OfferEvidenceDetails } from "@/components/deals/OfferEvidenceDetails";
import { getOfferHref, offerActionLabel, offerLabel } from "@/lib/offer-links";
import type { SaaSDeal } from "@/lib/types";

export function SavingsOfferCard({ deal }: { deal: SaaSDeal }) {
  return <article data-collection-offer={deal.slug} className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-[#09090C] p-5 sm:p-6">
    <div className="space-y-3">
      <p className="font-mono text-xs text-[#C6FF3D]">{offerLabel(deal)}</p>
      <h3 className="font-display text-xl font-bold text-white"><Link prefetch={false} href={`/deals/${deal.slug}`} className="hover:text-[#C6FF3D]">{deal.title}</Link></h3>
    </div>
    {deal.code && <CouponCode code={deal.code} />}
    <p className="text-sm leading-relaxed text-zinc-400">{deal.terms}</p>
    <OfferEvidenceDetails deal={deal} />
    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm">
      <a href={getOfferHref(deal)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-xl bg-[#C6FF3D] px-4 py-3 font-semibold text-black">{offerActionLabel(deal)} ↗</a>
      <Link prefetch={false} href={`/deals/${deal.slug}`} className="text-[#C6FF3D] underline">Offer details and conditions</Link>
    </div>
  </article>;
}
