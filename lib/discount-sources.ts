import registry from "@/lib/data/discount-source-registry.json";

// The collector and profile research links share exact provider/brand identities.
export const DISCOUNT_SOURCES = registry.reduce<Record<string, { name: string; url: string }[]>>((sources, entry) => {
  (sources[entry.toolSlug] ||= []).push({ name: entry.name, url: entry.url });
  return sources;
}, {});
