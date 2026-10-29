import source from "@/lib/data/managed-public-index.json";
import { managedBrand, managedOffer, validateManagedCatalog } from "@/lib/managed-catalog.mjs";
import type { DetailedTool } from "@/lib/types";
import type { ManagedCatalog } from "@/lib/managed-catalog-types";

export const MANAGED_CATALOG = validateManagedCatalog(source) as ManagedCatalog;
export const MANAGED_BRANDS = MANAGED_CATALOG.entries.filter(entry => entry.kind === "brand").map(managedBrand) as DetailedTool[];
export const MANAGED_OFFERS = MANAGED_CATALOG.entries.filter(entry => entry.kind === "offer" && !entry.retired).map(entry => ({ ...managedOffer(entry), managedRevision: entry.revision }));
export const MANAGED_OFFER_IDENTITIES = Object.fromEntries(MANAGED_CATALOG.entries.filter(entry => entry.kind === "offer").flatMap(entry => [[entry.slug, entry.payload.toolSlug], [`deal-${entry.slug}`, entry.payload.toolSlug]])) as Record<string, string>;
export const RETIRED_MANAGED_GUIDES = new Set<string>(source.retiredGuideSlugs);
export const RETIRED_MANAGED_OFFERS = new Set(MANAGED_CATALOG.entries.filter(entry => entry.kind === "offer" && entry.retired).map(entry => entry.slug));
