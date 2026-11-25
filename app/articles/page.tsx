import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import React from "react";
import { ArticlesHubClient } from "@/components/articles/ArticlesHubClient";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";
import Link from "next/link";

const title = "Software Buying Guides, Reviews & Comparisons";
const description = "Read software reviews and buying guides for AI code review, monitoring, newsletters, WordPress and web hosting. Compare plan limits and trade-offs.";
export const metadata = pageMetadata({ title, description, path: "/articles" });

const readingTopics = [
  { heading: "Software reviews for engineering teams", slugs: ["coderabbit-review-github-pull-requests", "checkly-review-api-playwright-monitoring", "supabase-review-multi-tenant-saas", "baserow-review-postgresql-operations"] },
  { heading: "Software reviews for publishers and service teams", slugs: ["fireflies-ai-review-client-meetings", "buttondown-review-paid-newsletter", "fluent-forms-review-wordpress-leads"] },
  { heading: "LinkedIn tools and newsletter platforms", slugs: ["taplio-pricing-starter-vs-growth-vs-pro", "taplio-vs-authoredup", "beehiiv-vs-kit-newsletter"] },
  { heading: "Course launches and video podcasts", slugs: ["systeme-io-free-plan-limits", "streamyard-vs-riverside-video-podcast"] },
  { heading: "VPS, WordPress and hosting renewal costs", slugs: ["hetzner-vs-digitalocean-small-business-vps", "hostinger-vps-vs-managed-wordpress-solo-blogger", "hosting-introductory-discount-vs-renewal-cost"] },
  { heading: "SaaS budgets, trial checklists and plan limits", slugs: ["build-a-saas-budget-before-buying", "evaluate-ai-software-free-trials", "compare-saas-pricing-limits"] },
];

export default function ArticlesPage() {
  const articles = [...DETAILED_ARTICLES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ id, slug, title, summary, category, readTime, author, tags, featured, coverImage }) => ({ id, slug, title, summary, category, readTime, author, tags, featured, coverImage }));
  const articleTitles = new Map(articles.map(article => [article.slug, article.title]));
  return <>
    <JsonLd data={collectionSchema(title, description, "/articles", articles.map(article => ({ name: article.title, path: `/articles/${article.slug}` })))} />
    <ArticlesHubClient articles={articles} savingsLinks={<div className="space-y-8">
      <nav aria-label="Software buying guides by topic" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {readingTopics.map(topic => (
          <section key={topic.heading} className="rounded-2xl border border-white/10 bg-[#101416] p-5">
            <h2 className="font-display text-lg font-semibold text-white">{topic.heading}</h2>
            <ul className="mt-3 space-y-2">
              {topic.slugs.map(slug => <li key={slug}><Link prefetch={false} href={`/articles/${slug}`} className="inline-block py-1.5 text-sm leading-relaxed text-[#C6FF3D] underline underline-offset-4">{articleTitles.get(slug)}</Link></li>)}
            </ul>
          </section>
        ))}
      </nav>
      <SavingsCollectionLinks heading="Put the buying guide into practice" />
    </div>} />
  </>;
}
