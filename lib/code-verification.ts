import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
  /** Legacy compatibility field. Input checks do not assign a confidence score. */
  score: 0;
  detail: string;
}

export interface CodeVerificationInput {
  code: string;
  codeType: "coupon" | "referral" | "discount";
  toolName: string;
  websiteUrl: string;
  discountPercentage?: number;
  discountDescription?: string;
  expirationDate?: string;
}

export interface CodeVerificationResult {
  /** Whether the supplied input passes local formatting checks, not whether a code works. */
  valid: boolean;
  /** Legacy compatibility field; always zero, never a confidence or success rate. */
  score: 0;
  status: "pending_review" | "needs_changes";
  statusLabel: string;
  recommendedBadge: "UNREVIEWED SUBMISSION";
  reviewStatus: "pending";
  sourceChecked: false;
  checkoutTested: false;
  scope: "input-preflight";
  matchedBrand?: {
    name: string;
    slug: string;
    category: string;
  };
  checks: VerificationCheck[];
  timestamp: string;
  summary: string;
}

export const POPULAR_SAAS_BRANDS = [
  { name: "Hostinger", slug: "hostinger", category: "Hosting & Infrastructure", website: "https://hostinger.com" },
  { name: "Notion", slug: "notion", category: "Productivity & Workspace", website: "https://notion.so" },
  { name: "Beehiiv", slug: "beehiiv", category: "Newsletter & Marketing", website: "https://beehiiv.com" },
  { name: "Make", slug: "make", category: "Automation & Workflows", website: "https://make.com" },
  { name: "Snov.io", slug: "snov-io", category: "Sales Outreach & CRM", website: "https://snov.io" },
  { name: "Hunter", slug: "hunter", category: "Email Discovery & B2B", website: "https://hunter.io" },
  { name: "Vercel", slug: "vercel", category: "Cloud & Dev Tools", website: "https://vercel.com" },
  { name: "Figma", slug: "figma", category: "Design & Prototyping", website: "https://figma.com" },
  { name: "Supabase", slug: "supabase", category: "Backend & Database", website: "https://supabase.com" },
  { name: "Linear", slug: "linear", category: "Issue Tracking", website: "https://linear.app" },
  { name: "Cursor", slug: "cursor", category: "AI Code Editor", website: "https://cursor.com" },
  { name: "Grammarly", slug: "grammarly", category: "AI Writing Assistant", website: "https://grammarly.com" },
  { name: "Zapier", slug: "zapier", category: "No-Code Integration", website: "https://zapier.com" },
  { name: "Canva", slug: "canva", category: "Creative Graphics", website: "https://canva.com" },
  { name: "Semrush", slug: "semrush", category: "SEO & Growth", website: "https://semrush.com" },
  { name: "ConvertKit", slug: "convertkit", category: "Creator Email & Sales", website: "https://convertkit.com" },
  { name: "Postman", slug: "postman", category: "API Development", website: "https://postman.com" },
];

// Pure input checks only. This function does not fetch a domain or source,
// inspect the catalog for duplicates, enqueue work, or attempt checkout.
export function verifyCodeLocally(input: CodeVerificationInput): CodeVerificationResult {
  const code = typeof input.code === "string" ? input.code.trim() : "";
  const formatPassed = code.length >= 3 && code.length <= 60 && /^[a-z0-9_-]+$/i.test(code);
  const url = normalizePublicHttpsUrl(input.websiteUrl);
  const name = typeof input.toolName === "string" ? input.toolName.trim() : "";
  const namePassed = name.length >= 2 && name.length <= 100 && !/[\u0000-\u001f]/.test(name);
  const matchedBrand = POPULAR_SAAS_BRANDS.find(brand => [brand.name.toLowerCase(), brand.slug].includes(name.toLowerCase()));
  const discount = input.discountPercentage ?? 0;
  const discountPassed = Number.isFinite(discount) && discount >= 0 && discount <= 100;
  const expiry = typeof input.expirationDate === "string" ? input.expirationDate.trim() : "";
  const expiryTime = /^\d{4}-\d{2}-\d{2}$/.test(expiry) ? Date.parse(`${expiry}T23:59:59.999Z`) : NaN;
  const expiryPassed = !expiry || (Number.isFinite(expiryTime) && new Date(expiryTime).toISOString().slice(0, 10) === expiry && expiryTime > Date.now());
  const checks: VerificationCheck[] = [
    { id: "format", label: "Code format", passed: formatPassed, score: 0, detail: formatPassed
      ? "The supplied code uses the supported format. Its acceptance is untested."
      : "Use 3–60 letters, numbers, hyphens or underscores, or describe a different code format for editorial review." },
    { id: "domain", label: "Website URL format", passed: Boolean(url), score: 0, detail: url
      ? `The supplied URL uses a public HTTPS hostname (${new URL(url).hostname}). No connection, ownership or source check was performed.`
      : "Provide a public HTTPS website URL without credentials or a private address." },
    { id: "brand_name", label: "Brand details", passed: namePassed, score: 0, detail: namePassed
      ? matchedBrand ? `The entered name matches the ${matchedBrand.name} brand suggestion. The submitted website and offer still need review.` : "A brand name was supplied for review; its identity and offer have not been checked."
      : "Provide a brand name between 2 and 100 characters." },
    { id: "discount_amount", label: "Reported discount format", passed: discountPassed, score: 0, detail: discountPassed
      ? "The reported percentage is within the accepted input range. The saving has not been confirmed against a source."
      : "Enter a finite percentage between 0 and 100; this field does not establish an actual saving." },
    { id: "expiration", label: "Reported expiry", passed: expiryPassed, score: 0, detail: expiryPassed
      ? expiry ? "A future calendar date was supplied. Its published terms still need source review." : "No expiry was supplied. The provider's terms still need review."
      : "Use a future calendar date in YYYY-MM-DD format or leave the expiry blank." },
  ];
  const valid = checks.every(check => check.passed);

  return {
    valid,
    score: 0,
    status: valid ? "pending_review" : "needs_changes",
    statusLabel: valid ? "Ready for editorial review" : "Submission details need changes",
    recommendedBadge: "UNREVIEWED SUBMISSION",
    reviewStatus: "pending",
    sourceChecked: false,
    checkoutTested: false,
    scope: "input-preflight",
    matchedBrand: matchedBrand ? {
      name: matchedBrand.name,
      slug: matchedBrand.slug,
      category: matchedBrand.category,
    } : undefined,
    checks,
    timestamp: new Date().toISOString(),
    summary: valid
      ? "Input checks passed. Submit the details for editorial review. The source has not been checked and the code has not been tested at checkout."
      : "Review the highlighted input details before submitting. No source verification or checkout test has been performed.",
  };
}
