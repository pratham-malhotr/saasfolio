import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import type { DetailedTool } from "@/lib/types";

export const organizationId = absoluteUrl("/#organization");
export const websiteId = absoluteUrl("/#website");

export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": organizationId, name: SITE_NAME, url: absoluteUrl(), description: SITE_DESCRIPTION },
      { "@type": "WebSite", "@id": websiteId, name: SITE_NAME, alternateName: "saasfolio.tech", url: absoluteUrl(), description: SITE_DESCRIPTION, inLanguage: "en", publisher: { "@id": organizationId } },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(name: string, description: string, path: string, type = "WebPage") {
  return {
    "@type": type, "@id": absoluteUrl(`${path}#webpage`), url: absoluteUrl(path), name, description,
    inLanguage: "en", isPartOf: { "@id": websiteId }, publisher: { "@id": organizationId },
  };
}

export function collectionSchema(name: string, description: string, path: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPageSchema(name, description, path, "CollectionPage"),
        mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map((item, index) => ({
          "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.path),
        })) },
      },
      breadcrumbSchema([{ name, path }]),
    ],
  };
}

export function softwareSchema(tool: DetailedTool) {
  // Catalog ratings have no verifiable review provenance and prices have no
  // explicit currency. Describe the subject as a generic entity until those
  // fields can meet Google's SoftwareApplication rich result requirements.
  return {
    "@type": "Thing", "@id": absoluteUrl(`/tools/${tool.slug}#software`),
    name: tool.name, description: tool.description, url: absoluteUrl(`/tools/${tool.slug}`),
  };
}
