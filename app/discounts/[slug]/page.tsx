import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { breadcrumbSchema, softwareSchema, webPageSchema } from "@/lib/structured-data";
import { offerLabel, offerStatus } from "@/lib/offer-links";
import { BrandSourcePanel } from "@/components/seo/BrandSourcePanel";
import { SavingsCalculator } from "@/components/deals/SavingsCalculator";
import {
  brandDiscountTitle, brandDiscountDescription, brandDiscountAnswer, brandBestDiscountAnswer, getBrandDiscountData,
  getBrandDiscountFaqs, getIndexableDiscountBrands, hasBrandDiscountPage,
} from "@/lib/brand-discounts";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug)).map(({ slug }) => ({ slug }));
}

async function resolveBrand(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || !hasBrandDiscountPage(tool.slug)) notFound();
  if (slug !== tool.slug) permanentRedirect(`/discounts/${tool.slug}`);
  return tool;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = await resolveBrand(params);
  const { offers, indexable } = getBrandDiscountData(tool);
  return pageMetadata({
    title: brandDiscountTitle(tool), description: brandDiscountDescription(tool, offers),
    path: `/discounts/${tool.slug}`, image: `/discounts/${tool.slug}/opengraph-image`, noIndex: !indexable,
  });
}

export default async function BrandDiscountPage({ params }: { params: Promise<{ slug: string }> }) {
  const tool = await resolveBrand(params);
  const { offers, savingsOptions, purchaseChecks, guide, modifiedAt, sourceNotesCurrent } = getBrandDiscountData(tool);
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
    ...availableBrands.sort((a, b) => Number(b.categorySlug === tool.categorySlug) - Number(a.categorySlug === tool.categorySlug)),
  ].filter((other, index, all) => all.findIndex(brand => brand.slug === other.slug) === index).slice(0, 4);
  const pricingUrl = guide?.sourceUrl || tool.pricingUrl || tool.website;

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-10">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            ...webPageSchema(title, brandDiscountDescription(tool, offers), path, "CollectionPage"),
            ...(modifiedAt ? { dateModified: modifiedAt } : {}),
            about: { "@id": softwareSchema(tool)["@id"] },
            ...(guide ? { citation: [guide.sourceUrl, ...(guide.sources || []).map(source => source.url)] } : {}),
            relatedLink: related.map(other => absoluteUrl(`/discounts/${other.slug}`)),
            mainEntity: {
              "@type": "ItemList", numberOfItems: offers.length,
              itemListElement: offers.map((offer, index) => ({
                "@type": "ListItem", position: index + 1, name: offer.title, url: absoluteUrl(`/deals/${offer.slug}`),
              })),
            },
          },
          softwareSchema(tool),
          breadcrumbSchema([{ name: "Brand discounts", path: "/discounts" }, { name: `${tool.name} discounts`, path }]),
        ],
      }} />

      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span>
        <Link href="/discounts" className="hover:text-white">Brand discounts</Link><span aria-hidden="true">/</span>
        <span className="text-[#C6FF3D]">{tool.name}</span>
      </nav>

      <header className="rounded-3xl border border-white/15 bg-[#09090C] p-6 sm:p-10 space-y-5">
        <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">{tool.category} · Savings guide</p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">
          {guide?.intro || `Compare sourced ${tool.name} coupons and offers for ${tool.bestFor.charAt(0).toLowerCase() + tool.bestFor.slice(1)}. Review the code requirements, eligible plans, and renewal terms before choosing an offer.`}
        </p>
        <p className="text-sm text-zinc-400">By <Link href="/about" className="text-white underline">SaaSFolio editorial</Link>
          {guide && <> · Guide reviewed <time dateTime={guide.reviewedAt}>{guide.reviewedAt}</time></>}
          . Source checks and checkout testing are different; the provider confirms the final price.</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="#current-offers" className="rounded-xl bg-[#C6FF3D] text-black px-5 py-3 font-bold">Compare discounts & offers</a>
          <a href={pricingUrl} target="_blank" rel="nofollow noopener noreferrer" className="rounded-xl border border-white/15 px-5 py-3 text-white">Check official pricing ↗</a>
          <Link href={`/tools/${tool.slug}`} className="px-2 py-3 text-zinc-300 underline">{tool.name} features & alternatives</Link>
        </div>
        <nav aria-label="On this page" className="flex flex-wrap gap-5 border-t border-white/10 pt-4 text-sm text-[#C6FF3D]">
          <a href="#current-offers">Offers & codes</a>{guide && <a href="#plan-fit">Choose your workflow</a>}<a href="#saving-guide">Ways to save</a>
          <a href="#offer-sources">Compare sources</a>{guide?.billingModel !== "usage" && <a href="#compare-costs">Compare annual costs</a>}
          {purchaseChecks && <a href="#eligibility">Eligibility</a>}
          <a href="#redemption">How to redeem</a>{purchaseChecks && <a href="#coupon-help">Code not working?</a>}<a href="#questions">Questions</a>
        </nav>
      </header>

      <section id="current-offers" className="space-y-5 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">Current {tool.name} discount codes & offers</h2>
        <p id="discount-answer" className="max-w-3xl text-zinc-300 leading-relaxed">{brandDiscountAnswer(tool, offers)}</p>
        <dl id="discount-availability" aria-label={`${tool.name} discount availability`} className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Coupon & promo codes</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{couponOffers.length ? `${couponOffers.length} sourced ${couponOffers.length === 1 ? "code" : "codes"}` : "No current code recorded"}</p><a href={couponOffers.length ? "#coupon-codes" : "#offer-sources"} className="inline-block text-sm text-[#C6FF3D] underline">{couponOffers.length ? "Read code terms" : "Where to check for codes"}</a></dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Provider savings</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{savingsOptions.length ? `${savingsOptions.length} reviewed ${savingsOptions.length === 1 ? "option" : "options"}` : "Check official pricing"}</p><a href={savingsOptions.length ? "#provider-savings" : pricingUrl} {...(savingsOptions.length ? {} : { target: "_blank", rel: "noopener noreferrer" })} className="inline-block text-sm text-[#C6FF3D] underline">{savingsOptions.length ? "Compare savings & eligibility" : "View provider plans ↗"}</a></dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-2">
            <dt className="text-xs font-mono uppercase tracking-wide text-zinc-500">Free plans & trials</dt>
            <dd className="space-y-2"><p className="font-semibold text-white">{freeOptions.length ? `${freeOptions.length} sourced ${freeOptions.length === 1 ? "option" : "options"}` : "No current listing"}</p><a href={freeOptions.length ? "#other-offers" : "#saving-guide"} className="inline-block text-sm text-[#C6FF3D] underline">{freeOptions.length ? "Review free access terms" : "Read the savings guide"}</a></dd>
          </div>
        </dl>
        {guide && !sourceNotesCurrent && <p className="max-w-3xl rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-zinc-300">The provider savings review dated <time dateTime={guide.reviewedAt}>{guide.reviewedAt}</time> needs an update, so previous savings amounts are hidden. <a href={pricingUrl} target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">Check current {tool.name} pricing ↗</a>. Any current sourced offers below have their own check dates.</p>}
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
            <div key={offer.id} className="p-6 rounded-2xl border border-white/10 bg-[#09090C] space-y-4">
              <span className="inline-block rounded-md bg-[#C6FF3D]/10 px-3 py-1 text-[#C6FF3D] text-xs font-mono">{offerLabel(offer)}</span>
              <h4 className="font-display text-xl font-bold text-white"><Link href={`/deals/${offer.slug}`} className="hover:text-[#C6FF3D]">{offer.title}</Link></h4>
              {offer.code && <p className="text-zinc-300">Reported code: <code className="text-[#C6FF3D]">{offer.code}</code></p>}
              <p className="text-sm text-zinc-300 leading-relaxed">{offer.terms}</p>
              <p className="text-xs text-zinc-400">{offerStatus(offer)}.
                {offer.checkedAt && <> Checked <time dateTime={offer.checkedAt}>{offer.checkedAt.slice(0, 10)}</time>.</>}
                {offer.expiryDate && <> Published expiry: <time dateTime={offer.expiryDate}>{offer.expiryDate.slice(0, 10)}</time>.</>}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href={`/deals/${offer.slug}`} className="text-[#C6FF3D] underline">Offer details & redemption</Link>
                <a href={`/go/${offer.slug}`} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-white underline">{offer.code ? "Use code at provider" : offer.dealType === "free_trial" ? "View provider trial" : offer.dealType === "free_plan" ? "View free plan" : "View provider offer"} ↗</a>
                {offer.sourceUrl && <a href={offer.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-zinc-400 underline">{offer.sourceKind === "vendor" ? "Vendor source" : "Coupon publisher"} ↗</a>}
              </div>
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
        <dl className="grid gap-4 md:grid-cols-3">{purchaseChecks.eligibility.map(check => <div key={check.label} className="rounded-2xl border border-white/10 bg-[#09090C] p-6 space-y-3">
          <dt className="font-display text-lg font-bold text-white">{check.label}</dt>
          <dd className="text-sm text-zinc-400 leading-relaxed">{check.detail}</dd>
        </div>)}</dl>
        <p className="text-xs text-zinc-500">Guide reviewed <time dateTime={guide!.reviewedAt}>{guide!.reviewedAt}</time>. <a href={pricingUrl} target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">Check {tool.name}’s official terms ↗</a></p>
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
          <h3 className="text-white font-bold">Official pricing observations · {guide.reviewedAt}</h3>
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

      <section id="questions" className="space-y-4 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold text-white">{tool.name} discount questions</h2>
        {faqs.map(faq => <details key={faq.question} className="rounded-2xl border border-white/10 bg-[#09090C] p-5">
          <summary className="cursor-pointer text-white font-semibold">{faq.question}</summary>
          <p className="pt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
        </details>)}
      </section>

      <aside className="border-t border-white/10 pt-6 text-sm text-zinc-400 space-y-3">
        <p>Sources are attributed on each listing. Offers leave the current catalog when their source check becomes older than 14 days or a published expiry passes. Coupon acceptance is not checkout tested.</p>
        <p>SaaSFolio is independent of {tool.name}. Some provider links may earn a commission; a referral does not by itself establish a discount. <Link href="/affiliate-disclosure" className="underline">Affiliate disclosure</Link> · <Link href="/contact" className="underline">Report an incorrect offer</Link></p>
      </aside>

      {related.length > 0 && <nav aria-label="More brand discounts" className="space-y-4">
        <h2 className="font-display text-xl text-white font-bold">Compare more brand discounts</h2>
        <div className="grid gap-3 sm:grid-cols-2">{related.map(other => <Link key={other.slug} href={`/discounts/${other.slug}`} className="rounded-xl border border-white/10 px-4 py-4 space-y-2 hover:border-[#C6FF3D]/40">
          <span className="block text-sm font-semibold text-[#C6FF3D]">{other.name} discounts & offer terms →</span>
          <span className="block text-xs text-zinc-500">{other.category}</span>
        </Link>)}</div>
      </nav>}
    </article>
  );
}
