import type { DetailedArticle } from "./articles-data";
import { hostingCoverPhotos, type HostingCoverPhoto } from "./research-photography";

export type ResearchGuide = {
  slug: string; title: string; summary: string; audience: string;
  image: HostingCoverPhoto; category: DetailedArticle["category"];
  tags: string[]; providers: string[]; sections: [string, string][];
  headers: string[]; rows: [string, string, string][];
  faqs: [string, string][]; sources: [string, string][]; related: string[];
};

const sectionIds = ["recommendation", "architecture", "requirements", "operating-details", "budget-and-boundaries", "acceptance-criteria", "worked-example", "decision-record", "common-mistake"];
export function buildHostingArticles(research: ResearchGuide[]): DetailedArticle[] {
  return research.map((guide, index) => {
    const sections = guide.sections.map(([heading, content], i) => ({ id: sectionIds[i], heading, content,
      ...(i === guide.sections.length - 1 ? { links: [{ label: "Build a hosting shortlist", href: "/hosting#finder" }, { label: "Compare the complete hosting budget", href: "/hosting#cost-calculator" }, ...guide.related.slice(0, 2).map(slug => ({ label: research.find(other => other.slug === slug)?.title || "Continue with a related hosting guide", href: `/articles/${slug}` }))] } : {}),
    }));
    return {
      id: `hosting-${guide.slug}`, slug: guide.slug, title: guide.title, subtitle: guide.audience, summary: guide.summary,
      category: guide.category, publishedAt: "2026-11-17", updatedAt: "2026-11-17", featured: index === 0,
      author: { name: "SaaSFolio editorial", role: "Hosting research & application operations", avatarLetter: "S", bio: "Original documentation-based buying guidance with explicit reader profiles, decision criteria, proposed acceptance tests and linked primary sources. Examples are illustrative rather than reported customer results." },
      coverAccent: "#C6FF3D", coverImage: hostingCoverPhotos[guide.image],
      providerSlugs: guide.providers, tags: guide.tags, sections,
      readTime: `${Math.ceil(sections.reduce((total, section) => total + section.content.split(/\s+/).length, 0) / 190)} min read`,
      tableOfContents: sections.map(section => ({ id: section.id, title: section.heading })),
      comparisonTable: { headers: guide.headers, rows: guide.rows.map(([feature, ...values]) => ({ feature, values })) },
      faqs: guide.faqs.map(([question, answer]) => ({ question, answer })), sources: guide.sources.map(([title, url]) => ({ title, url })), relatedArticlesSlugs: guide.related,
    };
  });
}
