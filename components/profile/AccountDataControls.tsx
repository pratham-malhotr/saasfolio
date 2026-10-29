"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export function AccountDataControls({ email, cloud, mfaEnrolled }: { email: string; cloud: boolean; mfaEnrolled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(""); const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(""); const [address, setAddress] = useState(""); const [password, setPassword] = useState("");
  async function download() {
    setBusy("export"); setError("");
    try { const response = await fetch("/api/account/export", { credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(20000) }); if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Export could not be prepared."); } const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `saasfolio-account-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (error) { setError(error instanceof Error ? error.message : "Export could not be prepared."); } finally { setBusy(""); }
  }
  async function remove(event: React.FormEvent) {
    event.preventDefault(); if (!window.confirm("Permanently delete your SaaSFolio account, saved items and linked private records?")) return;
    setBusy("delete"); setError("");
    try { const result = await apiRequest<{ status: string }>("/api/account/deletion", { email: address, confirmation, ...(password ? { password } : {}) }); window.dispatchEvent(new Event("saasfolio_auth_changed")); router.replace(`/login?account=${result.status === "deleted" ? "deleted" : "cleanup"}`); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Deletion could not be completed."); setBusy(""); }
    finally { setPassword(""); }
  }
  return <section className="rounded-2xl border border-white/15 p-6 space-y-6" aria-labelledby="account-data-heading"><h2 id="account-data-heading" className="text-2xl text-white font-display font-bold">Your account data</h2>{error && <p role="alert" className="text-rose-400">{error}</p>}<div className="space-y-3"><p className="text-sm text-zinc-400">Download your profile, saved items, linked submissions and newsletter status. Authentication tokens and security secrets are excluded.</p><button type="button" disabled={!!busy} onClick={download} className="px-5 py-3 rounded-xl border border-white/20 text-white">{busy === "export" ? "Preparing export…" : "Download my data"}</button></div>
    {cloud && <details className="rounded-xl border border-rose-400/25 p-4"><summary className="text-rose-300 cursor-pointer font-semibold">Permanently delete my account</summary><form onSubmit={remove} className="space-y-4 mt-5 max-w-xl"><p className="text-sm text-zinc-400">This removes account access and saved items, redacts linked private submissions and removes your newsletter subscription. Published editorial content is retained without linking it to your deleted account. The action cannot be undone. Sign in again within five minutes{mfaEnrolled ? " and verify your authenticator" : " before continuing; email/password users can verify their password below"}.</p><label className="block text-sm text-zinc-300">Account email<input type="email" autoComplete="email" value={address} onChange={event => setAddress(event.target.value)} placeholder={email} required className="block w-full mt-2 p-3 rounded-xl bg-black border border-white/20" /></label>{!mfaEnrolled && <label className="block text-sm text-zinc-300">Current password, if you use email/password<input type="password" autoComplete="current-password" maxLength={256} value={password} onChange={event => setPassword(event.target.value)} className="block w-full mt-2 p-3 rounded-xl bg-black border border-white/20" /><span className="block mt-2 text-xs text-zinc-500">Google or Apple account? Sign out and sign in again before returning here.</span></label>}<label className="block text-sm text-zinc-300">Type DELETE MY ACCOUNT<input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" required className="block w-full mt-2 p-3 rounded-xl bg-black border border-white/20" /></label><button type="submit" disabled={!!busy || confirmation !== "DELETE MY ACCOUNT" || address.toLowerCase() !== email.toLowerCase()} className="px-5 py-3 rounded-xl bg-rose-500 text-white font-bold disabled:opacity-50">{busy === "delete" ? "Deleting…" : "Permanently delete account"}</button></form></details>}
  </section>;
}
