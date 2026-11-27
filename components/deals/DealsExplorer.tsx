"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, RotateCcw, Search, SlidersHorizontal, Tag, X } from "lucide-react";
import { OfferAction } from "@/components/deals/OfferAction";
import { OfferCard, OFFER_TYPES } from "@/components/deals/OfferCard";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";
import { CATEGORIES } from "@/lib/catalog-categories";
import { useMediaQuery } from "@/lib/use-media-query";
import type { SaaSDeal } from "@/lib/types";
import "./deals-explorer.css";

const filterTypes = ["offer", "coupon", "lifetime", "free_trial", "free_plan"] as const;

interface DealsExplorerProps {
  initialDeals: SaaSDeal[];
  initialCategory?: string;
  initialType?: string;
  initialQuery?: string;
  heading?: string;
  description?: string;
  discountGuides?: ReactNode;
  afterResults?: ReactNode;
}

export function DealsExplorer({
  initialDeals,
  initialCategory = "all",
  initialType = "all",
  initialQuery = "",
  heading = "SaaS deals & software offers",
  description = "Browse sourced offers, reported coupon codes, free plans and trials.",
  discountGuides,
  afterResults,
}: DealsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "discount" | "expiring">("trending");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [modalDeal, setModalDeal] = useState<SaaSDeal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filterToggle = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const filtersId = useId();
  const priceId = useId();
  const typeLabel = Object.hasOwn(OFFER_TYPES, selectedType) ? OFFER_TYPES[selectedType as SaaSDeal["dealType"]] : selectedType;
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deal of initialDeals) counts.set(deal.categorySlug, (counts.get(deal.categorySlug) || 0) + 1);
    return CATEGORIES.map(category => ({ ...category, count: counts.get(category.slug) || 0 }));
  }, [initialDeals]);
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deal of initialDeals) counts.set(deal.dealType, (counts.get(deal.dealType) || 0) + 1);
    return counts;
  }, [initialDeals]);
  const categoryLabel = categories.find(category => category.slug === selectedCategory)?.name || selectedCategory;

  const filteredDeals = useMemo(() => {
    return initialDeals
      .filter((deal) => {
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          const tokens = q.split(/\s+/).filter(Boolean);
          const intentWords = ["reveal", "coupon", "code", "voucher", "promo", "discount", "deal"];
          const hasIntent = tokens.some((t) => intentWords.includes(t));
          const coreTokens = tokens.filter((t) => !intentWords.includes(t));

          const searchTarget = `${deal.toolName} ${deal.toolSlug} ${deal.title} ${deal.description} ${deal.code || ""} ${deal.category}`.toLowerCase();

          if (coreTokens.length > 0) {
            const matchesCore = coreTokens.every((t) => searchTarget.includes(t));
            if (!matchesCore) return false;
          } else if (hasIntent) {
            if (deal.dealType !== "coupon" && !deal.code) return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all") {
          if (deal.categorySlug !== selectedCategory && deal.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Deal type filter
        if (selectedType !== "all") {
          if (deal.dealType !== selectedType) return false;
        }

        // Discount % filter
        if (deal.discountPercentage < minDiscount) return false;

        // Max price filter
        if (deal.dealPrice !== undefined && deal.dealPrice > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (q.includes("coupon") || q.includes("reveal") || q.includes("code")) {
            const aIsCoupon = a.dealType === "coupon" || Boolean(a.code);
            const bIsCoupon = b.dealType === "coupon" || Boolean(b.code);
            if (aIsCoupon && !bIsCoupon) return -1;
            if (!aIsCoupon && bIsCoupon) return 1;
          }
        }
        if (sortBy === "trending") return (b.revealsCount || 0) - (a.revealsCount || 0);
        if (sortBy === "discount") return b.discountPercentage - a.discountPercentage;
        if (sortBy === "expiring") {
          return (Date.parse(a.expiryDate) || Infinity) - (Date.parse(b.expiryDate) || Infinity) || 0;
        }
        return (Date.parse(b.checkedAt || "") || 0) - (Date.parse(a.checkedAt || "") || 0);
      });
  }, [initialDeals, searchQuery, selectedCategory, selectedType, minDiscount, maxPrice, sortBy]);

  const previousResults = useRef(filteredDeals);
  useEffect(() => {
    const previous = previousResults.current;
    previousResults.current = filteredDeals;
    if (reducedMotion || !resultsRef.current || !Element.prototype.animate ||
      (previous.length === filteredDeals.length && previous.every((deal, index) => deal.id === filteredDeals[index].id))) return;

    const bounds = resultsRef.current.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top >= window.innerHeight) return;

    const candidates = Array.from(resultsRef.current.querySelectorAll(".market-offer-grid > .market-offer-card, .deals-empty")).slice(0, 6);
    const visible = candidates.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0 && !element.contains(document.activeElement);
    });
    const animations = visible.map((element, index) => element.animate([{ opacity: .76 }, { opacity: 1 }], {
      id: "deal-results-update",
      duration: 240,
      delay: index * 24,
      easing: "ease-out",
      fill: "backwards",
    }));
    return () => animations.forEach(animation => animation.cancel());
  }, [filteredDeals, reducedMotion]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setMinDiscount(0);
    setMaxPrice(500);
    setSortBy("trending");
  };

  const activeFilters = [
    ...(selectedCategory === "all" ? [] : [{ label: categoryLabel, clear: () => setSelectedCategory("all") }]),
    ...(selectedType === "all" ? [] : [{ label: typeLabel, clear: () => setSelectedType("all") }]),
    ...(minDiscount === 0 ? [] : [{ label: `${minDiscount}% off or more`, clear: () => setMinDiscount(0) }]),
    ...(maxPrice === 500 ? [] : [{ label: `Up to $${maxPrice}`, clear: () => setMaxPrice(500) }]),
  ];
  const canReset = Boolean(activeFilters.length || searchQuery || sortBy !== "trending");

  return (
    <div className="market-page deals-explorer">
      <header className="market-intro market-intro-compact">
        <div className="market-shell market-intro-inner">
          <div>
            <p className="market-eyebrow"><Tag size={14} aria-hidden="true" /> Software savings</p>
            <h1>{heading}</h1>
            <p>{description}</p>
          </div>
          <Link href="/discounts" className="market-button market-button-secondary">Discounts by brand <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </header>

      <div className="market-shell deals-workspace">
        <div className="deals-toolbar">
          <div role="search" className="deals-search">
            <Search size={19} aria-hidden="true" />
            <input ref={searchInput} type="search" aria-label="Search software offers" value={searchQuery} maxLength={100}
              onChange={event => setSearchQuery(event.target.value)} placeholder="Search offers by brand or keyword" />
            {searchQuery && <button type="button" onClick={() => { setSearchQuery(""); searchInput.current?.focus(); }} aria-label="Clear search"><X size={18} aria-hidden="true" /></button>}
          </div>
          <div className="deals-toolbar-actions">
            <button ref={filterToggle} type="button" className="market-button market-button-secondary deals-mobile-toggle"
              aria-expanded={mobileFilterOpen} aria-controls={filtersId} onClick={() => setMobileFilterOpen(open => !open)}>
              <SlidersHorizontal size={17} aria-hidden="true" /> Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}
            </button>
            <label className="deals-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)}>
                <option value="trending">Recommended</option>
                <option value="discount">Biggest discount</option>
                <option value="expiring">Expiring soon</option>
                <option value="newest">Recently checked</option>
              </select>
            </label>
          </div>
        </div>

        <div className="deals-layout">
          <aside id={filtersId} className="deals-filters" data-open={mobileFilterOpen || undefined} aria-label="Filter software offers">
            <div className="deals-filter-heading"><h2><SlidersHorizontal size={17} aria-hidden="true" /> Filters</h2>
              {canReset && <button type="button" onClick={resetFilters}>Reset</button>}
            </div>
            <fieldset>
              <legend>Category</legend>
              <div className="deals-category-filter">
                <button type="button" aria-pressed={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
                  <span>All categories</span><small>{initialDeals.length}</small>
                </button>
                {categories.map(category => (
                  <button key={category.slug} type="button" aria-pressed={selectedCategory === category.slug} onClick={() => setSelectedCategory(category.slug)}>
                    <span>{category.name}</span><small>{category.count}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Minimum discount</legend>
              <div className="deals-minimum-discount">
                {[0, 30, 50, 75].map(percent => (
                  <button key={percent} type="button" aria-pressed={minDiscount === percent} onClick={() => setMinDiscount(percent)}>
                    {percent === 0 ? "Any" : `${percent}%`}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="deals-price">
              <label htmlFor={priceId}>Maximum listed price <span>${maxPrice}</span></label>
              <input id={priceId} type="range" min="0" max="500" step="25" value={maxPrice}
                onChange={event => setMaxPrice(Number(event.target.value))} aria-valuetext={`$${maxPrice}`} />
            </div>
            <button type="button" className="market-button market-button-primary deals-apply-mobile"
              onClick={() => { setMobileFilterOpen(false); filterToggle.current?.focus(); }}>
              Show {filteredDeals.length} {filteredDeals.length === 1 ? "offer" : "offers"} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </aside>

          <section ref={resultsRef} aria-labelledby="deals-results-heading" className="deals-results">
            <div className="deals-type-tabs" role="group" aria-label="Offer type">
              {(["all", ...filterTypes] as const).map(value => {
                const count = value === "all" ? initialDeals.length : typeCounts.get(value) || 0;
                if (!count && selectedType !== value) return null;
                return (
                  <button key={value} type="button" aria-pressed={selectedType === value} onClick={() => setSelectedType(value)}>
                    {value === "all" ? "All offers" : OFFER_TYPES[value]}
                    <small>{count}</small>
                  </button>
                );
              })}
            </div>
            <div className="deals-results-head">
              <h2 id="deals-results-heading" aria-live="polite"><span key={filteredDeals.length}>{filteredDeals.length} {filteredDeals.length === 1 ? "offer" : "offers"}</span></h2>
              <Link href="/submit/offer">Submit an offer <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            {activeFilters.length > 0 && (
              <ul className="deals-active" aria-label="Active filters">
                {activeFilters.map(({ label, clear }) => <li key={label}><button type="button" onClick={clear} aria-label={`Remove ${label} filter`}>{label}<X size={15} aria-hidden="true" /></button></li>)}
              </ul>
            )}
            {filteredDeals.length ? (
              <div className="market-offer-grid">
                {filteredDeals.map(deal => <OfferCard key={deal.id} deal={deal} action={
                  <OfferAction deal={deal} onReveal={offer => { setModalDeal(offer); setModalOpen(true); }}
                    className="market-button market-button-primary" icon={deal.code ? <Tag size={15} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />} />
                } />)}
              </div>
            ) : (
              <div className="deals-empty">
                <Search size={25} aria-hidden="true" />
                <h3>{canReset ? "No matching offers" : "No offers currently listed"}</h3>
                <p>{canReset ? "Try another keyword or clear your filters to see more offers." : "Browse brand guides for pricing, eligibility, and other ways to save."}</p>
                <div>
                  {canReset && <button type="button" onClick={resetFilters} className="market-button market-button-primary"><RotateCcw size={16} aria-hidden="true" /> Clear filters</button>}
                  <Link href={searchQuery.trim() ? { pathname: "/brands", query: { q: searchQuery.trim() } } : "/discounts"} className="market-button market-button-secondary">
                    {searchQuery.trim() ? "Search software brands" : "Browse brand discounts"} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        {discountGuides}
        {afterResults}
      </div>

      <CouponRevealModal deal={modalDeal} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
