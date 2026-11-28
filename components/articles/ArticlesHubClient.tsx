"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, RotateCcw, Search, X } from "lucide-react";
import type { ArticlePreview } from "@/lib/data/articles-data";
import "./articles-hub.css";

const CATEGORIES = ["All", "Comparisons", "Software Reviews", "Guides & Stacks", "Hosting", "Case Studies", "Tool Roundups"] as const;
type Category = typeof CATEGORIES[number];

const inCategory = (article: ArticlePreview, category: Category) =>
  category === "All" || (category === "Hosting" ? article.tags.includes("Hosting") : article.category === category);

function Cover({ article, sizes, priority = false }: { article: ArticlePreview; sizes: string; priority?: boolean }) {
  return (
    <div className="guides-cover" aria-hidden="true">
      {article.coverImage
        ? <Image src={article.coverImage.src} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
        : <BookOpen size={28} />}
    </div>
  );
}

export function ArticlesHubClient({ articles, savingsLinks }: { articles: ArticlePreview[]; savingsLinks?: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();

  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(category => [category, articles.filter(article => inCategory(article, category)).length])) as Record<Category, number>, [articles]);
  const filteredArticles = articles.filter(article => inCategory(article, selectedCategory) && (!query ||
    article.title.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query) || article.tags.some(tag => tag.toLowerCase().includes(query))));

  const browsing = selectedCategory === "All" && !query;
  const featuredLead = articles.find(article => article.featured) || articles[0];
  const latest = articles.filter(article => article.id !== featuredLead?.id).slice(0, 5);
  const shownInTop = new Set([featuredLead?.id, ...latest.map(article => article.id)]);
  const listArticles = browsing ? filteredArticles.filter(article => !shownInTop.has(article.id)) : filteredArticles;
  const reset = () => { setSelectedCategory("All"); setSearchQuery(""); };

  return (
    <div className="market-page guides-hub">
      <header className="market-intro market-intro-compact">
        <div className="market-shell market-intro-inner">
          <div>
            <p className="market-eyebrow"><BookOpen size={14} aria-hidden="true" /> Sourced buying guides</p>
            <h1>Software buying guides</h1>
            <p>Reviews, pricing comparisons and buying checklists built from official pricing pages, with every source linked and dated.</p>
          </div>
          <dl className="guides-stats">
            <div><dt>Guides</dt><dd>{articles.length}</dd></div>
            <div><dt>Comparisons</dt><dd>{counts.Comparisons}</dd></div>
            <div><dt>Reviews</dt><dd>{counts["Software Reviews"]}</dd></div>
          </dl>
        </div>
      </header>

      <div className="market-shell guides-body">
        {browsing && featuredLead && (
          <section className="guides-top" aria-labelledby="guides-featured-heading">
            <h2 id="guides-featured-heading" className="sr-only">Featured and latest guides</h2>
            <Link href={`/articles/${featuredLead.slug}`} className="guides-featured">
              <Cover article={featuredLead} sizes="(max-width: 960px) 100vw, 760px" priority />
              <div className="guides-featured-copy">
                <p className="guides-meta"><span className="market-badge market-badge-verified">Featured</span><span>{featuredLead.category}</span><span><Clock size={13} aria-hidden="true" /> {featuredLead.readTime}</span></p>
                <h3>{featuredLead.title}</h3>
                <p>{featuredLead.summary}</p>
                <span className="guides-read">Read the guide <ArrowRight size={16} aria-hidden="true" /></span>
              </div>
            </Link>
            <div className="guides-latest">
              <p className="market-kicker">Latest</p>
              <ul>
                {latest.map(article => (
                  <li key={article.id}>
                    <Link href={`/articles/${article.slug}`}>
                      <span className="guides-latest-cover"><Cover article={article} sizes="120px" /></span>
                      <span>
                        <small>{article.category} · {article.readTime}</small>
                        <strong>{article.title}</strong>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <div className="guides-toolbar">
          <div className="guides-tabs" role="group" aria-label="Filter guides by category">
            {CATEGORIES.filter(category => counts[category] > 0).map(category => (
              <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                {category === "All" ? "All guides" : category}<small>{counts[category]}</small>
              </button>
            ))}
          </div>
          <label className="guides-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search guides</span>
            <input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search guides, brands or tags" maxLength={100} />
            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear guide search"><X size={15} aria-hidden="true" /></button>}
          </label>
        </div>

        <section aria-labelledby="guides-list-heading">
          <h2 id="guides-list-heading" className="guides-list-heading" aria-live="polite">
            {browsing ? "More guides" : `${filteredArticles.length} ${filteredArticles.length === 1 ? "guide" : "guides"}`}
          </h2>
          {listArticles.length > 0 && (
            <div className="guides-grid">
              {listArticles.map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="guides-card motion-card">
                  <Cover article={article} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" />
                  <div className="guides-card-copy">
                    <p className="guides-meta"><span>{article.category}</span><span><Clock size={13} aria-hidden="true" /> {article.readTime}</span></p>
                    <h3>{article.title}</h3>
                    <p>{article.summary}</p>
                    <span className="guides-read">Read guide <ArrowRight size={15} aria-hidden="true" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {filteredArticles.length === 0 && (
            <div className="guides-empty">
              <Search size={24} aria-hidden="true" />
              <h3>No matching guides</h3>
              <p>Try another brand or keyword, or browse all guides.</p>
              <button type="button" onClick={reset} className="market-button market-button-secondary"><RotateCcw size={15} aria-hidden="true" /> Show all guides</button>
            </div>
          )}
        </section>

        {savingsLinks && <div className="guides-more">{savingsLinks}</div>}
      </div>
    </div>
  );
}
