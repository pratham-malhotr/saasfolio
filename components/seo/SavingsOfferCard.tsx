import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { OFFER_TYPES, offerValue } from "@/components/deals/OfferCard";
import { CouponCode } from "@/components/deals/CouponCode";
import { OfferEvidenceDetails } from "@/components/deals/OfferEvidenceDetails";
import { getOfferHref, offerActionLabel } from "@/lib/offer-links";
import type { SaaSDeal } from "@/lib/types";

export function SavingsOfferCard({ deal }: { deal: SaaSDeal }) {
  const value = offerValue(deal);
  const kind = OFFER_TYPES[deal.dealType];
  return <article data-collection-offer={deal.slug} className="market-offer-card motion-card">
    <div className="market-offer-top">
      <BrandAvatar name={deal.toolName} slug={deal.toolSlug} category={deal.categorySlug} />
      <p className="market-offer-brand"><strong>{deal.toolName}</strong><small>{deal.category}</small></p>
    </div>
    <div className="market-offer-deal">
      <span className="market-offer-value">{value}</span>
      {value !== kind && <span className="market-offer-kind">{kind}</span>}
    </div>
    <div className="flex flex-1 flex-col gap-4 px-[1.15rem] pb-1 pt-4">
      <h3><Link prefetch={false} href={`/deals/${deal.slug}`}>{deal.title}</Link></h3>
      {deal.code && <CouponCode code={deal.code} />}
      <p className="text-sm leading-relaxed text-zinc-400">{deal.terms}</p>
      <OfferEvidenceDetails deal={deal} />
    </div>
    <div className="market-offer-footer flex flex-wrap items-center gap-4 text-sm">
      <a href={getOfferHref(deal)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="market-button market-button-primary">{offerActionLabel(deal)} <ArrowUpRight size={16} aria-hidden="true" /></a>
      <Link prefetch={false} href={`/deals/${deal.slug}`} className="text-[#C6FF3D] underline underline-offset-4">Offer details and conditions</Link>
    </div>
  </article>;
}
