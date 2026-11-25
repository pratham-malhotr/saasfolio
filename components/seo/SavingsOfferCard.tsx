import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { offerValue } from "@/components/deals/OfferCard";
import { CouponCode } from "@/components/deals/CouponCode";
import { OfferEvidenceDetails } from "@/components/deals/OfferEvidenceDetails";
import { getOfferHref, offerActionLabel } from "@/lib/offer-links";
import type { SaaSDeal } from "@/lib/types";

export function SavingsOfferCard({ deal }: { deal: SaaSDeal }) {
  return <article data-collection-offer={deal.slug} className="market-offer-card motion-card gap-4">
    <div className="space-y-3">
      <div className="market-offer-top">
        <BrandAvatar name={deal.toolName} category={deal.categorySlug} />
        <span className="market-offer-value">{offerValue(deal)}</span>
      </div>
      <h3 className="font-display text-xl font-bold text-white"><Link prefetch={false} href={`/deals/${deal.slug}`} className="hover:text-[#C6FF3D]">{deal.title}</Link></h3>
    </div>
    {deal.code && <CouponCode code={deal.code} />}
    <p className="text-sm leading-relaxed text-zinc-400">{deal.terms}</p>
    <OfferEvidenceDetails deal={deal} />
    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm">
      <a href={getOfferHref(deal)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="market-button market-button-primary">{offerActionLabel(deal)} <ArrowUpRight size={16} aria-hidden="true" /></a>
      <Link prefetch={false} href={`/deals/${deal.slug}`} className="text-[#C6FF3D] underline">Offer details and conditions</Link>
    </div>
  </article>;
}
