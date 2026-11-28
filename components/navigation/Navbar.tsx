"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import type { PublicSearchCatalog } from "@/lib/search-catalog-types";
import { Search, Menu, X, ArrowUpRight, ArrowRight, Tag, Layers, FileText, User, LogOut, ShieldCheck, Scale, Server, ChevronDown, Rocket, GraduationCap, HeartHandshake, Ticket, Clock, Infinity as InfinityIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchLoading } from "@/components/modals/SearchLoading";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api-client";
import type { DiscountSearchEntry } from "@/lib/discount-search";

const CommandPalette = dynamic(() => import("@/components/modals/CommandPalette").then(module => module.CommandPalette), {
  loading: () => <SearchLoading />,
});

const subscribeToHydration = () => () => undefined;
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

export type NavCategory = { slug: string; name: string; dealCount: number };

const savingsLinks = [
  { href: "/coupon-codes", label: "Coupon codes", description: "Reported codes with checkout terms", icon: Ticket },
  { href: "/deals?type=free_trial", label: "Free trials", description: "Try before you commit", icon: Clock },
  { href: "/deals?type=lifetime", label: "Lifetime deals", description: "One payment, no renewals", icon: InfinityIcon },
  { href: "/startup-deals", label: "Startup programs", description: "Credits for eligible teams", icon: Rocket },
  { href: "/student-discounts", label: "Student discounts", description: "Education pricing and proof", icon: GraduationCap },
  { href: "/nonprofit-discounts", label: "Nonprofit discounts", description: "Plans for qualifying orgs", icon: HeartHandshake },
];

