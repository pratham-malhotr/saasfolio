import "server-only";
import { HOSTING_PROVIDERS } from "@/lib/data/hosting-providers";
import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";

// Approved partner URLs only. An exact promotional offer needs its own mapping
// so a generic affiliate homepage cannot silently replace its activation route.
export function getHostingAffiliateUrl(toolSlug: string, offerSlug?: string, allowBrandFallback = false): string | undefined {
  if (!HOSTING_PROVIDERS.some(provider => provider.slug === toolSlug)) return undefined;
  try {
    const registry: unknown = JSON.parse(process.env.HOSTING_AFFILIATE_URLS || "{}");
    if (!registry || typeof registry !== "object" || Array.isArray(registry)) return undefined;
    const links = registry as Record<string, unknown>;
    const keys = [...(offerSlug ? [offerSlug] : []), ...(allowBrandFallback ? [toolSlug] : [])];
    for (const key of keys) {
      const value = Object.hasOwn(links, key) ? links[key] : undefined;
      if (typeof value !== "string") continue;
      const url = normalizePublicHttpsUrl(value);
      if (url) return url;
    }
  } catch { /* Invalid configuration falls back to the documented provider URL. */ }
  return undefined;
}
