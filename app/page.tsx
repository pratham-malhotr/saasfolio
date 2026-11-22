import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calculator, Code2, Layers, Palette, Scale, Search, Server, Sparkles, TrendingUp } from "lucide-react";
import { FolioArtwork } from "@/components/animations/FolioArtwork";
import { ScrollMotion } from "@/components/animations/ScrollMotion";
import { getPublishedTools, getPublishedOffers } from "@/lib/published-catalog";
import { getCatalogCategories } from "@/lib/categories";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import { BrandDiscountsSection } from "@/components/sections/BrandDiscountsSection";
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
  { href: "/hosting", title: "Web hosting comparisons", detail: "Shortlist VPS and managed hosting plans.", icon: Server },
  { href: "/compare", title: "Compare software", detail: "Weigh features, pricing and trade-offs.", icon: Scale },
  { href: "/articles", title: "Read software buying guides", detail: "Check plan limits and trade-offs before you buy.", icon: BookOpen },
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
    <ScrollMotion className="directory-home min-h-screen bg-[#090b0d] text-[#f0f2ed]">
      <JsonLd data={collectionSchema(SITE_TITLE, SITE_DESCRIPTION, "/", featured.map(tool => ({ name: tool.name, path: `/tools/${tool.slug}` })))} />
      <section className="home-hero">
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-36 lg:px-8">
          <div className="home-hero-grid">
            <div>
              <p className="home-kicker">Software research & discovery</p>
              <h1 className="home-title">Find SaaS tools.<br /><span>Buy with clarity.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">Explore {tools.length} software brands. Compare features, subscription prices and SaaS deals before you buy.</p>
              <form action="/brands" method="get" role="search" className="home-search">
                <Search className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true" />
                <label htmlFor="home-brand-search" className="sr-only">Search software brands</label>
                <input id="home-brand-search" name="q" type="search" placeholder="Search software" maxLength={100} />
                <button type="submit">Search</button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 sm:text-sm">
                <span>{categories.filter(category => category.toolCount > 0).length} software categories</span>
                <Link href="/editorial-policy" className="py-2 text-zinc-300 underline decoration-white/30 underline-offset-4 hover:text-[#C6FF3D]">How we research</Link>
              </div>
            </div>
            <div className="home-hero-art"><FolioArtwork variant="directory" /></div>
          </div>
          <nav aria-label="Start your software research" className="mt-5 grid gap-2.5 sm:mt-7 sm:grid-cols-3 sm:gap-3 lg:mt-9">
            {researchPaths.map(({ href, title, detail, icon: Icon }, index) => (
              <Link key={href} href={href} className="motion-card home-path" data-path={index}>
                <span className="home-path-icon"><Icon aria-hidden="true" size={19} /></span>
                <span><span className="block text-sm font-semibold text-white sm:text-base">{title}</span><span className="mt-1 block text-xs leading-relaxed text-zinc-400 sm:text-sm">{detail}</span></span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div data-motion="" className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="home-label">Software directory</p><h2 className="home-section-title">Find what fits your workflow.</h2></div>
          <Link href="/brands" className="home-text-link">All {tools.length} brands</Link>
        </div>
        <nav aria-label="Popular software categories" className="mb-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {categoryPicks.map(({ slug, label, icon: Icon }, index) => (
            <Link key={slug} data-motion={index % 3} href={`/brands?category=${slug}`} className="motion-card home-category">
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C6FF3D]" />
              <span className="text-sm text-zinc-200">{label}<span className="mt-0.5 block text-xs text-zinc-400">{categories.find(category => category.slug === slug)?.toolCount || 0} brands</span></span>
            </Link>
          ))}
        </nav>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool, index) => (
            <article key={tool.slug} data-motion={index % 3} className="motion-card group flex flex-col rounded-2xl border border-white/10 bg-[#111518] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span aria-hidden="true" className="home-monogram">{tool.name.slice(0, 1).toUpperCase()}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">{tool.pricingModel}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-white"><Link prefetch={false} href={`/tools/${tool.slug}`} className="inline-flex min-h-8 items-center hover:text-[#C6FF3D]">{tool.name}</Link></h3>
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-400">{tool.description}</p>
              <p className="mt-auto pt-4 text-xs text-zinc-400">{tool.category}</p>
            </article>
          ))}
        </div>
      </section>

      <BrandDiscountsSection deals={offers} />

      <section className="home-hosting">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:px-8">
          <div data-motion="">
            <p className="home-label">Hosting & infrastructure</p>
            <h2 className="home-section-title">What will your next host really cost?</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">Build a shortlist, compare VPS and managed plans, and see how much you’ll pay after the introductory offer.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/hosting-cost-calculator" className="home-primary"><Calculator size={17} aria-hidden="true" />Hosting renewal cost calculator</Link>
              <Link href="/hosting" className="home-text-link">Explore hosting</Link>
            </div>
          </div>
          <div className="grid gap-3" aria-label="Hosting buying guides">
            {hostingGuides.map(item => (
              <Link key={item.slug} href={`/articles/${item.slug}`} data-motion="" className="motion-card group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#11191b] p-5">
                <div><h3 className="text-sm font-semibold text-white sm:text-base">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.detail}</p></div>
                <BookOpen size={18} aria-hidden="true" className="shrink-0 text-[#C6FF3D]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div data-motion="" className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="home-label">From the editorial desk</p><h2 className="home-section-title">Read before you commit.</h2></div>
          <Link href="/articles" className="home-text-link">All reviews & guides</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article, index) => (
            <article key={article.slug} data-motion={index} className="motion-card group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111518]">
              <div className="home-cover" aria-hidden="true">
                {article.coverImage ? <Image src={article.coverImage.src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <BookOpen className="h-9 w-9 text-[#C6FF3D]" />}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="mb-3 text-xs text-zinc-400">{article.tags[0]} · {article.readTime}</p>
                <h3 className="font-display text-xl font-semibold leading-snug text-white"><Link href={`/articles/${article.slug}`} className="hover:text-[#C6FF3D]">{article.title}</Link></h3>
                <p className="mb-4 mt-3 text-sm leading-relaxed text-zinc-400">{article.summary}</p>
                <Link href={`/articles/${article.slug}`} aria-label={`Read the guide: ${article.title}`} className="mt-auto self-start home-text-link">Read the guide</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <div data-motion="" className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="home-section-title">Explore software savings</h2><Link href="/discounts" className="home-text-link">Discounts by brand</Link></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {offers.slice(0, 4).map((offer, index) => (
              <Link key={offer.slug} data-motion={index} prefetch={false} href={`/deals/${offer.slug}`} className="motion-card rounded-xl border border-white/10 bg-[#111518] p-5">
                <p className="home-label">{offer.code ? "Reported coupon" : offer.dealType === "free_plan" ? "Free plan" : offer.dealType === "free_trial" ? "Free trial" : "Sourced offer"}</p>
                <h3 className="mt-2 text-sm font-semibold text-white">{offer.title}</h3>
                <p className="mt-3 text-xs text-zinc-400">View source, terms & eligibility</p>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-400">Offer availability can change. Check the provider’s current terms and verify any reported code at checkout.</p>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div data-motion="" className="home-submit">
          <div><p className="home-label">For software makers</p><h2 className="home-section-title">Get your software discovered.</h2><p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-300">Submit your SaaS tool or hosting service to the SaaSFolio editorial team.</p></div>
          <Link href="/submit" className="home-primary">Add your brand</Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
          <Link href="/editorial-policy" className="home-quiet-link">Editorial policy</Link>
          <Link href="/affiliate-disclosure" className="home-quiet-link">How SaaSFolio is funded</Link>
          <a href="#explore" className="home-quiet-link">Back to the directory</a>
        </div>
      </section>
    </ScrollMotion>
  );
}
