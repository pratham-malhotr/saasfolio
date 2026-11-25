import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CATEGORIES } from "@/lib/catalog-categories";
import { SAVINGS_COLLECTION_LINKS } from "@/lib/data/savings-collections";
import { PrivacyPreferences } from "@/components/privacy/PrivacyPreferences";

const groups = [
  {
    title: "Find software savings",
    links: [
      { href: "/deals", label: "Software deals" },
      { href: "/discounts", label: "Discounts by brand" },
      { href: "/deals?type=lifetime", label: "Lifetime deals" },
      { href: "/deals?type=free_trial", label: "Free trials" },
      ...SAVINGS_COLLECTION_LINKS,
    ],
  },
  {
    title: "Research and compare",
    links: [
      { href: "/brands", label: "All brands A–Z" },
      { href: "/tools", label: "Software profiles" },
      { href: "/compare", label: "Compare software" },
      { href: "/hosting", label: "Hosting research" },
      { href: "/articles", label: "Buying guides" },
      { href: "/articles/build-a-saas-budget-before-buying", label: "Build a software budget" },
      { href: "/savings-calculator", label: "Annual savings calculator" },
      { href: "/hosting-cost-calculator", label: "Hosting renewal calculator" },
      { href: "/editorial-policy", label: "Editorial policy" },
      { href: "/about#standards", label: "How we check offers" },
    ],
  },
];

export function Footer() {
  return (
    <footer data-nosnippet="" className="site-footer px-0 pb-8 pt-12 sm:pt-16">
      <div className="footer-shell">
        <div className="grid gap-x-9 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_.85fr]">
          <div className="space-y-5">
            <Logo size="lg" />
            <p className="max-w-xs text-sm leading-relaxed">Find software deals and check what they cover before you subscribe.</p>
            <Link href="/submit" prefetch={false} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent">
              Add your brand <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {groups.map(group => (
            <div key={group.title}>
              <h2 className="footer-heading">{group.title}</h2>
              <ul className="space-y-2 text-sm">
                {group.links.map(link => <li key={link.href}><Link prefetch={false} href={link.href}>{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="footer-heading">Popular categories</h2>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 8).map(category => (
                <li key={category.id}><Link prefetch={false} href={`/deals/category/${category.slug}`}>{category.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <p className="footer-note mb-5 mt-10 pt-5 text-xs leading-relaxed">
          SaaSFolio may earn a commission on purchases through affiliate links. Check each provider’s source, terms, and eligibility before paying.
        </p>
        <div className="footer-bottom flex flex-wrap items-center justify-between gap-4 pt-5 text-xs">
          <span>© 2026 SaaSFolio</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link prefetch={false} href="/privacy">Privacy</Link>
            <Link prefetch={false} href="/terms">Terms</Link>
            <PrivacyPreferences />
            <Link prefetch={false} href="/affiliate-disclosure">Affiliate disclosure</Link>
            <Link prefetch={false} href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
