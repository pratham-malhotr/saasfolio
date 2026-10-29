import { normalizePublicHttpsUrl } from "./public-url.mjs";

export const MANAGED_KINDS = ["brand", "guide", "offer"];
const categories = { "ai-tools": "Artificial Intelligence", marketing: "Growth & Marketing", "crm-sales": "CRM & Sales Automation", "dev-tools": "Developer & API Tools", design: "Design & Creative Systems", analytics: "Analytics & Product Telemetry", hosting: "Cloud Hosting & Edge Infra", finance: "Fintech, Billing & Invoicing", productivity: "Productivity & Knowledge Hubs", security: "Cybersecurity & Compliance", ecommerce: "E-Commerce & Checkout Engines", "project-management": "Project & Sprint Management" };
const keys = {
  brand: ["name", "categorySlug", "website", "pricingUrl", "description", "longDescription", "keyFeatures", "pricingModel", "reviewedAt"],
  guide: ["reviewedAt", "sourceUrl", "searchTitle", "metaDescription", "intro", "summary", "bestDiscountAnswer", "decisionRows", "sections", "redemptionSteps", "relatedSlugs", "faqs", "sourceNotes", "sources", "savingsOptions", "billingModel"],
  offer: ["toolSlug", "title", "dealType", "code", "discountPercentage", "discountKind", "sourceKind", "sourceUrl", "destinationUrl", "evidence", "terms", "expiryDate"],
};
export class CatalogValidationError extends Error {
  constructor(message) { super(message); this.name = "CatalogValidationError"; }
}
function expect(value, message) { if (!value) throw new CatalogValidationError(message); }
function text(value, field, min = 1, max = 10000) {
  expect(typeof value === "string" && value.trim().length >= min && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), `${field} must contain ${min}–${max} characters.`);
  return value.trim();
}
function url(value, field) { expect(Boolean(normalizePublicHttpsUrl(value)), `${field} must be a public HTTPS URL.`); }
function list(value, field, min, max = 30) { expect(Array.isArray(value) && value.length >= min && value.length <= max, `${field} must contain ${min}–${max} items.`); return value; }
function strings(value, field, min, max = 30) { return list(value, field, min, max).map(item => text(item, field)); }
function date(value, field, now) {
  expect(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && Date.parse(value) <= now, `${field} must be an actual review date, not a future date.`);
}
function safeObject(value, depth = 0) {
  expect(depth <= 10 && value !== null && typeof value === "object" && !Array.isArray(value), "Use a valid content object.");
  for (const [key, item] of Object.entries(value)) {
    expect(!["__proto__", "prototype", "constructor"].includes(key), "Unsupported content key.");
    if (item && typeof item === "object") {
      if (Array.isArray(item)) for (const child of item) { if (child && typeof child === "object") safeObject(child, depth + 1); }
      else safeObject(item, depth + 1);
    }
  }
}
export function validateManagedPayload(kind, slug, input, { publication = false, now = Date.now() } = {}) {
  expect(MANAGED_KINDS.includes(kind), "Choose a brand, guide or offer.");
  expect(typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100, "Use a canonical lowercase slug with at most 100 characters.");
  safeObject(input);
  expect(JSON.stringify(input).length <= 100000, "Content exceeds the allowed size.");
  const allowed = [...keys[kind], ...(publication && kind === "offer" ? ["checkedAt", "contentHash"] : [])];
  expect(Object.keys(input).every(key => allowed.includes(key)), "Remove unsupported fields; verification flags, customer ratings and review counts cannot be supplied.");
  const p = structuredClone(input);
  if (kind === "brand") {
    text(p.name, "Brand name", 2, 100); expect(Object.hasOwn(categories, p.categorySlug), "Choose a supported category.");
    url(p.website, "Website"); url(p.pricingUrl, "Pricing source");
    text(p.description, "Description", 60, 500); text(p.longDescription, "Original profile copy", 200, 15000);
    strings(p.keyFeatures, "Features", 3, 12); expect(["Paid", "Freemium", "Free Trial", "Open Source"].includes(p.pricingModel), "Choose a supported pricing model.");
    date(p.reviewedAt, "Review date", now);
  } else if (kind === "guide") {
    date(p.reviewedAt, "Review date", now); url(p.sourceUrl, "Official source");
    text(p.searchTitle, "Search title", 20, 70); text(p.metaDescription, "Search description", 70, 155);
    for (const key of ["intro", "summary", "bestDiscountAnswer"]) text(p[key], key, key === "bestDiscountAnswer" ? 150 : 80, 4000);
    list(p.decisionRows, "Buying routes", 3, 8).forEach(row => { for (const key of ["option", "bestFor", "check"]) text(row[key], key, 5, 1000); });
    const sections = list(p.sections, "Original sections", 4, 12);
    sections.forEach(section => { text(section.heading, "Section heading", 5, 180); text(section.text, "Section body", 100, 10000); });
    expect(sections.map(s => s.text).join(" ").split(/\s+/).length >= 280, "Write at least 280 original words across the buying sections.");
    expect(new Set(sections.map(s => s.heading.toLowerCase())).size === sections.length, "Use distinct section headings.");
    strings(p.redemptionSteps, "Redemption steps", 4, 4); strings(p.relatedSlugs, "Related guides", 3, 6).forEach(value => expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Use canonical related-guide slugs."));
    list(p.faqs, "Questions", 3, 10).forEach(item => { text(item.question, "Question", 10, 200); text(item.answer, "Answer", 60, 2000); });
    strings(p.sourceNotes, "Source notes", 1, 12);
    if (p.sources) list(p.sources, "Source citations", 0, 12).forEach(item => { text(item.label, "Source label", 3, 180); url(item.url, "Citation URL"); });
    if (p.billingModel) expect(["subscription", "usage"].includes(p.billingModel), "Choose subscription or usage billing.");
    if (p.savingsOptions) list(p.savingsOptions, "Provider options", 0, 10).forEach(item => {
      expect(["Annual billing", "Team discount", "Bundle discount", "Education offer", "Nonprofit discount", "Organization offer"].includes(item.type), "Choose a supported provider option.");
      text(item.saving, "Provider saving", 8, 400); text(item.terms, "Provider terms", 40, 3000); url(item.sourceUrl, "Provider option source");
    });
  } else {
    expect(typeof p.toolSlug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.toolSlug), "Use a canonical brand slug.");
    text(p.title, "Offer title", 10, 180); text(p.terms, "Eligibility and continuing cost", 80, 6000);
    expect(["coupon", "offer", "free_trial", "free_plan", "lifetime"].includes(p.dealType), "Choose a sourced offer type; ordinary pricing is not a discount.");
    expect(Number.isFinite(p.discountPercentage) && p.discountPercentage >= 0 && p.discountPercentage <= 100, "Discount must be between 0 and 100.");
    if (p.discountKind) expect(["exact", "up-to"].includes(p.discountKind), "Choose an exact or maximum saving.");
    expect(["vendor", "coupon-site"].includes(p.sourceKind), "Identify the provider or coupon publisher.");
    url(p.sourceUrl, "Source URL"); url(p.destinationUrl, "Provider destination"); strings(p.evidence, "Exact public evidence fragments", 1, 12).forEach(fragment => text(fragment, "Evidence fragment", 3, 500));
    if (p.discountPercentage > 0) expect(new RegExp(`(?:^|[^0-9.])${String(p.discountPercentage).replace(".", "\\.")}\\s*%`).test(p.evidence.join(" ")), "The evidence must explicitly include the recorded percentage.");
    if (p.dealType === "coupon") expect(typeof p.code === "string" && /^[A-Za-z0-9_-]{3,48}$/.test(p.code), "A coupon needs an explicit public code.");
    else expect(!p.code, "A non-coupon offer cannot advertise a coupon code.");
    if (p.expiryDate) expect(Number.isFinite(Date.parse(p.expiryDate)) && (publication || Date.parse(p.expiryDate) > now), "Use a valid future published expiry or leave it empty.");
    if (publication) {
      expect(typeof p.checkedAt === "string" && Number.isFinite(Date.parse(p.checkedAt)) && Date.parse(p.checkedAt) <= now, "A publication requires a real source observation.");
      expect(typeof p.contentHash === "string" && /^[a-f0-9]{64}$/.test(p.contentHash), "A publication requires its source fingerprint.");
    }
  }
  return p;
}

