import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import "../discounts.css";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { getPublishedTool } from "@/lib/published-catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAffiliateProgram, isPartnerBrand } from "@/lib/data/affiliate-links";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, softwareSchema, webPageSchema, organizationId } from "@/lib/structured-data";
import { offerLabel } from "@/lib/offer-links";
import { BrandBuyingGuides } from "@/components/articles/BrandBuyingGuides";
import { BrandSourcePanel } from "@/components/seo/BrandSourcePanel";
import { SavingsCalculator } from "@/components/deals/SavingsCalculator";
import { CouponCode } from "@/components/deals/CouponCode";
import { OfferEvidenceDetails } from "@/components/deals/OfferEvidenceDetails";
import { OfferReportLink } from "@/components/deals/OfferReportLink";
import { getBrandCollectionLinks } from "@/lib/savings-collections";
import { CATEGORY_SEARCH_CONTENT } from "@/lib/data/category-search-content";
import {
  brandDiscountTitle, brandSearchTitle, brandDiscountDescription, brandDiscountAnswer, brandBestDiscountAnswer, getBrandDiscountData,
  getBrandDiscountFaqs, getIndexableDiscountBrands, hasBrandDiscountPage,
} from "@/lib/brand-discounts";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug)).map(({ slug }) => ({ slug }));
}

async function resolveBrand(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const tool = getPublishedTool(slug) || getToolBySlug(slug);
  if (!tool || !hasBrandDiscountPage(tool.slug)) notFound();
  return { tool, slug };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { tool } = await resolveBrand(params);
  const { offers, indexable } = getBrandDiscountData(tool);
  return pageMetadata({
    title: brandSearchTitle(tool), description: brandDiscountDescription(tool, offers),
    path: `/discounts/${tool.slug}`, image: `/discounts/${tool.slug}/opengraph-image`, noIndex: !indexable,
  });
}

