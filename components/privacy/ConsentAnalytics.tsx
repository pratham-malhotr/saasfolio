"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import Script from "next/script";
import Link from "next/link";
import { analyticsConsent, CONSENT_KEY, publicAnalyticsPath } from "@/lib/analytics-policy.mjs";
import { analyticsEvent } from "@/lib/client-analytics";

const measurementId = process.env.NEXT_PUBLIC_GA_ID || "G-7G7TJJENC0";
const validId = /^G-[A-Z0-9]+$/.test(measurementId);
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: `ga-disable-${string}`]: boolean | undefined } }
type TagWindow = Window;
function privacySignal() { return navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true; }
const reportVitals: Parameters<typeof useReportWebVitals>[0] = metric => {
  if (!["LCP", "CLS", "INP", "FCP", "TTFB"].includes(metric.name) || !Number.isFinite(metric.value)) return;
  analyticsEvent("web_vital", { metric_name: metric.name, value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), metric_rating: metric.rating, navigation_type: metric.navigationType });
};
export function ConsentAnalytics() {
  const path = usePathname();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastPage = useRef("");
  useReportWebVitals(reportVitals);
  useEffect(() => {
    function sync() {
      let stored = null;
      try { stored = analyticsConsent(localStorage.getItem(CONSENT_KEY)); } catch { /* storage can be blocked */ }
      setChoice(privacySignal() ? false : stored); setInitialized(true);
    }
    const open = () => setSettings(true);
    sync(); window.addEventListener("storage", sync); window.addEventListener("saasfolio:privacy-settings", open);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("saasfolio:privacy-settings", open); };
  }, []);
  const enabled = validId && choice === true && Boolean(publicAnalyticsPath(path));
  useEffect(() => {
    const target = window as TagWindow;
    target[`ga-disable-${measurementId}`] = !enabled;
    if (!enabled) return;
    if (!target.gtag) {
      target.dataLayer = target.dataLayer || [];
      // The tag consumes array-like arguments objects.
      // Google consumes an arguments object, rather than a rest-parameter array.
      // eslint-disable-next-line prefer-rest-params
      target.gtag = function () { target.dataLayer!.push(arguments); };
      target.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      target.gtag("js", new Date());
      target.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: `${location.origin}${publicAnalyticsPath(path)}`, page_title: publicAnalyticsPath(path), page_referrer: "" });
    }
    target.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  }, [enabled, path]);
  useEffect(() => {
    if (!enabled || !loaded) { lastPage.current = ""; return; }
    if (lastPage.current !== path) { analyticsEvent("page_view", { page_path: path }); lastPage.current = path; }
    const click = (action: MouseEvent) => {
      const link = action.target instanceof Element ? action.target.closest<HTMLAnchorElement>('a[href^="/go/"]') : null;
      const slug = link?.getAttribute("href")?.slice(4);
      if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) analyticsEvent("offer_open", { offer_slug: slug });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [enabled, loaded, path]);
  useEffect(() => { if (settings) dialog.current?.showModal(); else dialog.current?.close(); }, [settings]);
  function choose(allowed: boolean) {
    const effective = allowed && !privacySignal();
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, allowed: effective, at: Date.now() })); } catch { /* denied storage keeps analytics off */ }
    setChoice(effective); setSettings(false);
    const target = window as TagWindow;
    target[`ga-disable-${measurementId}`] = !effective;
    if (!effective) {
      target.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.trim().split("=")[0];
        if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
        for (const domain of ["", `; domain=${location.hostname}`, `; domain=.${location.hostname.replace(/^www\./, "")}`]) document.cookie = `${name}=; max-age=0; path=/${domain}; SameSite=Lax`;
      }
    }
  }
  const buttons = <div className="flex flex-wrap gap-3"><button type="button" onClick={() => choose(false)} className="rounded-lg border border-white/25 px-4 py-2 text-sm">Decline analytics</button><button type="button" onClick={() => choose(true)} className="rounded-lg border border-white/25 px-4 py-2 text-sm">Allow analytics</button></div>;
  return <>
    {enabled && <Script id="consented-google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="lazyOnload" onReady={() => setLoaded(true)} />}
    {initialized && choice === null && <section aria-label="Analytics preferences" className="fixed z-[90] bottom-4 left-4 right-4 sm:left-auto sm:max-w-lg rounded-xl border border-white/20 bg-[#121212] p-5 text-white shadow-xl"><p className="text-sm mb-4">Optional analytics help us improve pages and loading speed. They stay off until you allow them. <Link href="/privacy#analytics" className="underline">Privacy details</Link></p>{buttons}</section>}
    <dialog ref={dialog} aria-labelledby="privacy-title" onCancel={() => setSettings(false)} onClose={() => setSettings(false)} className="m-auto max-w-lg rounded-xl border border-white/20 bg-[#121212] p-6 text-white backdrop:bg-black/75"><h2 id="privacy-title" className="text-xl font-bold mb-3">Privacy preferences</h2><p className="text-sm mb-5">Essential account and security storage stays enabled. Optional Google Analytics measures public pages, offer clicks and loading performance. We respect browser Do Not Track and Global Privacy Control signals.</p>{buttons}<button type="button" className="underline text-sm mt-5" onClick={() => setSettings(false)}>Close preferences</button></dialog>
  </>;
}