export function validateManagedCatalog(value, now = Date.now()) {
  expect(value?.schemaVersion === 1 && Number.isSafeInteger(value.revision) && value.revision >= 0 && Array.isArray(value.entries) && value.entries.length <= 5000, "Unsupported managed catalog release.");
  const identities = new Set();
  const entries = value.entries.map(entry => {
    const identity = `${entry.kind}:${entry.slug}`;
    expect(!identities.has(identity), "Duplicate managed content identity."); identities.add(identity);
    expect(Number.isInteger(entry.revision) && entry.revision > 0 && typeof entry.retired === "boolean" && Number.isFinite(Date.parse(entry.publishedAt)) && Date.parse(entry.publishedAt) <= now, "Invalid published revision.");
    const payload = validateManagedPayload(entry.kind, entry.slug, entry.payload, { publication: true, now });
    return { kind: entry.kind, slug: entry.slug, payload, revision: entry.revision, retired: entry.retired, publishedAt: entry.publishedAt };
  });
  return { schemaVersion: 1, revision: value.revision, publishedAt: value.publishedAt || null, entries };
}

export function managedBrand(entry) {
  const p = entry.payload;
  return { id: `tool-${entry.slug}`, slug: entry.slug, name: p.name, tagline: p.description, description: p.description, longDescription: p.longDescription,
    category: categories[p.categorySlug], categorySlug: p.categorySlug, website: p.website, pricingUrl: p.pricingUrl, sourceUrl: p.pricingUrl,
    logoLetter: p.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase(), rating: 0, reviewCount: 0, reviews: [], pricingStart: 0, pricingModel: p.pricingModel,
    verified: false, pricingVerified: false, bestFor: p.description, keyFeatures: p.keyFeatures, pros: [], cons: [], pricingPlans: [], alternatives: [], dealsCount: 0,
    updatedAt: `${p.reviewedAt}T00:00:00.000Z`, ...(entry.retired ? { providerStatus: "unavailable", providerNote: "This provider has been retired from the active catalog." } : {}) };
}

export function managedPublicIndex(catalog) {
  return { schemaVersion: catalog.schemaVersion, revision: catalog.revision, publishedAt: catalog.publishedAt,
    entries: catalog.entries.filter(entry => entry.kind !== "guide"),
    retiredGuideSlugs: catalog.entries.filter(entry => entry.kind === "guide" && entry.retired).map(entry => entry.slug) };
}

export function managedOffer(entry) {
  const { evidence, contentHash, ...p } = entry.payload;
  return { ...p, slug: entry.slug, sourceKey: `reviewed:${entry.slug}`, evidence: evidence.join("; "), updatedAt: entry.publishedAt, contentHash };
}
