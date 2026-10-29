"use client";
export function PrivacyPreferences() {
  return <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => window.dispatchEvent(new Event("saasfolio:privacy-settings"))}>Privacy preferences</button>;
}
