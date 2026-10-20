// Central Registry for Partner & Verified Affiliate Programs
export const CUSTOM_AFFILIATE_LINKS: Record<string, string> = {
  // Taplio (LinkedIn Growth & Scheduling)
  taplio: "https://taplio.com/?via=quickreads",
  "tool-taplio": "https://taplio.com/?via=quickreads",
  "deal-taplio-pro-annual-20": "https://taplio.com/?via=quickreads",
  "taplio-pro-annual-20-off": "https://taplio.com/?via=quickreads",

  // Systeme.io (All-In-One Marketing & Funnels)
  "systeme-io": "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0",
  systeme: "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0",
  "tool-systeme-io": "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0",
  "deal-systeme-io-unlimited-30": "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0",
  "systeme-io-unlimited-30-off": "https://systeme.io/?sa=sa02739940791ae46d3f6d4cf4bc78f711bae899b0",

  // Snov.io (Cold Outreach & Email Verification)
  "snov-io": "https://snov.io?fp_ref=quick",
  snov: "https://snov.io?fp_ref=quick",
  "tool-snov-io": "https://snov.io?fp_ref=quick",
  "deal-snov-io-pro-25": "https://snov.io?fp_ref=quick",
  "snov-io-pro-25-off": "https://snov.io?fp_ref=quick",

  // StreamYard (Live Streaming Studio)
  streamyard: "https://streamyard.com/?fpr=quick",
  "tool-streamyard": "https://streamyard.com/?fpr=quick",
  "deal-streamyard-studio-25": "https://streamyard.com/?fpr=quick",
  "streamyard-studio-25-off": "https://streamyard.com/?fpr=quick",

  // Smartlead.ai (Unlimited Mailbox Cold Email Outreach)
  smartlead: "https://smartlead.ai/?via=quick",
  "smartlead-ai": "https://smartlead.ai/?via=quick",
  "tool-smartlead": "https://smartlead.ai/?via=quick",
  "deal-smartlead-annual-20": "https://smartlead.ai/?via=quick",
  "smartlead-annual-20-off": "https://smartlead.ai/?via=quick",

  // Beehiiv (Newsletter Operating System)
  beehiiv: "https://www.beehiiv.com/?via=quickreads",
  "tool-beehiiv": "https://www.beehiiv.com/?via=quickreads",
  "deal-beehiiv-scale-20": "https://www.beehiiv.com/?via=quickreads",
  "beehiiv-scale-20-off": "https://www.beehiiv.com/?via=quickreads",
  "deal-beehiiv-growth-30": "https://www.beehiiv.com/?via=quickreads",
  "beehiiv-growth-30-off": "https://www.beehiiv.com/?via=quickreads",
  "deal-beehiiv-annual-2m": "https://www.beehiiv.com/?via=quickreads",
  "beehiiv-annual-two-months": "https://www.beehiiv.com/?via=quickreads",

  // AnyTrack (Ad Attribution & Server-Side Tracking)
  anytrack: "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick",
  "anytrack-io": "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick",
  "tool-anytrack": "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick",
  "deal-anytrack-pro-20": "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick",
  "anytrack-pro-20-off": "https://anytrack.io/?utm_campaign=referral_campaign&utm_medium=referral&utm_source=rewardful&via=quick",

  // Predis.ai (AI Video & Social Media Generator)
  predis: "https://predis.ai?ref=quick",
  "predis-ai": "https://predis.ai?ref=quick",
  "tool-predis-ai": "https://predis.ai?ref=quick",
  "deal-predis-ai-pro-25": "https://predis.ai?ref=quick",
  "predis-ai-pro-25-off": "https://predis.ai?ref=quick",

  // Baremetrics (Subscription Analytics & Churn Insights)
  baremetrics: "https://baremetrics.com/?via=quick",
  "tool-baremetrics": "https://baremetrics.com/?via=quick",
  "deal-baremetrics-annual-20": "https://baremetrics.com/?via=quick",
  "baremetrics-annual-20-off": "https://baremetrics.com/?via=quick",
};

export function getCustomAffiliateUrl(identifier: string): string | undefined {
  if (!identifier) return undefined;
  const key = identifier.toLowerCase().trim();
  if (CUSTOM_AFFILIATE_LINKS[key]) return CUSTOM_AFFILIATE_LINKS[key];
  if (key.includes("beehiiv")) return CUSTOM_AFFILIATE_LINKS["beehiiv"];
  if (key.includes("taplio")) return CUSTOM_AFFILIATE_LINKS["taplio"];
  if (key.includes("systeme")) return CUSTOM_AFFILIATE_LINKS["systeme-io"];
  if (key.includes("snov")) return CUSTOM_AFFILIATE_LINKS["snov-io"];
  if (key.includes("streamyard")) return CUSTOM_AFFILIATE_LINKS["streamyard"];
  if (key.includes("smartlead")) return CUSTOM_AFFILIATE_LINKS["smartlead"];
  if (key.includes("anytrack")) return CUSTOM_AFFILIATE_LINKS["anytrack"];
  if (key.includes("predis")) return CUSTOM_AFFILIATE_LINKS["predis"];
  if (key.includes("baremetrics")) return CUSTOM_AFFILIATE_LINKS["baremetrics"];
  return undefined;
}
