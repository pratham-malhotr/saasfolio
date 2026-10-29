import { readFileSync } from "node:fs";
import { loadCatalogModule } from "./load-catalog.mjs";
import { validateManagedRelease } from "../../lib/managed-release.mjs";

export function checkedManagedRelease(input, previous) {
  const { TOOLS_DATA, getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
  const { BRAND_DISCOUNT_GUIDES } = loadCatalogModule("lib/data/brand-discount-guides.ts");
  for (const entry of input.entries || []) {
    const canonical = getToolBySlug(entry.slug)?.slug;
    if (entry.kind === "brand" && canonical && canonical !== entry.slug) throw new Error(`Use canonical brand slug ${canonical} instead of ${entry.slug}.`);
  }
  const history = JSON.parse(readFileSync(new URL("../../lib/data/offer-url-history.json", import.meta.url), "utf8"));
  return validateManagedRelease(input, { previous, tools: TOOLS_DATA, guideSlugs: Object.keys(BRAND_DISCOUNT_GUIDES), offerIdentities: history.offers });
}