export function Navbar({ discountBrands, searchCatalog, accountsAvailable, categories = [] }: { discountBrands: DiscountSearchEntry[]; searchCatalog: PublicSearchCatalog; accountsAvailable: boolean; categories?: NavCategory[] }) {
  const pathname = usePathname();
  // A route can change while this shared layout is still hydrating. Keep the
  // initial link markup stable, then decorate the current route after hydration.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const compact = useMediaQuery("(width < 768px)");
  const drawerOpen = mobileMenuOpen && compact;
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatarLetter: string; isAdmin: boolean } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const signOutLock = useRef(false);

  useEffect(() => {
    const openSearch = () => setSearchOpen(true);
    const closeSearch = () => setSearchOpen(false);
    const keyboardSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.repeat) {
        event.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    window.addEventListener("saasfolio_search_open", openSearch);
    window.addEventListener("saasfolio_search_close", closeSearch);
    window.addEventListener("keydown", keyboardSearch);
    return () => {
      window.removeEventListener("saasfolio_search_open", openSearch);
      window.removeEventListener("saasfolio_search_close", closeSearch);
      window.removeEventListener("keydown", keyboardSearch);
    };
  }, []);

  async function signOut() {
    if (signOutLock.current) return;
    signOutLock.current = true;
    setSigningOut(true);
    setSignOutError("");
    try {
      await apiRequest("/api/auth/logout", {});
      setCurrentUser(null);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Sign-out could not be confirmed. Please try again.");
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
    } finally {
      signOutLock.current = false;
      setSigningOut(false);
    }
  }

  useEffect(() => {
    let active = true;
    const loadUser = () => {
      apiRequest<{ user: { name: string; email: string; avatarLetter: string; isAdmin: boolean } | null }>("/api/auth/session", undefined, "GET")
        .then(result => { if (active) setCurrentUser(result.user); })
        .catch(() => { if (active) setCurrentUser(null); });
    };

    loadUser();
    window.addEventListener("saasfolio_auth_changed", loadUser);
    return () => { active = false; window.removeEventListener("saasfolio_auth_changed", loadUser); };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => { setMobileMenuOpen(false); setMegaOpen(false); setProfileDropdownOpen(false); });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || searchOpen) return;
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    if (!megaOpen && !profileDropdownOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (megaOpen && !megaPanelRef.current?.contains(target) && !megaButtonRef.current?.contains(target)) setMegaOpen(false);
      if (profileDropdownOpen && !profileRef.current?.contains(target)) setProfileDropdownOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (megaOpen) { setMegaOpen(false); megaButtonRef.current?.focus(); }
      setProfileDropdownOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutside); window.removeEventListener("keydown", closeOnEscape); };
  }, [megaOpen, profileDropdownOpen]);

  const navLinks = [
    { label: "Deals", href: "/deals", icon: Tag },
    { label: "Discounts", href: "/discounts", icon: Tag },
    { label: "Brands", href: "/brands", icon: Layers },
    { label: "Hosting", href: "/hosting", icon: Server },
    { label: "Compare", href: "/compare", icon: Scale },
    { label: "Guides", href: "/articles", icon: FileText },
  ];

  return (
    <>
      <header className="site-header" data-mega-open={megaOpen || undefined}>
        <div className="site-header-bar">
          <Logo size="md" />

          <nav aria-label="Main navigation" className="site-header-nav hidden md:flex">
            <button
              ref={megaButtonRef}
              type="button"
              className="site-header-link site-header-mega-trigger"
              aria-expanded={megaOpen}
              aria-controls={megaOpen ? "site-mega-menu" : undefined}
              onClick={() => { setMegaOpen(open => !open); setProfileDropdownOpen(false); }}
            >
              <span>Categories</span>
              <ChevronDown size={15} aria-hidden="true" className="site-header-chevron" />
            </button>
            {navLinks.map((link) => {
              const isActive = hydrated && (pathname === link.href || pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className="site-header-link"
                >
                  <span>{link.label}</span>
                  {isActive && <span aria-hidden="true" className="site-nav-marker" />}
                </Link>
              );
            })}
          </nav>

          <div className="site-header-actions hidden md:flex">
            <button
              onClick={() => { setMegaOpen(false); setSearchOpen(true); }}
              className="site-header-search"
              aria-label="Search deals and tools"
            >
              <Search size={16} aria-hidden="true" />
              <span className="site-header-search-text">Search brands &amp; deals</span>
              <kbd aria-hidden="true">⌘K</kbd>
            </button>

            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileDropdownOpen(open => !open); setMegaOpen(false); }}
                  className="site-header-avatar"
                  title={`Signed in as ${currentUser.name}`}
                  aria-label="Open account menu" aria-expanded={profileDropdownOpen}
                >
                  {currentUser.avatarLetter || "U"}
                </button>

                {profileDropdownOpen && (
                  <div className="site-header-dropdown">
                    <div className="site-header-dropdown-identity">
                      <strong>{currentUser.name}</strong>
                      <span>{currentUser.email}</span>
                    </div>
                    <Link href="/profile" onClick={() => setProfileDropdownOpen(false)}><User size={15} aria-hidden="true" /> Your account</Link>
                    <Link href="/submit" onClick={() => setProfileDropdownOpen(false)}><Tag size={15} aria-hidden="true" /> Add your brand</Link>
                    {currentUser.isAdmin && <Link href="/admin" onClick={() => setProfileDropdownOpen(false)}><ShieldCheck size={15} aria-hidden="true" /> Admin dashboard</Link>}
                    <button onClick={signOut} disabled={signingOut} className="site-header-dropdown-danger">
                      <LogOut size={15} aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            ) : accountsAvailable ? (
              <Link href="/login" className="site-contact-link">Sign in</Link>
            ) : (
              <Link href="/contact" className="site-contact-link">Contact</Link>
            )}

            <Link href="/submit" className="site-header-cta hidden lg:inline-flex">
              <span>Add your brand</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Search & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              className="site-header-control site-mobile-control"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(open => !open)}
              className="site-header-control site-mobile-control"
              aria-label="Toggle menu"
              aria-expanded={drawerOpen}
              aria-controls={drawerOpen ? "mobile-navigation" : undefined}
            >
              <Menu aria-hidden="true" className={cn("h-5 w-5 transition-[transform,opacity] duration-200", drawerOpen && "scale-75 opacity-0")} />
              <X aria-hidden="true" className={cn("absolute h-5 w-5 transition-[transform,opacity] duration-200", !drawerOpen && "scale-75 opacity-0")} />
            </button>
          </div>
        </div>
      </header>

      {megaOpen && (
        <div id="site-mega-menu" ref={megaPanelRef} className="site-mega" role="region" aria-label="Browse deals by category">
          <div className="site-mega-inner">
            <div className="site-mega-col site-mega-categories">
              <p className="site-mega-heading">Software categories</p>
              <ul>
                {categories.map(category => (
                  <li key={category.slug}>
                    <Link href={`/deals/category/${category.slug}`} prefetch={false} onClick={() => setMegaOpen(false)}>
                      <span>{category.name}</span>
                      {category.dealCount > 0 && <small>{category.dealCount}</small>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-mega-col">
              <p className="site-mega-heading">Ways to save</p>
              <ul className="site-mega-savings">
                {savingsLinks.map(({ href, label, description, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} prefetch={false} onClick={() => setMegaOpen(false)}>
                      <span className="site-mega-icon"><Icon size={16} aria-hidden="true" /></span>
                      <span><strong>{label}</strong><small>{description}</small></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-mega-feature">
              <p className="site-mega-heading">Every offer, sourced</p>
              <p>Each listing links to the provider or publisher page it came from, with the date we last checked it.</p>
              <Link href="/deals" prefetch={false} onClick={() => setMegaOpen(false)} className="market-button market-button-primary">Browse all deals <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/about#standards" prefetch={false} onClick={() => setMegaOpen(false)} className="site-mega-link">How we check offers <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {drawerOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            data-mobile-menu="open"
            className="site-mobile-drawer fixed inset-x-0 top-0 z-40 flex h-dvh flex-col gap-6 overflow-y-auto overscroll-contain px-5 pt-24 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden"
          >
            <div className="space-y-4">
              <div className="flex flex-col">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}
                      style={{ "--menu-index": index } as CSSProperties}
                      className="mobile-nav-link flex min-h-12 items-center justify-between border-b border-white/10 py-3 font-display text-xl font-semibold tracking-tight text-white transition-colors hover:text-[#C6FF3D] aria-[current=page]:text-[#C6FF3D]"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[#C6FF3D]" />
                        <span>{link.label}</span>
                      </div>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>

              <div>
                <p className="site-mega-heading">Ways to save</p>
                <ul className="site-mobile-savings">
                  {savingsLinks.map(({ href, label, icon: Icon }) => (
                    <li key={href}><Link href={href} prefetch={false} onClick={() => setMobileMenuOpen(false)}><Icon size={15} aria-hidden="true" /> {label}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)} className="market-button market-button-primary w-full justify-between">Add your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
                {currentUser ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between min-h-11 py-2 text-sm text-[#C6FF3D]"
                    >
                      <span>Your account</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                    <button
                      onClick={signOut}
                      disabled={signingOut}
                      className="w-full flex items-center justify-between min-h-11 py-2 text-sm text-rose-400 hover:text-rose-300 text-left"
                    >
                      <span className="flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> {signingOut ? "Signing out…" : "Sign out"}</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </button>
                  </>
                ) : accountsAvailable ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between min-h-11 py-2 text-sm text-zinc-300 hover:text-white"
                    >
                      <span>Sign in to SaaSFolio</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between min-h-11 py-2 text-sm text-zinc-400 hover:text-white"
                    >
                      <span>Create Free Account</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between min-h-11 py-2 text-sm text-zinc-300 hover:text-white">
                    <span>Contact SaaSFolio</span>
                    <ArrowUpRight className="h-4 w-4 text-[#C6FF3D]" />
                  </Link>
                )}
                {currentUser?.isAdmin && <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-11 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  <span>Admin dashboard</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>}
              </div>
            </div>


          </nav>
        )}

      {/* Global Command Palette */}
      {signOutError && <div role="alert" className="fixed bottom-5 left-4 right-4 z-[100] mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-rose-500/30 bg-[#140b0d] p-4 text-sm text-rose-200 shadow-xl">
        <p className="flex-1">{signOutError}</p>
        <button type="button" onClick={() => setSignOutError("")} aria-label="Dismiss sign-out error" className="p-1"><X className="h-4 w-4" /></button>
      </div>}
      {searchOpen && <CommandPalette isOpen onClose={() => setSearchOpen(false)} discountBrands={discountBrands} searchCatalog={searchCatalog} />}
    </>
  );
}
