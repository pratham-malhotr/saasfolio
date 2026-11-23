"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { BrandDirectoryEntry } from "@/lib/brand-directory";
import { CATEGORIES } from "@/lib/catalog-categories";

const alphabet = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function BrandCard({ brand }: { brand: BrandDirectoryEntry }) {
  const profile = `/tools/${brand.slug}`;
  const offerStatus = brand.codeCount
    ? `${brand.codeCount} recorded coupon ${brand.codeCount === 1 ? "code" : "codes"} · not checkout tested`
    : brand.hasFreeOption ? "Free plan or trial recorded · check terms"
      : brand.hasOffer ? "Sourced offer recorded · check eligibility" : "No current coupon recorded";
  return (
    <li data-brand={brand.slug} data-sponsored={brand.sponsored || undefined} className="brand-card">
      <div className="brand-card-top">
        <span className="brand-monogram" aria-hidden="true">{brand.name.slice(0, 1).toUpperCase()}</span>
        {brand.sponsored && <span className="brand-sponsor-label">Sponsored</span>}
      </div>
      <h3>
        {brand.submitted
          ? <a href={brand.website} rel={brand.sponsored ? "sponsored nofollow" : "ugc nofollow"}>{brand.name} <ArrowUpRight size={16} aria-hidden="true" /></a>
          : <Link href={profile}>{brand.name} <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </h3>
      <p className="brand-card-meta">{brand.category} · {brand.pricingModel}</p>
      <p className="brand-card-description line-clamp-3">{brand.description}</p>
      <div className="brand-card-bottom">
        <p>{brand.submitted ? "Brand-submitted information" : offerStatus}</p>
        {!brand.submitted && brand.hasGuide && <Link prefetch={false} href={`/discounts/${brand.slug}`} className="brand-text-link">{brand.name} discounts & coupon guide <ArrowUpRight size={14} aria-hidden="true" /></Link>}
      </div>
    </li>
  );
}

export function BrandDirectory({ brands, initialQuery = "", initialCategory = "all" }: { brands: BrandDirectoryEntry[]; initialQuery?: string; initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(CATEGORIES.some(item => item.slug === initialCategory) ? initialCategory : "all");
  const [letter, setLetter] = useState("all");
  const [kind, setKind] = useState("all");
  const visible = useMemo(() => {
    const term = query.toLowerCase().trim();
    return brands.filter(brand =>
      (category === "all" || brand.categorySlug === category) &&
      (letter === "all" || brand.letter === letter) &&
      (!term || `${brand.name} ${brand.slug} ${brand.category} ${brand.description}`.toLowerCase().includes(term)) &&
      (kind === "all" || kind === "codes" && brand.codeCount > 0 || kind === "free" && brand.hasFreeOption || kind === "guides" && brand.hasGuide));
  }, [brands, query, category, letter, kind]);
  const sponsored = visible.filter(brand => brand.sponsored);

  return (
    <div className="brand-directory">
      <div className="brand-filters">
        <label htmlFor="brand-search" className="brand-filter-search">
          <span>Find a brand</span>
          <span className="brand-search">
            <Search size={18} aria-hidden="true" />
            <input id="brand-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, category, or keyword" />
          </span>
        </label>
        <label htmlFor="directory-category">
          <span>Category</span>
          <select id="directory-category" value={category} onChange={event => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label htmlFor="brand-kind">
          <span>Availability</span>
          <select id="brand-kind" value={kind} onChange={event => setKind(event.target.value)}>
            <option value="all">All listed brands</option>
            <option value="codes">Recorded coupon codes</option>
            <option value="free">Free plans or trials</option>
            <option value="guides">Brand savings guides</option>
          </select>
        </label>
      </div>

      <div role="group" aria-label="Filter brands by first letter" className="brand-alphabet">
        {["all", ...alphabet].map(value => <button key={value} type="button" aria-pressed={letter === value} aria-controls="brand-directory-results" onClick={() => setLetter(value)}>{value === "all" ? "All letters" : value}</button>)}
      </div>
      <div className="brand-result-meta">
        <p role="status">Showing <strong>{visible.length}</strong> of {brands.length} brands</p>
        {(query || category !== "all" || letter !== "all" || kind !== "all") && <button type="button" className="brand-text-link" onClick={() => { setQuery(""); setCategory("all"); setLetter("all"); setKind("all"); }}>Clear filters</button>}
      </div>

      <div id="brand-directory-results">
        {sponsored.length > 0 && <section aria-labelledby="sponsored-brands" className="brand-group brand-sponsored">
          <h2 id="sponsored-brands">Sponsored brands</h2>
          <ul className="brand-grid">{sponsored.map(brand => <BrandCard key={brand.slug} brand={brand} />)}</ul>
        </section>}
        {alphabet.map(initial => {
          const group = visible.filter(brand => !brand.sponsored && brand.letter === initial);
          if (!group.length) return null;
          const heading = `letter-${initial === "#" ? "numbers" : initial}`;
          return <section key={initial} aria-labelledby={heading} className="brand-group">
            <h2 id={heading}>{initial === "#" ? "Numbers & symbols" : initial}</h2>
            <ul className="brand-grid">{group.map(brand => <BrandCard key={brand.slug} brand={brand} />)}</ul>
          </section>;
        })}
        {!visible.length && <p className="brand-empty">No brands match these filters. Try a different keyword, clear the filters, or <Link href="/submit">suggest a brand</Link>.</p>}
      </div>
    </div>
  );
}
