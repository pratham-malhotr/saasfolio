export const CONSENT_KEY = "saasfolio.analytics-consent.v1";
export function publicAnalyticsPath(input) {
  if (typeof input !== "string") return null;
  const path = input.split(/[?#]/, 1)[0];
  if (["/", "/about", "/brands", "/tools", "/deals", "/discounts", "/articles", "/compare", "/privacy", "/terms", "/affiliate-disclosure", "/savings-calculator", "/coupon-codes", "/startup-deals", "/student-discounts", "/nonprofit-discounts"].includes(path)) return path;
  return /^\/(tools|deals|discounts|articles)\/(?:category\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ? path : null;
}
export function analyticsConsent(value, now = Date.now()) {
  try {
    const record = JSON.parse(value);
    return record.version === 1 && typeof record.allowed === "boolean" && Number.isFinite(record.at) && record.at <= now && now - record.at < 180 * 86400000 ? record.allowed : null;
  } catch { return null; }
}

// Only bounded counts, known scopes and catalog identities are measured.
// Search text, coupon values, form content and arbitrary fields never leave.
/** @returns {Record<string, string | number | boolean> | null} */
export function productAnalyticsFields(name, fields) {
  if (name === "search_results" && ["all", "brands", "tools", "deals", "articles", "community"].includes(fields.scope) && Number.isSafeInteger(fields.resultCount) && fields.resultCount >= 0) return { search_scope: fields.scope, result_count: Math.min(fields.resultCount, 1000), has_results: fields.resultCount > 0 };
  if (name === "coupon_copy" && ["copied", "manual"].includes(fields.result)) return { copy_result: fields.result };
  if (name === "offer_report" && typeof fields.offerSlug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.offerSlug) && fields.offerSlug.length <= 120) return { offer_slug: fields.offerSlug };
  return null;
}
