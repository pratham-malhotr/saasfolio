import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Calculator, Code2, Layers, Palette, Scale, Search, Server, Sparkles, TrendingUp } from "lucide-react";
import { FolioArtwork } from "@/components/animations/FolioArtwork";
import { HeroArtwork } from "@/components/animations/HeroArtwork";
import { ScrollMotion } from "@/components/animations/ScrollMotion";
import { BrandDiscountsSection } from "@/components/sections/BrandDiscountsSection";
import { getPublishedTools, getPublishedOffers } from "@/lib/published-catalog";
import { getCatalogCategories } from "@/lib/categories";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import "./home.css";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });
export const revalidate = 3600;

const picks = ["notion", "beehiiv", "hostinger", "framer", "supabase", "predis-ai", "vercel", "semrush", "clickup", "canva", "cloudflare", "digitalocean", "obsidian", "plausible", "carrd", "bitwarden", "coolify", "linear"];
const categoryPicks = [
  { slug: "ai-tools", label: "AI tools", icon: Sparkles },
  { slug: "hosting", label: "Hosting & cloud", icon: Server },
  { slug: "marketing", label: "Marketing", icon: TrendingUp },
  { slug: "dev-tools", label: "Developer tools", icon: Code2 },
  { slug: "productivity", label: "Productivity", icon: Layers },
  { slug: "design", label: "Design & creative", icon: Palette },
];
const researchPaths = [
  { href: "/hosting", title: "Web hosting", detail: "Shortlist VPS and managed hosting plans.", icon: Server },
  { href: "/compare", title: "Software comparisons", detail: "Compare features, pricing and trade-offs.", icon: Scale },
  { href: "/articles", title: "Buying guides", detail: "Check plan limits before you commit.", icon: BookOpen },
];
const hostingGuides = [
  { title: "Hetzner vs DigitalOcean for a business site", detail: "CPU class, region, recovery and the cost of running it.", slug: "hetzner-vs-digitalocean-small-business-vps" },
  { title: "Hostinger VPS or managed WordPress?", detail: "A solo publisher’s guide to control, time and renewal.", slug: "hostinger-vps-vs-managed-wordpress-solo-blogger" },
  { title: "Find out what your hosting really costs", detail: "First-term discounts, prepaid amounts and later renewal.", slug: "hosting-introductory-discount-vs-renewal-cost" },
];

