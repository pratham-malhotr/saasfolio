import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, FileCheck2 } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import type { SaaSDeal } from "@/lib/types";

export const OFFER_TYPES: Record<SaaSDeal["dealType"], string> = {
  coupon: "Coupon code",
  lifetime: "Lifetime deal",
  free_trial: "Free trial",
  free_plan: "Free plan",
  offer: "Provider offer",
  pricing: "Pricing",
};

export function offerValue(deal: SaaSDeal) {
  if (deal.discountPercentage > 0) {
    return `${deal.discountKind === "up-to" ? "Up to " : ""}${deal.discountPercentage}% off`;
  }

  return OFFER_TYPES[deal.dealType];
}

export function offerSourceLabel(deal: SaaSDeal) {
  return deal.sourceKind === "vendor" ? "Provider source" : deal.sourceKind === "coupon-site" ? "Coupon publisher" : "Offer terms";
}

const checkDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" });
const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function OfferCard({ deal, letters, action, motionIndex }: {
  deal: SaaSDeal;
  letters?: string;
  action?: ReactNode;
  motionIndex?: number;
}) {
  const href = `/deals/${deal.slug}`;
  const checkedAt = Date.parse(deal.checkedAt || "");
  const description = deal.description.replace(`${deal.title}. `, "");
  const period = deal.billingPeriod === "one-time" ? "one-time" : deal.billingPeriod || "monthly";
  const value = offerValue(deal);
  const kind = OFFER_TYPES[deal.dealType];

  return (
    <article className="market-offer-card motion-card" data-motion={motionIndex}>
      <header className="market-offer-top">
        <BrandAvatar name={deal.toolName} category={deal.categorySlug} letters={letters} />
        <p className="market-offer-brand"><strong>{deal.toolName}</strong><small>{deal.category}</small></p>
        {deal.sourceKind === "vendor" && <span className="market-badge market-badge-verified" title="Official provider source"><BadgeCheck size={13} aria-hidden="true" /><span className="market-badge-text">Official source</span></span>}
      </header>
      <div className="market-offer-deal">
        <span className="market-offer-value">{value}</span>
        {value !== kind && <span className="market-offer-kind">{kind}</span>}
      </div>
      <div className="market-offer-body">
        <h3><Link href={href} prefetch={false}>{deal.title}</Link></h3>
        <p className="market-offer-description">{description}</p>
        {deal.dealPrice !== undefined && deal.originalPrice !== undefined && (
          <p className="market-offer-price">
            <strong>{price.format(deal.dealPrice)}</strong>
            {deal.originalPrice > 0 && <del>{price.format(deal.originalPrice)}</del>}
            <span>{period}</span>
          </p>
        )}
      </div>
      <footer className="market-offer-footer">
        <p className="market-offer-evidence">
          <FileCheck2 size={14} aria-hidden="true" />
          <span>{offerSourceLabel(deal)}</span>
          {Number.isFinite(checkedAt) && <time dateTime={deal.checkedAt} title="Source check date">Checked {checkDate.format(checkedAt)}</time>}
        </p>
        <div className="market-offer-actions">
          <Link href={href} prefetch={false} className={action ? "market-button market-button-secondary" : "market-offer-details"} aria-label={`See offer details for ${deal.toolName}`}>
            {action ? "Details" : "See offer details"} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {action}
        </div>
      </footer>
    </article>
  );
}
