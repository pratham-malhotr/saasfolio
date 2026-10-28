export interface ArticleSection {
  id: string;
  heading: string;
  content: string; // Markdown or rich HTML-friendly text
  links?: { label: string; href: string }[];
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  dealCalloutSlug?: string; // Slugs matching deals in deals-data.ts
}

export type ArticlePreview = Pick<DetailedArticle, "id" | "slug" | "title" | "summary" | "category" | "readTime" | "author" | "tags" | "featured">;

export interface DetailedArticle {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  category: "Guides & Stacks" | "Comparisons" | "Case Studies" | "Tool Roundups";
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatarLetter: string;
    bio: string;
    twitter?: string;
    github?: string;
  };
  featured?: boolean;
  coverAccent: string;
  tags: string[];
  tableOfContents: { id: string; title: string }[];
  sections: ArticleSection[];
  prosCons?: {
    toolName: string;
    pros: string[];
    cons: string[];
  };
  comparisonTable?: {
    headers: string[];
    rows: { feature: string; values: string[] }[];
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
  sources?: { title: string; url: string }[];
  relatedArticlesSlugs: string[];
}

export { EDITORIAL_ARTICLES as DETAILED_ARTICLES } from "./editorial-articles";
import { EDITORIAL_ARTICLES } from "./editorial-articles";
import { ARTICLE_ALIASES } from "./article-aliases.mjs";

export function getArticleBySlug(slug: string) {
  const canonical = Object.hasOwn(ARTICLE_ALIASES, slug) ? (ARTICLE_ALIASES as Record<string, string>)[slug] : slug;
  return EDITORIAL_ARTICLES.find(article => article.slug === canonical);
}
