import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, BookOpen, Calculator, CalendarCheck, Code2, FileCheck2,
  GraduationCap, HeartHandshake, Layers, Palette, Rocket, Scale, Search, Server,
  Sparkles, Tag, TrendingUp,
} from "lucide-react";
import { ScrollMotion } from "@/components/animations/ScrollMotion";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { OfferCard, OFFER_TYPES, offerValue } from "@/components/deals/OfferCard";
import { BrandDiscountsSection } from "@/components/sections/BrandDiscountsSection";
import { getPublishedTools, getPublishedOffers } from "@/lib/published-catalog";
import { getPublishedSavingsOffers } from "@/lib/savings-collections";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import "./home.css";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });
export const revalidate = 3600;

const spotlight = [
  "hostinger-vps-introductory-offer",
  "wpforms-official-new-license-code",
  "zapier-annual-billing",
  "intercom-early-stage-year-one",
  "taplio-aware-transition",
  "kinsta-three-month-introductory-offer",
  "asana-nonprofit-program",
  "coderabbit-annual-billing",
  "notion-startup-program",
];
const categoryLinks = [
  { slug: "ai-tools", label: "AI tools", icon: Sparkles },
  { slug: "hosting", label: "Hosting & cloud", icon: Server },
  { slug: "marketing", label: "Marketing", icon: TrendingUp },
  { slug: "dev-tools", label: "Developer tools", icon: Code2 },
  { slug: "productivity", label: "Productivity", icon: Layers },
  { slug: "design", label: "Design & creative", icon: Palette },
];
const collections = [
  { href: "/coupon-codes", label: "Coupon codes", description: "Find reported codes and review checkout requirements.", icon: Tag },
  { href: "/startup-deals", label: "Startup programs", description: "Find software credits and benefits for eligible teams.", icon: Rocket },
  { href: "/student-discounts", label: "Student discounts", description: "Compare education pricing and proof requirements.", icon: GraduationCap },
  { href: "/nonprofit-discounts", label: "Nonprofit discounts", description: "Find plans and programs for qualifying organizations.", icon: HeartHandshake },
];
const research = [
  { href: "/compare", label: "Compare software", description: "Review plan limits and trade-offs side by side.", icon: Scale },
  { href: "/savings-calculator", label: "Calculate annual savings", description: "Compare monthly and annual billing, including fees.", icon: Calculator },
  { href: "/hosting", label: "Web hosting comparisons", description: "Shortlist VPS and managed hosting providers.", icon: Server },
  { href: "/hosting-cost-calculator", label: "Check hosting renewal costs", description: "Compare the first invoice with the renewal price.", icon: CalendarCheck },
];

