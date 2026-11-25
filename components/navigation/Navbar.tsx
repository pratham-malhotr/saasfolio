"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import type { PublicSearchCatalog } from "@/lib/search-catalog-types";
import { Search, Menu, X, ArrowUpRight, Tag, Layers, FileText, User, LogOut, ShieldCheck, Scale } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchLoading } from "@/components/modals/SearchLoading";
import { motion, AnimatePresence } from "framer-motion";
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

export function Navbar({ discountBrands, searchCatalog, accountsAvailable }: { discountBrands: DiscountSearchEntry[]; searchCatalog: PublicSearchCatalog; accountsAvailable: boolean }) {
  const pathname = usePathname();
  // A route can change while this shared layout is still hydrating. Keep the
  // initial link markup stable, then decorate the current route after hydration.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const compact = useMediaQuery("(width < 768px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const drawerOpen = mobileMenuOpen && compact;
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatarLetter: string; isAdmin: boolean } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
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
    const frame = requestAnimationFrame(() => setMobileMenuOpen(false));
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

  const navLinks = [
    { label: "Deals", href: "/deals", icon: Tag },
    { label: "Discounts", href: "/discounts", icon: Tag },
    { label: "Brands", href: "/brands", icon: Layers },
    { label: "Hosting", href: "/hosting", icon: Layers },
    { label: "Compare", href: "/compare", icon: Scale },
    { label: "Guides", href: "/articles", icon: FileText },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-bar">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="site-header-nav hidden md:flex">
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
                  {isActive && <motion.span aria-hidden="true" className="site-nav-marker"
                    initial={false} layoutId={reducedMotion ? undefined : "site-nav-marker"}
                    transition={{ duration: .24, ease: [0.22, 1, 0.36, 1] }} />}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="site-header-actions hidden md:flex">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="site-header-control"
              aria-label="Search deals and tools"
            >
              <Search size={17} aria-hidden="true" />
              <span className="hidden xl:inline">Search</span>
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C6FF3D] to-[#80B814] text-black font-display font-black text-xs flex items-center justify-center border border-[#C6FF3D] shadow-[0_0_12px_rgba(198,255,61,0.3)] transition-transform hover:scale-105"
                  title={`Signed in as ${currentUser.name}`}
                  aria-label="Open account menu" aria-expanded={profileDropdownOpen}
                >
                  {currentUser.avatarLetter || "U"}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#0B0B0E] border border-white/10 shadow-2xl z-50 animate-in fade-in space-y-1 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <div className="font-display font-bold text-sm text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        {currentUser.email}
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Your account</span>
                    </Link>

                    <Link
                      href="/submit"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Add your brand</span>
                    </Link>

                    {currentUser.isAdmin && <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin dashboard</span>
                    </Link>}

                    <button
                      onClick={signOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : accountsAvailable ? (
              <Link
                href="/login"
                className="site-contact-link"
              >
                Sign in
              </Link>
            ) : (
              <Link href="/contact" className="site-contact-link">
                Contact
              </Link>
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

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            data-mobile-menu="open"
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
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

              <div className="space-y-2">
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)} className="market-button market-button-secondary w-full justify-between">Add your brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
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


          </motion.nav>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      {signOutError && <div role="alert" className="fixed bottom-5 left-4 right-4 z-[100] mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-rose-500/30 bg-[#140b0d] p-4 text-sm text-rose-200 shadow-xl">
        <p className="flex-1">{signOutError}</p>
        <button type="button" onClick={() => setSignOutError("")} aria-label="Dismiss sign-out error" className="p-1"><X className="h-4 w-4" /></button>
      </div>}
      {searchOpen && <CommandPalette isOpen onClose={() => setSearchOpen(false)} discountBrands={discountBrands} searchCatalog={searchCatalog} />}
    </>
  );
}
