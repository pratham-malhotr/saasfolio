import "server-only";
import { createHmac } from "node:crypto";
import { Resolver } from "node:dns/promises";
import { CATEGORIES } from "@/lib/catalog-categories";
import { BRAND_PRICING_MODELS, brandDraftFromSubmission } from "@/lib/brand-submission";
import type { BrandDirectoryEntry } from "@/lib/brand-directory";
import { getPublishedTools } from "@/lib/published-catalog";
import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";
import { HttpError, email, text } from "@/lib/server/http";
import { pinnedPublicPage } from "@/lib/server/source-fetch.mjs";
import { isSupabaseConfigured, serviceClient } from "@/lib/server/supabase";
import { plainText, robotsAllows } from "@/scripts/lib/offer-sources.mjs";

export function brandListingsEnabled() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return process.env.BRAND_LISTINGS_ENABLED === "true" && isSupabaseConfigured() && Boolean(key && !key.includes("your-service"));
}

export function brandVerificationEnabled() {
  return brandListingsEnabled() && /^[a-f0-9]{64}$/i.test(process.env.BRAND_VERIFICATION_SECRET || "");
}

export function brandHost(website: string) {
  return new URL(website).hostname.replace(/^www\./, "");
}

export async function brandClaim(data: Record<string, unknown>) {
  if (!brandVerificationEnabled()) throw new HttpError(503, "Online brand verification is temporarily unavailable.");
  const receipt = text(data, "receipt", 36, 36).toLowerCase();
  const address = email(data);
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(receipt)) throw new HttpError(400, "Enter the submission reference from your receipt.");
  const db = serviceClient();
  const { data: inquiry, error } = await db.from("inquiries").select("updated_at,status,payload")
    .eq("id", receipt).eq("kind", "submission").eq("email", address).maybeSingle();
  if (error) throw new HttpError(503, "Brand verification is temporarily unavailable.");
  const payload = inquiry?.payload;
  const website = normalizePublicHttpsUrl(payload?.websiteUrl);
  if (!inquiry || payload?.submissionType !== "brand" || payload.redacted || !website || inquiry.status === "rejected") {
    throw new HttpError(404, "No eligible submission matches that reference and email.");
  }
  const host = brandHost(website);
  const token = createHmac("sha256", process.env.BRAND_VERIFICATION_SECRET!).update(`${receipt}:${host}:${address}`).digest("hex");
  return { db, inquiry, payload, receipt, website, host, dnsName: `_saasfolio.${host}`, dnsValue: `saasfolio=${token}` };
}

type Claim = Awaited<ReturnType<typeof brandClaim>>;

export async function ownsBrandDomain(claim: Claim) {
  const resolver = new Resolver({ timeout: 2500, tries: 1 });
  try {
    const records = await resolver.resolveTxt(`${claim.dnsName}.`);
    return records.some(parts => parts.join("") === claim.dnsValue);
  } catch { return false; }
}

export async function getClaimListing(claim: Claim) {
  const { data, error } = await claim.db.from("brand_listings").select("id,name,hidden_at")
    .eq("inquiry_id", claim.receipt).maybeSingle();
  if (error) throw new HttpError(503, "The listing could not be checked. Please try again.");
  return data?.hidden_at ? null : data;
}

const comparable = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