export default function HomePage() {
  const tools = getPublishedTools();
  const categories = getCatalogCategories();
  const offers = getPublishedOffers();
  const toolsBySlug = new Map(tools.map(tool => [tool.slug, tool]));
  const featured = [...picks, ...tools.filter(tool => !picks.includes(tool.slug)).map(tool => tool.slug)]
    .flatMap(slug => toolsBySlug.get(slug) || []).slice(0, 18);
  const articles = [...DETAILED_ARTICLES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <ScrollMotion className="directory-home">
      <JsonLd data={collectionSchema(SITE_TITLE, SITE_DESCRIPTION, "/", featured.map(tool => ({ name: tool.name, path: `/tools/${tool.slug}` })))} />
      <section className="home-opening" data-home-hero="">
        <div className="home-shell">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">The SaaS research directory</p>
              <h1 className="home-title">
                <span className="home-title-line">Find the right{" "}</span>
                <span className="home-title-line home-title-accent">software.</span>
              </h1>
              <p className="home-intro">Compare tools, subscription prices, and sourced offers before you buy.</p>
              <form action="/brands" method="get" role="search" className="home-search">
                <Search size={21} aria-hidden="true" />
                <label htmlFor="home-brand-search" className="sr-only">Search software brands</label>
                <input id="home-brand-search" name="q" type="search" placeholder="Search brands" maxLength={100} />
                <button type="submit">Search <ArrowRight size={16} aria-hidden="true" /></button>
              </form>
              <div className="home-hero-links">
                <a href="#explore" className="home-text-link">Explore the directory <ArrowDown size={16} aria-hidden="true" /></a>
                <Link href="/editorial-policy" className="home-text-link">How we research <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
            <HeroArtwork>
              <Image src="/images/home/glass-folio.webp" alt="" fill unoptimized loading="eager" fetchPriority="high" className="home-art-image" />
              <Link href="/brands" className="home-art-link" prefetch={false}>
                <span><strong>{tools.length} brands</strong><span>Browse A–Z</span></span>
                <span className="home-art-arrow"><ArrowUpRight size={21} aria-hidden="true" /></span>
              </Link>
            </HeroArtwork>
          </div>

          <nav className="home-paths" aria-label="Start your software research">
            {researchPaths.map(({ href, title, detail, icon: Icon }, index) => (
              <Link key={href} href={href} className="home-path" data-motion={index} prefetch={false}>
                <Icon size={21} aria-hidden="true" />
                <span><strong>{title}</strong><small>{detail}</small></span>
                <ArrowUpRight className="home-link-icon" size={19} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section id="explore" className="home-shell home-section">
        <div className="home-section-head" data-motion="">
          <div><p className="home-label">Software directory</p><h2 className="home-section-title">Explore by category.</h2></div>
          <Link href="/brands" className="home-text-link">All {tools.length} brands <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <nav aria-label="Popular software categories" className="home-category-grid">
          {categoryPicks.map(({ slug, label, icon: Icon }, index) => (
            <Link key={slug} data-motion={index % 3} href={`/brands?category=${slug}`} className="home-category" prefetch={false}>
              <Icon aria-hidden="true" size={18} />
              <span>{label}<small>{categories.find(category => category.slug === slug)?.toolCount || 0} brands</small></span>
            </Link>
          ))}
        </nav>
        <ul className="home-brand-grid">
          {featured.map((tool, index) => (
            <li key={tool.slug} data-motion={index % 3}>
              <Link href={`/tools/${tool.slug}`} className="home-brand-card" prefetch={false}>
                <span className="home-monogram" data-tone={index % 4} aria-hidden="true">{tool.name.slice(0, 1).toUpperCase()}</span>
                <span className="home-brand-name"><strong>{tool.name}</strong><small>{tool.category}</small></span>
                <ArrowUpRight className="home-link-icon home-brand-arrow" size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-compare-section">
        <div className="home-shell home-section home-compare-grid">
          <div data-motion="">
            <p className="home-label">Side-by-side research</p>
            <h2 className="home-section-title">Make a better shortlist.</h2>
            <p className="home-feature-copy">Compare the features and billing terms that matter to your workflow, then check the offers for your finalists.</p>
            <Link href="/compare" className="home-primary">Compare software <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <FolioArtwork variant="directory" loading="lazy" />
        </div>
      </section>

      <BrandDiscountsSection deals={offers} />

      <section className="home-shell home-section home-hosting">
        <div className="home-hosting-intro" data-motion="">
          <p className="home-label">Hosting & infrastructure</p>
          <h2 className="home-section-title">See what hosting really costs.</h2>
          <p className="home-feature-copy">Compare VPS and managed plans, from the first invoice to the renewal price.</p>
          <div className="home-hero-links">
            <Link href="/hosting-cost-calculator" className="home-primary"><Calculator size={17} aria-hidden="true" />Calculate renewal cost</Link>
            <Link href="/hosting" className="home-text-link">Explore hosting <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="home-guide-list" aria-label="Hosting buying guides">
          {hostingGuides.map((item, index) => (
            <Link key={item.slug} href={`/articles/${item.slug}`} data-motion={index} className="home-guide">
              <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              <ArrowUpRight className="home-link-icon" size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-shell home-section home-editorial">
        <div className="home-section-head" data-motion="">
          <div><p className="home-label">Buyer’s library</p><h2 className="home-section-title">Read before you commit.</h2></div>
          <Link href="/articles" className="home-text-link">All reviews & guides <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="home-article-grid">
          {articles.map((article, index) => (
            <article key={article.slug} data-motion={index}>
              <Link href={`/articles/${article.slug}`} className="home-article">
                <div className="home-cover" aria-hidden="true">
                  {article.coverImage ? <Image src={article.coverImage.src} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover" /> : <BookOpen size={34} />}
                </div>
                <div className="home-article-copy">
                  <p>{article.tags[0]} · {article.readTime}</p>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <span className="home-text-link">Read the guide <ArrowUpRight className="home-link-icon" size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="home-shell home-section home-offers">
          <div className="home-section-head" data-motion=""><h2 className="home-section-title">Explore software savings.</h2><Link href="/deals" className="home-text-link">Browse offers <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          <div className="home-offer-grid">
            {offers.slice(0, 4).map((offer, index) => (
              <Link key={offer.slug} data-motion={index} prefetch={false} href={`/deals/${offer.slug}`} className="home-offer">
                <p className="home-label">{offer.code ? "Reported coupon" : offer.dealType === "free_plan" ? "Free plan" : offer.dealType === "free_trial" ? "Free trial" : "Sourced offer"}</p>
                <h3>{offer.title}</h3>
                <span>Source, terms & eligibility <ArrowUpRight className="home-link-icon" size={15} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
          <p className="home-offer-note">Check the provider’s current terms and verify any reported code at checkout.</p>
        </section>
      )}

      <section className="home-shell home-section">
        <div className="home-submit" data-motion="">
          <div><h2 className="home-section-title">Get your software discovered.</h2><p>Submit your SaaS tool or hosting service to the SaaSFolio editorial team.</p></div>
          <Link href="/submit" className="home-primary">Add your brand <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </ScrollMotion>
  );
}
