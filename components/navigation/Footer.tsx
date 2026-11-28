import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CATEGORIES } from "@/lib/catalog-categories";
import { SAVINGS_COLLECTION_LINKS } from "@/lib/data/savings-collections";
import { PrivacyPreferences } from "@/components/privacy/PrivacyPreferences";

const groups = [
  {
    title: "Deals & savings",
    links: [
      { href: "/deals", label: "Software deals" },
      { href: "/discounts", label: "Discounts by brand" },
      { href: "/deals?type=lifetime", label: "Lifetime deals" },
      { href: "/deals?type=free_trial", label: "Free trials" },
      ...SAVINGS_COLLECTION_LINKS,
    ],
  },
  {
    title: "Research",
    links: [
      { href: "/brands", label: "All brands A–Z" },
      { href: "/tools", label: "Software profiles" },
      { href: "/compare", label: "Compare software" },
      { href: "/hosting", label: "Hosting research" },
      { href: "/articles", label: "Buying guides" },
      { href: "/articles/build-a-saas-budget-before-buying", label: "Build a software budget" },
      { href: "/savings-calculator", label: "Annual savings calculator" },
      { href: "/hosting-cost-calculator", label: "Hosting renewal calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About SaaSFolio" },
      { href: "/about#standards", label: "How we check offers" },
      { href: "/editorial-policy", label: "Editorial policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const trust = [
  { label: "Source on every offer", icon: FileCheck2 },
  { label: "Check dates shown", icon: CalendarCheck },
  { label: "Sponsored listings labelled", icon: ShieldCheck },
];

export function Footer() {
  return (
    <footer data-nosnippet="" className="site-footer px-0 pb-8 pt-12 sm:pt-16">
      <div className="footer-shell">
        <section className="footer-cta" aria-labelledby="footer-cta-title">
          <div>
            <h2 id="footer-cta-title">Sell software? Get it in front of buyers.</h2>
            <p>Submit your product, hosting service or offer for editorial review by the SaaSFolio team.</p>
          </div>
          <div className="footer-cta-actions">
            <Link href="/submit" prefetch={false} className="market-button market-button-primary">Add your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link href="/submit/offer" prefetch={false} className="market-button market-button-secondary">Submit an offer <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_.9fr]">
          <div className="space-y-5">
            <Logo size="lg" />
            <p className="max-w-xs text-sm leading-relaxed">Sourced SaaS deals, coupon codes and credits — with the terms, eligibility and renewal price checked before you subscribe.</p>
            <ul className="footer-trust" aria-label="Our standards">
              {trust.map(({ label, icon: Icon }) => <li key={label}><Icon size={13} aria-hidden="true" /> {label}</li>)}
            </ul>
          </div>
          {groups.map(group => (
            <div key={group.title}>
              <h2 className="footer-heading">{group.title}</h2>
              <ul className="footer-links">
                {group.links.map(link => <li key={link.href}><Link prefetch={false} href={link.href}>{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="footer-heading">Categories</h2>
            <ul className="footer-links">
              {CATEGORIES.slice(0, 8).map(category => (
                <li key={category.id}><Link prefetch={false} href={`/deals/category/${category.slug}`}>{category.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <p className="footer-note mb-5 mt-12 pt-5 text-xs leading-relaxed">
          SaaSFolio may earn a commission on purchases through affiliate links. Sponsored placements are labelled. Check each provider’s source, terms, and eligibility before paying.
        </p>
        <div className="footer-bottom flex flex-wrap items-center justify-between gap-4 pt-5 text-xs">
          <span>© 2026 SaaSFolio. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link prefetch={false} href="/privacy">Privacy</Link>
            <Link prefetch={false} href="/terms">Terms</Link>
            <PrivacyPreferences />
            <Link prefetch={false} href="/affiliate-disclosure">Affiliate disclosure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