export default async function BrandDiscountPage({ params }: { params: Promise<{ slug: string }> }) {
  const { tool, slug } = await resolveBrand(params);
  if (slug !== tool.slug) permanentRedirect(`/discounts/${tool.slug}`);
  const { offers, savingsOptions, purchaseChecks, guide, modifiedAt, sourceNotesCurrent, sourceVerifiedAt } = getBrandDiscountData(tool);
  const readableDate = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(Date.parse(value.length === 10 ? `${value}T00:00:00Z` : value));
  const couponOffers = offers.filter(offer => offer.code);
  const otherOffers = offers.filter(offer => !offer.code);
  const freeOptions = otherOffers.filter(offer => offer.dealType === "free_plan" || offer.dealType === "free_trial");
  const offerGroups = [
    { id: "coupon-codes", heading: `${tool.name} coupon & promo code listings`, offers: couponOffers },
    { id: "other-offers", heading: `Other sourced ${tool.name} offers`, offers: otherOffers },
  ].filter(group => group.offers.length > 0);
  const path = `/discounts/${tool.slug}`;
  const title = brandDiscountTitle(tool);
  const faqs = getBrandDiscountFaqs(tool, offers);
  const availableBrands = getIndexableDiscountBrands().filter(other => other.slug !== tool.slug);
  const related = [
    ...(guide?.relatedSlugs || []).flatMap(slug => availableBrands.filter(other => other.slug === slug)),
    // Same-category brands first, partner brands ahead of others within that order.
    ...availableBrands.sort((a, b) => Number(b.categorySlug === tool.categorySlug) - Number(a.categorySlug === tool.categorySlug) || Number(isPartnerBrand(b.slug)) - Number(isPartnerBrand(a.slug))),
  ].filter((other, index, all) => all.findIndex(brand => brand.slug === other.slug) === index).slice(0, 4);
  const pricingUrl = guide?.sourceUrl || tool.pricingUrl || tool.website;
  // Partner brands: action buttons go through the attributed redirect; evidence
  // and citation links keep the exact URL that was reviewed.
  const partner = isPartnerBrand(tool.slug);
  const partnerCode = getAffiliateProgram(tool.slug)?.code;
  const pricingHref = partner ? `/go/${tool.slug}` : pricingUrl;
  const pricingRel = partner ? "sponsored nofollow noopener noreferrer" : "nofollow noopener noreferrer";
  const latestCheck = offers.flatMap(offer => offer.checkedAt || []).sort().at(-1);

  return (
    <article className="market-page">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            ...webPageSchema(title, brandDiscountDescription(tool, offers), path, guide ? "WebPage" : "CollectionPage"),
            ...(modifiedAt ? { dateModified: modifiedAt } : {}),
            about: { "@id": softwareSchema(tool)["@id"] },
            ...(guide ? { citation: [guide.sourceUrl, ...(guide.sources || []).map(source => source.url)] } : {}),
            relatedLink: related.map(other => absoluteUrl(`/discounts/${other.slug}`)),
            mainEntity: guide ? { "@id": absoluteUrl(`${path}#guide`) } : {
              "@type": "ItemList", numberOfItems: offers.length,
              itemListElement: offers.map((offer, index) => ({
                "@type": "ListItem", position: index + 1, name: offer.title, url: absoluteUrl(`/deals/${offer.slug}`),
              })),
            },
          },
          ...(guide ? [{
            "@type": "Article", "@id": absoluteUrl(`${path}#guide`),
            headline: title, description: brandDiscountDescription(tool, offers),
            mainEntityOfPage: { "@id": absoluteUrl(`${path}#webpage`) },
            author: { "@id": organizationId }, publisher: { "@id": organizationId },
            about: { "@id": softwareSchema(tool)["@id"] },
            datePublished: `${guide.reviewedAt}T00:00:00.000Z`, dateModified: modifiedAt, inLanguage: "en",
            image: absoluteUrl(`${path}/opengraph-image`),
            citation: [guide.sourceUrl, ...(guide.sources || []).map(source => source.url)],
            ...(offers.length ? { hasPart: { "@id": absoluteUrl(`${path}#current-offers`) } } : {}),
          }] : []),
          ...(guide && offers.length ? [{
            "@type": "ItemList", "@id": absoluteUrl(`${path}#current-offers`),
            name: `Current ${tool.name} offers`, numberOfItems: offers.length,
            itemListElement: offers.map((offer, index) => ({
              "@type": "ListItem", position: index + 1, name: offer.title, url: absoluteUrl(`/deals/${offer.slug}`),
            })),
          }] : []),
          // Mirrors the questions and answers rendered in the page's FAQ section.
          ...(faqs.length ? [{ ...faqSchema(faqs), "@id": absoluteUrl(`${path}#faq`) }] : []),
          softwareSchema(tool),
          breadcrumbSchema([{ name: "Brand discounts", path: "/discounts" }, { name: `${tool.name} discounts`, path }]),
        ],
      }} />

      <div className="market-intro discount-guide-intro">
        <div className="market-shell">
          <nav aria-label="Breadcrumb" className="discount-guide-breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/discounts">Brand discounts</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{tool.name}</span>
          </nav>

          <header className="discount-guide-header">
            <div className="discount-guide-title">
              <div className="flex items-center gap-3">
                <BrandAvatar name={tool.name} slug={tool.slug} letters={tool.logoLetter} category={tool.categorySlug} />
                <p className="market-eyebrow">{tool.category}</p>
              </div>
              <h1>{title}</h1>
              <p>{guide?.intro || `Review ${tool.name} offer terms, eligible plans, and renewal costs before choosing an offer.`}</p>
              <p className="discount-guide-byline">By <Link href="/about" className="underline underline-offset-4">SaaSFolio editorial</Link>
                {guide && <> · Reviewed <time dateTime={guide.reviewedAt}>{readableDate(guide.reviewedAt)}</time></>}
                {sourceVerifiedAt && <> · Official sources re-checked <time dateTime={sourceVerifiedAt}>{readableDate(sourceVerifiedAt)}</time></>}
              </p>
              {partner ? <>
                {partnerCode && <div className="discount-partner-code" data-partner-code="">
                  <p>SaaSFolio partner code for {tool.name}</p>
                  <CouponCode code={partnerCode} note={`Partner code supplied through ${tool.name}'s affiliate program. Enter it at ${tool.name} checkout; the provider confirms the discount before you pay.`} />
                </div>}
                <div className="discount-guide-actions">
                  <a href={pricingHref} target="_blank" rel={pricingRel} className="market-button market-button-primary" data-partner-link="">Get {tool.name} via our partner link <ArrowUpRight size={16} aria-hidden="true" /></a>
                  <a href="#current-offers" className="market-button market-button-secondary">Compare offers <ArrowRight size={16} aria-hidden="true" /></a>
                </div>
                <p className="discount-partner-note"><span className="market-badge market-badge-verified">Partner</span> SaaSFolio earns a commission if you subscribe through this link, at no extra cost to you. <Link href="/affiliate-disclosure" className="underline underline-offset-4">How partners are featured</Link></p>
              </> : <div className="discount-guide-actions">
                <a href="#current-offers" className="market-button market-button-primary">Compare offers <ArrowRight size={16} aria-hidden="true" /></a>
                <a href={pricingHref} target="_blank" rel={pricingRel} className="market-button market-button-secondary">Official pricing <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>}
            </div>

            <section aria-labelledby="discount-summary-heading" className="discount-guide-summary">
              <h2 id="discount-summary-heading">Savings at a glance</h2>
              <p id="discount-answer">{brandDiscountAnswer(tool, offers)}</p>
              <dl>
                <div><dt>Recorded codes</dt><dd>{couponOffers.length}</dd></div>
                <div><dt>Free plans and trials</dt><dd>{freeOptions.length}</dd></div>
                {latestCheck && <div><dt>Latest source check</dt><dd><time dateTime={latestCheck}>{latestCheck.slice(0, 10)}</time></dd></div>}
              </dl>
              <Link href={`/tools/${tool.slug}`} className="market-button market-button-secondary">Features & alternatives <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </section>
          </header>
        </div>
      </div>

      <div className="market-shell discount-guide-content">
        <nav aria-label="On this page" className="discount-category-nav">
          <a href="#current-offers">Offers & codes</a>{guide && <a href="#plan-fit">Choose your workflow</a>}<a href="#saving-guide">Ways to save</a>
          <a href="#offer-sources">Compare sources</a>{guide?.billingModel !== "usage" && <a href="#compare-costs">Compare annual costs</a>}
          {purchaseChecks && <a href="#eligibility">Eligibility</a>}
          <a href="#redemption">How to redeem</a>{purchaseChecks && <a href="#coupon-help">Code not working?</a>}<a href="#questions">Questions</a>
        </nav>

      <section id="current-offers" className="space-y-5 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">Current {tool.name} discount codes & offers</h2>
        <dl id="discount-availability" aria-label={`${tool.name} discount availability`} className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Coupon & promo codes</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{couponOffers.length ? `${couponOffers.length} sourced ${couponOffers.length === 1 ? "code" : "codes"}` : "No current code recorded"}</p><a href={couponOffers.length ? "#coupon-codes" : "#offer-sources"} className="inline-block text-sm text-[#C6FF3D] underline">{couponOffers.length ? "Read code terms" : "Where to check for codes"}</a></dd>
          </div>
          <div className="rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Provider savings</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{savingsOptions.length ? `${savingsOptions.length} reviewed ${savingsOptions.length === 1 ? "option" : "options"}` : "Check official pricing"}</p><a href={savingsOptions.length ? "#provider-savings" : pricingHref} {...(savingsOptions.length ? {} : { target: "_blank", rel: pricingRel })} className="inline-block text-sm text-[#C6FF3D] underline">{savingsOptions.length ? "Compare savings & eligibility" : "View provider plans ↗"}</a></dd>
          </div>
          <div className="rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Free plans & trials</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{freeOptions.length ? `${freeOptions.length} sourced ${freeOptions.length === 1 ? "option" : "options"}` : "No current listing"}</p><a href={freeOptions.length ? "#other-offers" : "#saving-guide"} className="inline-block text-sm text-[#C6FF3D] underline">{freeOptions.length ? "Review free access terms" : "Read the savings guide"}</a></dd>
          </div>
        </dl>
        {guide && !sourceNotesCurrent && <p className="max-w-3xl rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-zinc-300">The provider savings review dated <time dateTime={guide.reviewedAt}>{guide.reviewedAt}</time> needs an update, so previous savings amounts are hidden. <a href={pricingHref} target="_blank" rel={pricingRel} className="text-[#C6FF3D] underline">Check current {tool.name} pricing ↗</a>. Any current sourced offers below have their own check dates.</p>}
        <div id="best-discount" className="max-w-3xl space-y-2">
          <h3 className="font-display text-xl font-semibold text-white">How to choose the best {tool.name} discount</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{brandBestDiscountAnswer(tool, offers)}</p>
        </div>
        {savingsOptions.length > 0 && <div id="provider-savings" className="space-y-4 scroll-mt-28 rounded-2xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/[0.03] p-5 sm:p-6">
          <h3 className="font-display text-xl font-bold text-white">{tool.name} discounts at a glance</h3>
          <p className="text-sm text-zinc-400">Compare these reviewed provider offers with any coupon listed below. Education and nonprofit programs can require an application or approval.</p>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${tool.name} discount options`}>
            <table className="w-full min-w-[580px] text-left text-sm">
              <caption className="sr-only">Sourced {tool.name} discounts and eligibility, reviewed {guide!.reviewedAt}.</caption>
              <thead className="text-white"><tr><th scope="col" className="p-3">Saving option</th><th scope="col" className="p-3">What to check</th><th scope="col" className="p-3">Source</th></tr></thead>
              <tbody className="text-zinc-400">{savingsOptions.map(option => <tr key={option.type} className="border-t border-white/10 align-top">
                <th scope="row" className="p-3 font-normal"><span className="block text-xs text-zinc-500 mb-1">{option.type}</span><span className="font-semibold text-[#C6FF3D]">{option.saving}</span></th>
                <td className="p-3 leading-relaxed">{option.terms}</td>
                <td className="p-3"><a href={option.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">Provider terms ↗</a></td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">Source reviewed <time dateTime={guide!.reviewedAt}>{guide!.reviewedAt}</time>. Displayed savings are subject to provider terms; no checkout test is recorded.</p>
        </div>}
        {offerGroups.map(group => <section key={group.id} id={group.id} className="space-y-4 scroll-mt-28" aria-labelledby={`${group.id}-heading`}>
          <h3 id={`${group.id}-heading`} className="font-display text-xl font-bold text-white">{group.heading}</h3>
          {group.id === "other-offers" && <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">These listings do not require a recorded coupon code. A free plan or trial has its own limits and any conversion to paid billing should be checked separately.</p>}
          <div className="grid gap-4 md:grid-cols-2">
          {group.offers.map(offer => (
            <div key={offer.id} className="p-6 rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] space-y-4">
              <span className="inline-block rounded-md bg-[#C6FF3D]/10 px-3 py-1 text-[#C6FF3D] text-xs font-mono">{offerLabel(offer)}</span>
              <h4 className="font-display text-xl font-bold text-white"><Link href={`/deals/${offer.slug}`} className="hover:text-[#C6FF3D]">{offer.title}</Link></h4>
              {offer.code && <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-mono text-zinc-400">Reported coupon code</p>
                <CouponCode key={`${offer.slug}:${offer.code}`} code={offer.code} />
              </div>}
              <p className="text-sm text-zinc-300 leading-relaxed">{offer.terms}</p>
              <OfferEvidenceDetails deal={offer} />
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href={`/deals/${offer.slug}`} className="text-[#C6FF3D] underline">Offer details & redemption</Link>
                <a href={`/go/${offer.slug}`} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-white underline">{offer.code ? "Use code at provider" : offer.dealType === "free_trial" ? "View provider trial" : offer.dealType === "free_plan" ? "View free plan" : "View provider offer"} ↗</a>
              </div>
              <OfferReportLink offerSlug={offer.slug} />
            </div>
          ))}
          </div>
        </section>)}
      </section>

      <BrandSourcePanel tool={tool} />
      {guide?.billingModel !== "usage" && <SavingsCalculator brand={tool.name} />}

      {purchaseChecks && <section id="eligibility" className="space-y-5 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">Who qualifies for {tool.name} discounts?</h2>
        <p className="max-w-3xl text-zinc-400">Check these details against the provider’s current terms before applying a promotion or changing your subscription.</p>
        <dl className="grid gap-4 md:grid-cols-3">{purchaseChecks.eligibility.map(check => <div key={check.label} className="rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] p-6 space-y-3">
          <dt className="font-display text-lg font-bold text-white">{check.label}</dt>
          <dd className="text-sm text-zinc-400 leading-relaxed">{check.detail}</dd>
        </div>)}</dl>
        <p className="text-xs text-zinc-500">{sourceNotesCurrent ? "Guide reviewed" : "Earlier guide reviewed"} <time dateTime={guide!.reviewedAt}>{guide!.reviewedAt}</time>. {!sourceNotesCurrent && "These are questions to resolve with the provider, not current eligibility claims. "}<a href={pricingHref} target="_blank" rel={pricingRel} className="text-[#C6FF3D] underline">Check {tool.name}’s official terms ↗</a></p>
      </section>}

      {guide && <section id="plan-fit" className="space-y-5 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">Which {tool.name} option fits your workflow?</h2>
        <p className="max-w-3xl text-zinc-300 leading-relaxed">{guide.summary}</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10" tabIndex={0} role="region" aria-label={`${tool.name} buying considerations`}>
          <table className="w-full min-w-[600px] text-left text-sm">
            <caption className="sr-only">Buying considerations for {tool.name}; consult official pricing for current plan inclusions.</caption>
            <thead className="bg-white/[0.04] text-white"><tr><th scope="col" className="p-4">Option to evaluate</th><th scope="col" className="p-4">Who should compare it</th><th scope="col" className="p-4">Before you pay</th></tr></thead>
            <tbody className="text-zinc-400">{guide.decisionRows.map(row => <tr key={row.option} className="border-t border-white/10"><th scope="row" className="p-4 font-semibold text-zinc-200">{row.option}</th><td className="p-4">{row.bestFor}</td><td className="p-4">{row.check}</td></tr>)}</tbody>
          </table>
        </div>
      </section>}

      <section id="saving-guide" className="space-y-6 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">How to save on {tool.name}</h2>
        {(guide?.sections || [
          { heading: "Compare the full cost of an offer", text: `For ${tool.name}, compare the same product and billing term before and after applying a code. Include setup fees, optional extras, and taxes in the payable total. A displayed monthly equivalent may require payment for several months or years upfront.` },
          { heading: "Read the conditions attached to each code", text: "Use the individual source and offer details above to check product exclusions, new-customer rules, region, and minimum spend. A coupon reported by another publisher can have different conditions from a vendor promotion." },
          { heading: "Check renewal and cancellation terms", text: "Work out the cost beyond the introductory term, including the standard renewal rate. Confirm whether a promotional price continues and whether changing or cancelling a subscription affects eligibility." },
        ]).map(section => (
          <div key={section.heading} className="space-y-2 max-w-3xl">
            <h3 className="font-display text-lg font-bold text-white">{section.heading}</h3>
            <p className="text-zinc-400 leading-relaxed">{section.text}</p>
          </div>
        ))}
        {guide && <aside className="rounded-2xl p-6 border border-white/10 bg-white/[0.02] space-y-3 text-sm text-zinc-400">
          <h3 className="text-white font-bold">Official pricing observations · {sourceNotesCurrent && sourceVerifiedAt ? `re-checked ${readableDate(sourceVerifiedAt)}` : readableDate(guide.reviewedAt)}</h3>
          {sourceNotesCurrent ? <ul className="list-disc pl-5 space-y-2">{guide.sourceNotes.map(note => <li key={note}>{note}</li>)}</ul>
            : <p>The previous pricing observations need a new review. Open the official source for current plan limits, trial conditions, and annual billing options.</p>}
          <a href={guide.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[#C6FF3D] underline">Source: {tool.name} pricing ↗</a>
          {guide.sources && <ul className="space-y-2">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">{source.label} ↗</a></li>)}</ul>}
        </aside>}
      </section>

      <section id="redemption" className="space-y-4 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">How to claim a {tool.name} offer</h2>
        <ol className="list-decimal pl-6 space-y-3 text-zinc-400">
          {(guide?.redemptionSteps || [
            "Read the offer source, eligible products, customer restrictions, billing period, and published expiry.",
            "Follow the provider link from the offer details and select an eligible plan.",
            "If a code is listed, enter it at checkout. For automatic offers, check that the expected price appears.",
            "Confirm the total payable today, tax, renewal price, and cancellation terms before payment.",
          ]).map(step => <li key={step}>{step}</li>)}
        </ol>
      </section>

      {purchaseChecks && <section id="coupon-help" className="space-y-5 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">{tool.name} coupon not working? What to check</h2>
        <p className="max-w-3xl text-zinc-400">Use the order and account details to identify a mismatch before paying. These checks do not establish that an unsourced code is valid.</p>
        <div className="grid gap-4 md:grid-cols-2">{purchaseChecks.troubleshooting.map(check => <div key={check.problem} className="rounded-2xl border border-white/10 p-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-white">{check.problem}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{check.action}</p>
        </div>)}</div>
        <p className="text-sm text-zinc-400">If a listed offer is inaccurate, <Link href="/contact" className="text-[#C6FF3D] underline">report the {tool.name} offer to SaaSFolio</Link> with the listing and the provider’s response.</p>
      </section>}

      <BrandBuyingGuides slug={tool.slug} />

      <section id="questions" className="space-y-4 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">{tool.name} discount questions</h2>
        {faqs.map(faq => <details key={faq.question} className="rounded-xl border border-[var(--market-line)] bg-[var(--market-surface)] p-5">
          <summary className="cursor-pointer text-white font-semibold">{faq.question}</summary>
          <p className="pt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
        </details>)}
      </section>

      <aside className="border-t border-white/10 pt-6 text-sm text-zinc-400 space-y-3">
        <p>Sources are attributed on each listing. Offers leave the current catalog when their source check becomes older than 14 days or a published expiry passes. Coupon acceptance is not checkout tested.</p>
        <p>SaaSFolio is independent of {tool.name}. Some provider links may earn a commission; a referral does not by itself establish a discount. <Link href="/affiliate-disclosure" className="underline">Affiliate disclosure</Link> · <Link href="/contact" className="underline">Report an incorrect offer</Link></p>
      </aside>

      <nav aria-label="Explore related software savings" className="space-y-3 rounded-2xl border border-white/10 p-6">
        <h2 className="font-display text-xl font-bold text-white">Explore related software savings</h2>
        <ul className="space-y-3 text-sm text-[#C6FF3D]">
          <li><Link prefetch={false} href={`/deals/category/${tool.categorySlug}`} className="underline">{CATEGORY_SEARCH_CONTENT[tool.categorySlug]?.heading || `${tool.category} deals`}</Link></li>
          {getBrandCollectionLinks(tool.slug).map(link => <li key={link.href}><Link prefetch={false} href={link.href} className="underline">{link.label}</Link></li>)}
          <li><Link prefetch={false} href="/discounts" className="underline">All software discounts by brand</Link></li>
        </ul>
      </nav>

      {related.length > 0 && <nav aria-label="More brand discounts" className="space-y-4">
        <h2 className="font-display text-xl text-white font-bold">Compare more brand discounts</h2>
        <div className="grid gap-3 sm:grid-cols-2">{related.map(other => <Link key={other.slug} href={`/discounts/${other.slug}`} className="rounded-xl border border-white/10 px-4 py-4 space-y-2 hover:border-[#C6FF3D]/40">
          <span className="block text-sm font-semibold text-[#C6FF3D]">{other.name} discounts & offer terms →</span>
          <span className="block text-xs text-zinc-500">{other.category}</span>
        </Link>)}</div>
      </nav>}
      </div>
    </article>
  );
}
