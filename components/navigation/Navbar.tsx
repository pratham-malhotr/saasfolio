"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowUpRight, Sparkles, Tag, Layers, FileText, Users, User, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { CommandPalette } from "@/components/modals/CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("saasfolio_current_user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch (e) {}
    };

    loadUser();
    window.addEventListener("saasfolio_auth_changed", loadUser);
    return () => window.removeEventListener("saasfolio_auth_changed", loadUser);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detect if user has scrolled beyond top buffer
      if (currentScrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Deals", href: "/deals", icon: Tag, badge: "HOT" },
    { label: "Tools Directory", href: "/tools", icon: Layers },
    { label: "Reviews & Guides", href: "/articles", icon: FileText },
    { label: "Community", href: "/community", icon: Users },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled
            ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0A0A0C]/80 border border-white/[0.08] px-3 py-1.5 rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                    isActive
                      ? "text-[#C6FF3D] font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#C6FF3D]/15 text-[#C6FF3D] border border-[#C6FF3D]/30 font-bold">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full border border-[#C6FF3D]/40 bg-[#C6FF3D]/10 -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/[0.08] transition-all text-xs text-zinc-400 hover:text-white"
              aria-label="Search deals and tools"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-sans pr-2">Search...</span>
              <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                ⌘K
              </kbd>
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C6FF3D] to-[#80B814] text-black font-display font-black text-xs flex items-center justify-center border border-[#C6FF3D] shadow-[0_0_12px_rgba(198,255,61,0.3)] transition-transform hover:scale-105"
                  title={`Signed in as @${currentUser.username}`}
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
                        @{currentUser.username}
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Member Passport</span>
                    </Link>

                    <Link
                      href="/submit"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Submit Tool / Deal</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-[#C6FF3D] hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Control</span>
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("saasfolio_current_user");
                        setCurrentUser(null);
                        setProfileDropdownOpen(false);
                        window.dispatchEvent(new Event("saasfolio_auth_changed"));
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Glowing CTA */}
            <Link href="/deals">
              <MagneticButton
                variant="primary"
                size="sm"
                className="font-bold tracking-tight text-xs flex items-center gap-1"
              >
                <span>Get Deals</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </MagneticButton>
            </Link>
          </div>

          {/* Mobile Search & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-between pt-24 pb-8 px-6 md:hidden"
          >
            <div className="space-y-4">
              <div className="font-mono text-xs uppercase tracking-widest text-[#8E8E93] pb-2 border-b border-white/10">
                DISCOVER SOFTWARE & DISCOUNTS
              </div>
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-xl font-bold tracking-tight text-white border-b border-white/5 hover:text-[#C6FF3D] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[#C6FF3D]" />
                        <span>{link.label}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 space-y-2 border-t border-white/10">
                {currentUser ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-[#C6FF3D]"
                  >
                    <span>Member Passport (@{currentUser.username})</span>
                    <span className="font-mono text-xs">VIEW →</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-zinc-300 hover:text-white"
                  >
                    <span>Sign In to SaaSFolio</span>
                    <span className="font-mono text-xs text-[#C6FF3D]">LOGIN →</span>
                  </Link>
                )}
                <Link
                  href="/submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm text-zinc-400 hover:text-white"
                >
                  <span>Submit a Tool / Deal</span>
                  <span className="font-mono text-xs text-[#C6FF3D]">SUBMIT →</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm text-zinc-400 hover:text-white"
                >
                  <span>Admin Mission Control</span>
                  <span className="font-mono text-xs text-[#C6FF3D]">ADMIN →</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/deals"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#C6FF3D] text-black font-bold text-base shadow-[0_0_25px_rgba(198,255,61,0.4)]"
              >
                <span>Browse All 1,200+ Deals</span>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
              <div className="font-mono text-center text-[10px] text-zinc-500 uppercase tracking-widest">
                SAASFOLIO // DISCOVER ✦ SAVE ✦ SCALE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