export default function HomePage() {
  const tools = getPublishedTools();
  const offers = getPublishedSavingsOffers(getPublishedOffers());
  const featured = spotlight.flatMap(slug => offers.find(offer => offer.slug === slug) || []);
  const featuredBrands = new Set(featured.map(offer => offer.toolSlug));
  for (const offer of offers) {
    if (featured.length >= 9) break;
    if (featuredBrands.has(offer.toolSlug)) continue;
    featured.push(offer);
    featuredBrands.add(offer.toolSlug);
  }
  const moreOffers = featured.slice(3);
  const letters = new Map(tools.map(tool => [tool.slug, tool.logoLetter]));
  const articles = [...DETAILED_ARTICLES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <ScrollMotion className="market-page directory-home">
      <JsonLd data={collectionSchema(SITE_TITLE, SITE_DESCRIPTION, "/", featured.map(offer => ({ name: offer.title, path: `/deals/${offer.slug}` })))} />
      <section className="home-opening" data-home-hero="" aria-labelledby="home-title">
        <div className="market-shell home-hero">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="market-eyebrow home-kicker"><Tag size={15} aria-hidden="true" /> SaaS deals and discounts</p>
              <h1 id="home-title" className="home-title">
                <span>Find the right software.</span>{" "}
                <span>Pay less for it.</span>
              </h1>
              <p className="home-intro">Find SaaS offers, coupon codes, and free trials. Check the source and eligibility before you buy.</p>
              <form action="/deals" method="get" role="search" className="home-search">
                <Search size={20} aria-hidden="true" />
                <label htmlFor="home-brand-search" className="sr-only">Search software deals by brand or keyword</label>
                <input id="home-brand-search" name="q" type="search" placeholder="Search brands or deals" maxLength={100} />
                <button type="submit" className="market-button market-button-primary">Search <ArrowRight size={16} aria-hidden="true" /></button>
              </form>
              <div className="home-hero-links">
                <Link href="/deals" className="home-text-link">Browse all deals <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link href="/discounts" className="home-text-link">Discounts by brand <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>

            <aside className="home-spotlight" aria-labelledby="spotlight-title">
              <div className="home-spotlight-heading">
                <span className="home-spotlight-icon"><Tag size={20} aria-hidden="true" /></span>
                <div>
                  <h2 id="spotlight-title">{featured.length ? "Offer spotlight" : "Explore ways to save"}</h2>
                  <p>{featured.length ? "Open an offer to check its terms" : "Find offers based on your eligibility"}</p>
                </div>
              </div>
              {featured.length ? (
                <ul>
                  {featured.slice(0, 3).map(offer => (
                    <li key={offer.slug}>
                      <Link href={`/deals/${offer.slug}`} prefetch={false} className="home-spotlight-row">
                        <BrandAvatar name={offer.toolName} category={offer.categorySlug} letters={letters.get(offer.toolSlug)} />
                        <span className="home-spotlight-name"><strong>{offer.toolName}</strong><small>{OFFER_TYPES[offer.dealType]}</small></span>
                        <span className="home-spotlight-value">{offerValue(offer)}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {collections.slice(1).map(({ href, label, icon: Icon }) => (
                    <li key={href}><Link href={href} className="home-spotlight-row"><Icon size={19} aria-hidden="true" /><strong>{label}</strong><ArrowUpRight size={16} aria-hidden="true" /></Link></li>
                  ))}
                </ul>
              )}
              <Link href={moreOffers.length ? "#featured-offers" : featured.length ? "/deals" : "/discounts"} className="home-spotlight-more">
                {moreOffers.length ? "Explore featured offers" : featured.length ? "Browse all deals" : "Explore brand discounts"} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </aside>
          </div>

          <div className="home-trust">
            {offers.length > 0 && <Link href="/deals"><Tag size={18} aria-hidden="true" /><span><strong>{offers.length}</strong> sourced offers</span></Link>}
            <Link href="/brands"><Layers size={18} aria-hidden="true" /><span><strong>{tools.length}</strong> software profiles</span></Link>
            <Link href="/about#standards"><FileCheck2 size={18} aria-hidden="true" /><span>How we check sources</span><ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {moreOffers.length > 0 && (
        <section id="featured-offers" className="market-section home-featured" aria-labelledby="featured-title">
          <div className="home-section-head" data-motion="">
            <div><h2 id="featured-title" className="home-section-title">Featured offers</h2><p>Compare published savings and the terms that come with them.</p></div>
            <Link href="/deals" className="market-button market-button-secondary">View all deals <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="market-offer-grid">
            {moreOffers.map((offer, index) => <OfferCard key={offer.slug} deal={offer} letters={letters.get(offer.toolSlug)} motionIndex={index % 3} />)}
          </div>
        </section>
      )}

      <section className="home-band" aria-labelledby="category-title">
        <div className="market-section">
          <div className="home-section-head" data-motion="">
            <div><h2 id="category-title" className="home-section-title">Browse by category</h2></div>
            <Link href="/brands" className="home-text-link">Software brands A–Z <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <nav aria-label="Popular software categories" className="home-category-grid">
            {categoryLinks.map(({ slug, label, icon: Icon }, index) => {
              const count = offers.filter(offer => offer.categorySlug === slug).length;
              return (
                <Link key={slug} href={`/deals/category/${slug}`} className="home-category motion-card" data-motion={index % 3} prefetch={false}>
                  <span className="home-category-icon"><Icon size={21} aria-hidden="true" /></span>
                  <strong>{label}</strong>
                  <small>{count ? `${count} ${count === 1 ? "offer" : "offers"}` : "Explore options"}</small>
                  <ArrowUpRight className="home-category-arrow" size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <nav aria-label="Ways to save" className="home-collection-grid">
            {collections.map(({ href, label, description, icon: Icon }, index) => (
              <Link key={href} href={href} className="home-collection motion-card" data-motion={index % 4} prefetch={false}>
                <Icon size={20} aria-hidden="true" />
                <strong>{label}</strong>
                <span>{description}</span>
                <ArrowUpRight className="home-category-arrow" size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <BrandDiscountsSection deals={offers} />

      <section className="home-band" aria-labelledby="research-title">
        <div className="market-section home-research">
          <div className="home-research-intro" data-motion="">
            <h2 id="research-title" className="home-section-title">Know what you’ll pay.</h2>
            <p>Compare plans and model renewal costs before committing to a subscription.</p>
          </div>
          <nav className="home-research-grid" aria-label="Software buying tools">
            {research.map(({ href, label, description, icon: Icon }, index) => (
              <Link key={href} className="home-research-link motion-card" data-motion={index % 2} href={href} prefetch={false}>
                <Icon size={20} aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="market-section" aria-labelledby="guides-title">
        <div className="home-section-head" data-motion="">
          <div><h2 id="guides-title" className="home-section-title">Latest buying guides</h2></div>
          <Link href="/articles" className="home-text-link">All reviews & guides <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="home-article-grid">
          {articles.map((article, index) => (
            <article key={article.slug} data-motion={index}>
              <Link href={`/articles/${article.slug}`} className="home-article motion-card" prefetch={false}>
                <div className="home-cover" aria-hidden="true">
                  {article.coverImage ? <Image src={article.coverImage.src} alt="" fill sizes="(max-width: 639px) 94vw, (max-width: 959px) 45vw, 380px" className="object-cover" /> : <BookOpen size={31} />}
                </div>
                <div className="home-article-copy">
                  <p>{article.category} · {article.readTime}</p>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="market-shell home-submit" data-motion="" aria-labelledby="home-submit-title">
        <div><h2 id="home-submit-title">List your software</h2><p>Send your product or hosting service for editorial review.</p></div>
        <Link href="/submit" className="market-button market-button-secondary">Add your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </section>
    </ScrollMotion>
  );
}
