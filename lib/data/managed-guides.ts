// Complete editorial bodies stay out of the interactive catalog's projection.
import source from "@/lib/data/managed-catalog.json";
import { validateManagedCatalog } from "@/lib/managed-catalog.mjs";
import type { BrandDiscountGuide } from "@/lib/data/brand-discount-guides";
import type { ManagedCatalog } from "@/lib/managed-catalog-types";
export const MANAGED_GUIDES = Object.fromEntries((validateManagedCatalog(source) as ManagedCatalog).entries.filter(entry => entry.kind === "guide" && !entry.retired).map(entry => [entry.slug, entry.payload as unknown as BrandDiscountGuide]));