async function checkBrandPages(website: string, source: string, name: string) {
  const signal = AbortSignal.timeout(10000);
  const pages = [new URL(website), new URL(source)];
  if (pages[0].pathname === pages[1].pathname && brandHost(website) === brandHost(source)) return false;
  const origins = [...new Set(pages.map(page => page.origin))];
  const policies = await Promise.all(origins.map(origin => pinnedPublicPage(`${origin}/robots.txt`, { signal })));
  if (pages.some(page => {
    const policy = policies[origins.indexOf(page.origin)];
    return policy.status !== 200 ? ![404, 410].includes(policy.status) : !robotsAllows(policy.html, page.pathname + page.search);
  })) return false;
  const [home, details] = await Promise.all(pages.map(page => pinnedPublicPage(page.href, { signal })));
  if (home.status !== 200 || details.status !== 200 || !home.html || !details.html || home.url === details.url) return false;
  if (/just a moment|verify you are human|cf-chl-|captcha challenge|domain (?:is |for )?(?:parked|for sale)|coming soon/i.test(home.html + details.html)) return false;
  const title = plainText(home.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const brand = comparable(name);
  const homepageText = plainText(home.html);
  const detailText = plainText(details.html);
  return brand.length >= 3 && ` ${comparable(title)} `.includes(` ${brand} `) && homepageText.length >= 150 &&
    detailText.length >= 250 && comparable(homepageText) !== comparable(detailText) &&
    /\b(?:software|app|workspace|platform|dashboard|integration|api)\b/i.test(homepageText) &&
    /\b(?:pricing|subscription|plans?|documentation|docs|guides?|features|usage|install)\b/i.test(detailText);
}

export async function approveVerifiedBrand(claim: Claim) {
  const { payload, host, website, inquiry } = claim;
  const { slug } = brandDraftFromSubmission(payload);
  const source = normalizePublicHttpsUrl(payload.pricingUrl);
  if (!["pending", "reviewing"].includes(inquiry.status) || payload.relationship === "Community recommendation" || !source || !slug ||
    !CATEGORIES.some(category => category.slug === payload.categorySlug)) return false;
  if (brandHost(source) !== host && !brandHost(source).endsWith(`.${host}`)) return false;

  const catalog = getPublishedTools();
  const official = catalog.filter(tool => normalizePublicHttpsUrl(tool.website) && brandHost(tool.website) === host);
  const matched = official.find(tool => comparable(tool.name) === comparable(payload.toolName));
  if ((!matched && official.length) || catalog.some(tool => tool.slug === slug && tool.slug !== matched?.slug)) return false;

  try { if (!await checkBrandPages(website, source, payload.toolName)) return false; }
  catch { return false; }

  const { data, error } = await claim.db.rpc("approve_brand_listing", {
    receipt: claim.receipt, reviewed_at: inquiry.updated_at, listing_host: host, listing_slug: matched?.slug || slug,
    reviewed_catalog_slug: matched?.slug || null, method: "automatic",
  });
  if (error) throw new HttpError(503, "Approval could not be confirmed. Please try again.");
  return typeof data === "string";
}

export async function includeApprovedBrands(catalog: BrandDirectoryEntry[]) {
  if (!brandListingsEnabled()) return catalog;
  const { data, error } = await serviceClient().rpc("list_brand_directory")
    .abortSignal(AbortSignal.timeout(2500));
  if (error || !Array.isArray(data)) return catalog;
  const brands = new Map(catalog.map(brand => [brand.slug, brand]));
  const hosts = new Set(catalog.flatMap(brand => normalizePublicHttpsUrl(brand.website) ? [brandHost(brand.website)] : []));
  for (const entry of data) {
    const website = normalizePublicHttpsUrl(entry.website);
    if (!website || brandHost(website) !== entry.host) continue;
    const reviewed = brands.get(entry.catalog_slug || entry.slug);
    if (reviewed && normalizePublicHttpsUrl(reviewed.website) && brandHost(reviewed.website) === entry.host) {
      if (entry.sponsored) brands.set(reviewed.slug, { ...reviewed, sponsored: true });
      continue;
    }
    const category = CATEGORIES.find(item => item.slug === entry.category_slug);
    const pricingModel = BRAND_PRICING_MODELS.find(item => item === entry.pricing_model);
    if (!category || !pricingModel || hosts.has(entry.host) || brands.has(entry.slug)) continue;
    const initial = entry.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
    brands.set(entry.slug, { slug: entry.slug, name: entry.name, website, category: category.name, categorySlug: category.slug,
      description: entry.description, pricingModel, letter: /^[A-Z]$/.test(initial) ? initial : "#", codeCount: 0,
      hasFreeOption: false, hasOffer: false, hasGuide: false, submitted: true, sponsored: entry.sponsored === true });
  }
  return [...brands.values()].sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));
}
