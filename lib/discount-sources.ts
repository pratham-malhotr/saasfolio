import registry from "@/lib/data/discount-source-registry.json";

// The collector and profile research links share exact provider/brand identities.
interface DiscountSource {
  name: string;
  url: string;
  kind?: "coupon-publisher" | "partner-marketplace";
  access?: "public" | "paid-membership" | "account";
  reviewedAt?: string;
  note?: string;
}
export const DISCOUNT_SOURCES = registry.reduce<Record<string, DiscountSource[]>>((sources, entry) => {
  (sources[entry.toolSlug] ||= []).push(entry as DiscountSource);
  return sources;
}, {});
