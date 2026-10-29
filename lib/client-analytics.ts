"use client";
import { analyticsConsent, publicAnalyticsPath, CONSENT_KEY, productAnalyticsFields } from "@/lib/analytics-policy.mjs";

export function analyticsEvent(name: string, fields: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const path = publicAnalyticsPath(location.pathname);
  try {
    if (!path || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || analyticsConsent(localStorage.getItem(CONSENT_KEY)) !== true) return;
    window.gtag?.("event", name, { ...fields, page_location: `${location.origin}${path}`, page_referrer: "", page_title: path });
  } catch { return; }
}

export function trackProductEvent(name: "search_results" | "coupon_copy" | "offer_report", fields: Record<string, unknown>) {
  const safe = productAnalyticsFields(name, fields);
  if (safe) analyticsEvent(name, safe);
}
