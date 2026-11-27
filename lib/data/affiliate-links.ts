// SaaSFolio partner (affiliate) programs, keyed by canonical brand slug.
//
// Every outbound click for a partner brand is attributed to SaaSFolio:
// - "params" programs track with a query parameter that works on any page of
//   the brand's site, so a specific destination (pricing, a coupon page, a
//   nonprofit program) keeps its exact page and gains the tracking parameter.
// - "link" programs use a hosted redirect (Dub and similar). A destination
//   cannot be carried through it, so the partner link itself is the destination.
// Links are rendered with rel="sponsored" and disclosed on every page.

export interface AffiliateProgram {
  /** Partner URL as supplied by the program. */
  url: string;
  mode: "params" | "link";
  /** Partner-supplied code, shown with its own label; not a source-checked coupon. */
  code?: string;
}

export const AFFILIATE_PROGRAMS: Record<string, AffiliateProgram> = {
  taplio: { url: "https://taplio.com/?via=quickreads", mode: "params" },
  "systeme-io": { url: "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0", mode: "params" },
  "snov-io": { url: "https://snov.io/?fp_ref=quick", mode: "params" },
  streamyard: { url: "https://streamyard.com/?fpr=quick", mode: "params" },
  smartlead: { url: "https://smartlead.ai/?via=quick", mode: "params" },
  beehiiv: { url: "https://www.beehiiv.com/?via=quickreads", mode: "params" },
  anytrack: { url: "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick", mode: "params" },
  "predis-ai": { url: "https://predis.ai/?ref=quick", mode: "params" },
  baremetrics: { url: "https://baremetrics.com/?via=quick", mode: "params" },
  "scribe-mail": { url: "https://www.scribe-mail.com/?via=quick", mode: "params" },
  "deadline-funnel": { url: "https://www.deadlinefunnel.com/?via=quick", mode: "params" },
  ocoya: { url: "https://www.ocoya.com/?via=quickreads", mode: "params" },
  tradingview: { url: "https://www.tradingview.com/?utm_source=partner_link&aff_id=168129", mode: "params" },
  "julius-ai": { url: "https://julius.dub.link/pratham-malhotra", mode: "link", code: "PRATHAM50OFFYJ" },
  "cal-com": { url: "https://refer.cal.com/pratham-malhotra-zxey", mode: "link" },
  firecrawl: { url: "https://firecrawl.link/pratham-malhotra", mode: "link" },
  fabric: { url: "https://refer.fabric.so/pratham-malhotra", mode: "link" },
};

const siteHost = (host: string) => host.toLowerCase().replace(/^www\./, "");

export function getAffiliateProgram(toolSlug: string | undefined): AffiliateProgram | undefined {
  return toolSlug && Object.hasOwn(AFFILIATE_PROGRAMS, toolSlug) ? AFFILIATE_PROGRAMS[toolSlug] : undefined;
}

export function isPartnerBrand(toolSlug: string | undefined): boolean {
  return Boolean(getAffiliateProgram(toolSlug));
}

// The attributed URL for a click on a partner brand. A same-site destination
// keeps its page and existing parameters (a campaign is never overwritten); any
// other destination, or a link-mode program, uses the partner link.
export function affiliateUrlFor(toolSlug: string | undefined, destination?: string): string | undefined {
  const program = getAffiliateProgram(toolSlug);
  if (!program) return undefined;
  if (program.mode === "link" || !destination) return program.url;
  try {
    const partner = new URL(program.url);
    const target = new URL(destination);
    if (target.protocol !== "https:" || siteHost(target.hostname) !== siteHost(partner.hostname)) return program.url;
    partner.searchParams.forEach((value, key) => { if (!target.searchParams.has(key)) target.searchParams.set(key, value); });
    return target.href;
  } catch {
    return program.url;
  }
}

// Kept for callers that only know a brand or legacy offer identifier.
export function getCustomAffiliateUrl(identifier: string): string | undefined {
  if (!identifier) return undefined;
  const key = identifier.toLowerCase().trim().replace(/^(tool|deal)-/, "");
  if (getAffiliateProgram(key)) return AFFILIATE_PROGRAMS[key].url;
  const brand = Object.keys(AFFILIATE_PROGRAMS).sort((a, b) => b.length - a.length).find(slug => key.startsWith(`${slug}-`) || key === slug.replace(/-(io|ai|com)$/, ""));
  return brand ? AFFILIATE_PROGRAMS[brand].url : undefined;
}

