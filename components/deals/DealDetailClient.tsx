"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronDown, FileCheck2, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { CouponCode } from "@/components/deals/CouponCode";
import { OfferCard, OFFER_TYPES, offerValue } from "@/components/deals/OfferCard";
import { OfferEvidenceDetails } from "@/components/deals/OfferEvidenceDetails";
import { OfferReportLink } from "@/components/deals/OfferReportLink";
import { SaveItemButton } from "@/components/profile/SaveItemButton";
import { getOfferHref, offerActionLabel } from "@/lib/offer-links";
import type { DetailedTool, SaaSDeal } from "@/lib/types";
import "./deal-detail.css";

interface DealDetailClientProps {
  deal: SaaSDeal;
  discountHref?: string;
  tool?: DetailedTool;
  faqs?: { question: string; answer: string }[];
  siblingDeals?: SaaSDeal[];
  relatedDeals: SaaSDeal[];
  comparisonHref: string;
}

export function DealDetailClient({
  deal,
  discountHref,
  tool,
  faqs,
  siblingDeals = [],
  relatedDeals,
  comparisonHref,
}: DealDetailClientProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const categoryHref = `/deals/category/${deal.categorySlug}`;
  const description = deal.description.replace(`${deal.title}. `, "");

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    setNotes(current => [note.trim(), ...current]);
    setNote("");
  }

  async function shareOffer() {
    setShareStatus("");
    try {
      if (navigator.share) {
        await navigator.share({ title: deal.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Offer link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareStatus("Copy the offer link from your address bar to share it.");
      }
    }
  }

  return (
    <article className="market-page deal-detail">
      <div className="deal-detail-opening">
        <div className="market-shell">
          <nav aria-label="Offer navigation" className="deal-breadcrumbs">
            <Link href="/deals"><ArrowLeft size={16} aria-hidden="true" /> All deals</Link>
            <Link href={categoryHref}>{deal.category} <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </nav>
          <div className="deal-detail-grid">
            <header className="deal-detail-summary">
              <div className="deal-detail-brand">
                <BrandAvatar name={deal.toolName} category={deal.categorySlug} letters={tool?.logoLetter} />
                <div>
                  <Link href={tool ? `/tools/${tool.slug}` : "/tools"}>{deal.toolName}</Link>
                  <span>{OFFER_TYPES[deal.dealType]}</span>
                </div>
              </div>
              <h1>{deal.title}</h1>
              {description && <p>{description}</p>}
              {discountHref && <Link className="deal-detail-link" href={discountHref}>Compare all {deal.toolName} discounts <ArrowUpRight size={16} aria-hidden="true" /></Link>}
              <div className="deal-detail-share">
                <SaveItemButton kind="deal" slug={deal.slug} />
                <button type="button" onClick={shareOffer} className="market-button market-button-secondary"><Share2 size={16} aria-hidden="true" /> Share</button>
                {shareStatus && <p role="status">{shareStatus}</p>}
              </div>
            </header>
            <section className="deal-panel deal-claim" aria-labelledby="deal-claim-heading">
              <h2 id="deal-claim-heading">{offerValue(deal)}</h2>
              {deal.code && <div className="deal-claim-code"><p>Reported coupon code</p><CouponCode key={deal.code} code={deal.code} /></div>}
              <a href={getOfferHref(deal)} rel="sponsored nofollow noopener noreferrer" className="market-button market-button-primary">
                {offerActionLabel(deal)} <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a href="#offer-terms" className="deal-detail-link">See source and eligibility <ArrowUpRight size={15} aria-hidden="true" /></a>
            </section>
          </div>
        </div>
      </div>

      <div className="market-shell deal-detail-body">
        <div className="deal-detail-grid">
          <div className="deal-detail-stack">
            <section id="offer-terms" className="deal-panel" aria-labelledby="offer-terms-heading">
              <h2 id="offer-terms-heading"><FileCheck2 size={21} aria-hidden="true" /> Offer terms and eligibility</h2>
              <p className="deal-panel-copy">{deal.terms}</p>
              <OfferEvidenceDetails deal={deal} />
              <OfferReportLink offerSlug={deal.slug} />
            </section>

            {deal.dealType !== "pricing" && (
              <section className="deal-panel">
                <h2><BookOpen size={21} aria-hidden="true" /> How to claim this offer</h2>
                <ol className="deal-steps">
                  <li>Check eligibility for your account, plan, and billing period.</li>
                  <li>Open the offer on {deal.toolName}’s website.</li>
                  <li>{deal.code ? "Paste the reported code at checkout." : "Follow the provider’s signup or application steps."} Confirm the final price and any renewal cost.</li>
                </ol>
              </section>
            )}

            {siblingDeals.length > 0 && (
              <section className="deal-panel">
                <h2>More offers from {deal.toolName}</h2>
                <ul className="deal-siblings">
                  {siblingDeals.map(sibling => (
                    <li key={sibling.id}>
                      <Link href={`/deals/${sibling.slug}`} prefetch={false}>
                        <span><strong>{sibling.title}</strong><small>{offerValue(sibling)}</small></span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!faqs?.length && (
              <section className="deal-panel">
                <h2>Questions about this offer</h2>
                <div className="deal-faqs">
                  {faqs.map((faq, index) => (
                    <details key={faq.question} open={index === 0 || undefined}>
                      <summary>{faq.question}<ChevronDown size={17} aria-hidden="true" /></summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="deal-detail-stack" aria-label="Offer resources">
            {tool && (
              <section className="deal-panel">
                <h2>About {tool.name}</h2>
                <p className="deal-panel-copy">{tool.tagline}</p>
                <div className="deal-profile-links">
                  <Link className="deal-detail-link" href={`/tools/${tool.slug}`}>View profile <ArrowUpRight size={16} aria-hidden="true" /></Link>
                  <Link className="deal-detail-link" href={comparisonHref}>Compare alternatives <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </section>
            )}

            <section className="deal-panel deal-session">
              <h2>Session notes</h2>
              <p className="deal-panel-copy">Keep track of this offer while you’re on this page.</p>
              <div className="deal-session-vote" role="group" aria-label="Did this offer work for you?">
                <button type="button" className="market-button market-button-secondary" aria-pressed={voted === "up"} onClick={() => setVoted("up")}><ThumbsUp size={16} aria-hidden="true" /> Worked</button>
                <button type="button" className="market-button market-button-secondary" aria-pressed={voted === "down"} onClick={() => setVoted("down")}><ThumbsDown size={16} aria-hidden="true" /> Didn’t work</button>
              </div>
              <form onSubmit={addNote}>
                <label htmlFor="deal-session-note">Note for this session</label>
                <textarea id="deal-session-note" rows={2} value={note} onChange={event => setNote(event.target.value)} />
                <button type="submit" className="market-button market-button-secondary" disabled={!note.trim()}>Add note</button>
              </form>
              {notes.length > 0 && <ul aria-live="polite">{notes.map((text, index) => <li key={notes.length - index}>{text}</li>)}</ul>}
            </section>

            <p className="deal-disclosure">SaaSFolio may earn a commission through provider links. <Link href="/affiliate-disclosure">Affiliate disclosure</Link></p>
          </aside>
        </div>

        {relatedDeals.length > 0 && (
          <section className="deal-related" aria-labelledby="related-offers-heading">
            <header><h2 id="related-offers-heading">Related software offers</h2><Link className="deal-detail-link" href={categoryHref}>Browse category <ArrowUpRight size={16} aria-hidden="true" /></Link></header>
            <div className="market-offer-grid">
              {relatedDeals.slice(0, 3).map(related => <OfferCard key={related.id} deal={related} />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
