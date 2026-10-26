export interface DiscountSearchEntry {
  slug: string;
  name: string;
  category: string;
  aliases: string[];
  summary: string;
  couponCount: number;
  freshUntil?: number;
}

const intentWords = new Set(["best", "discount", "discounts", "coupon", "coupons", "code", "codes", "promo", "promos", "promotion", "promotions", "voucher", "vouchers", "deal", "deals", "for", "on", "at", "with", "the", "a", "an", "how", "get", "to", "reveal", "working", "software", "saas", "student", "students", "education", "educational", "nonprofit", "nonprofits", "startup", "startups", "annual", "annually", "yearly", "monthly", "billing", "renewal", "renew", "price", "pricing", "eligibility", "eligible", "trial", "trials", "free", "not", "save", "savings", "redeem", "claim", "apply"]);
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\bnon profit\b/g, "nonprofit").trim();

export function discountSearchSummary(entry: DiscountSearchEntry, now = Date.now()) {
  return entry.freshUntil && now <= entry.freshUntil ? entry.summary : "Compare coupon availability, provider options and how to claim.";
}

export function searchDiscountBrands(entries: DiscountSearchEntry[], query: string, limit = 5, now = Date.now()) {
  const words = normalize(query).split(/\s+/).filter(word => word && !intentWords.has(word));
  const brandQuery = words.join(" ");
  return entries.map((entry, position) => {
    const names = [entry.name, entry.slug, ...entry.aliases].map(normalize);
    const target = [...names, ...names.map(name => name.replaceAll(" ", "")), normalize(entry.category)].join(" ");
    const match = words.every(word => target.includes(word));
    const score = brandQuery && names.some(name => name === brandQuery) ? 2 : brandQuery && names.some(name => name.includes(brandQuery)) ? 1 : 0;
    return { entry, match, score, position, codes: entry.freshUntil && now <= entry.freshUntil ? entry.couponCount : 0 };
  }).filter(item => item.match)
    .sort((a, b) => b.score - a.score || (query.trim() && !words.length ? b.codes - a.codes : 0) || a.position - b.position)
    .slice(0, Math.max(0, limit)).map(item => item.entry);
}
