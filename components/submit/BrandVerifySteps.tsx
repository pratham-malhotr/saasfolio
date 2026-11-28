"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Globe2, MailCheck, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

type Verification = { dnsName: string; dnsValue: string; approved: boolean; status?: "checked" | "record_not_found" };

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="rounded-lg border border-white/10 bg-black/40 p-3">
    <div className="flex items-center justify-between gap-3"><span className="text-xs text-zinc-400">{label}</span>
      <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#C6FF3D]" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); } catch { /* user can select manually */ } }}>
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />{copied ? "Copied" : "Copy"}</button></div>
    <code className="mt-1 block break-all text-sm text-white">{value}</code>
  </div>;
}

/** The automatic listing path shown right after a brand is submitted. */
export function BrandVerifySteps({ receipt, email }: { receipt: string; email: string }) {
  const [verification, setVerification] = useState<Verification>();
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<Verification>("/api/brands/verify", { receipt, email, action: "instructions" })
      .then(result => { if (active) setVerification(result); })
      .catch(() => { if (active) setUnavailable(true); });
    return () => { active = false; };
  }, [receipt, email]);

  async function check() {
    setBusy(true); setError("");
    try { setVerification(await apiRequest<Verification>("/api/brands/verify", { receipt, email, action: "verify" })); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "The domain could not be checked. Try again shortly."); }
    finally { setBusy(false); }
  }

  if (unavailable) return null;
  if (!verification) return <p className="mt-6 text-sm text-zinc-400" role="status">Preparing your verification record…</p>;
  if (verification.approved) return <div className="mt-6 rounded-xl border border-[#C6FF3D]/40 bg-[#C6FF3D]/10 p-4 text-sm text-white" role="status">
    <CheckCircle2 className="mb-2 h-5 w-5 text-[#C6FF3D]" aria-hidden="true" />Verified and added to the brand directory. A confirmation email is on its way.</div>;

  return <section aria-labelledby="get-listed-title" className="mt-7 space-y-4 rounded-2xl border border-white/15 bg-black/25 p-5">
    <h3 id="get-listed-title" className="font-display text-xl font-bold text-white">Get listed automatically</h3>
    <ol className="space-y-4 text-sm text-zinc-300">
      <li className="flex gap-3"><Globe2 className="mt-0.5 h-5 w-5 flex-none text-[#C6FF3D]" aria-hidden="true" /><div className="min-w-0 flex-1 space-y-2">
        <p><strong className="text-white">1. Add this TXT record</strong> in your domain&apos;s DNS settings. It proves you manage the website.</p>
        <CopyValue label="Record name (host)" value={verification.dnsName} />
        <CopyValue label="TXT value" value={verification.dnsValue} />
      </div></li>
      <li className="flex gap-3"><RefreshCw className="mt-0.5 h-5 w-5 flex-none text-[#C6FF3D]" aria-hidden="true" /><p><strong className="text-white">2. We check every hour.</strong> Once the record is live we confirm your homepage and pricing or documentation page match the brand. No need to come back. You can also check now.</p></li>
      <li className="flex gap-3"><MailCheck className="mt-0.5 h-5 w-5 flex-none text-[#C6FF3D]" aria-hidden="true" /><p><strong className="text-white">3. You get an email</strong> as soon as your brand is added to the directory.</p></li>
    </ol>
    <button type="button" disabled={busy} onClick={() => void check()} className="rounded-xl bg-[#C6FF3D] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? "Checking…" : "Check my domain now"}</button>
    {verification.status === "record_not_found" && <p role="status" className="text-sm text-zinc-400">The record isn&apos;t visible yet. DNS changes can take up to an hour. We&apos;ll keep checking automatically.</p>}
    {verification.status === "checked" && <p role="status" className="text-sm text-zinc-400">Domain verified. Your website couldn&apos;t be confirmed automatically, so an editor will review it.</p>}
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
  </section>;
}
