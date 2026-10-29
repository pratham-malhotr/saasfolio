"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type Factor = { id: string; name: string; status: string };
type Setup = { factorId: string; qrCode: string; secret: string };
export function MfaSettings({ required = false, onVerified }: { required?: boolean; onVerified?: () => void }) {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [factorId, setFactorId] = useState("");
  const [level, setLevel] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<{ factors: Factor[]; level: string }>("/api/auth/mfa", undefined, "GET").then(result => {
      if (!active) return;
      setFactors(result.factors); setFactorId(result.factors.find(item => item.status === "verified")?.id || ""); setLevel(result.level);
    }).catch(error => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function enroll() {
    setBusy(true); setError(""); setNotice("");
    try { const result = await apiRequest<Setup>("/api/auth/mfa", { action: "enroll" }); setSetup(result); setFactorId(result.factorId); }
    catch (error) { setError(error instanceof Error ? error.message : "Setup could not be started."); }
    finally { setBusy(false); }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await apiRequest("/api/auth/mfa", { action: "verify", factorId, code }); setFactors(items => items.some(item => item.id === factorId) ? items.map(item => item.id === factorId ? { ...item, status: "verified" } : item) : [...items, { id: factorId, name: "Authenticator", status: "verified" }]); setSetup(null); setCode(""); setLevel("aal2"); setNotice("Authenticator verified for this session."); window.dispatchEvent(new Event("saasfolio_auth_changed")); onVerified?.(); }
    catch (error) { setError(error instanceof Error ? error.message : "Try a fresh code."); }
    finally { setBusy(false); }
  }
  async function cancel(id: string) {
    setBusy(true); setError("");
    try { await apiRequest("/api/auth/mfa", { action: "cancel", factorId: id }); setFactors(items => items.filter(item => item.id !== id)); setSetup(null); }
    catch (error) { setError(error instanceof Error ? error.message : "Setup could not be removed."); }
    finally { setBusy(false); }
  }
  const verified = factors.filter(item => item.status === "verified");
  const qr = setup?.qrCode.startsWith("data:image/svg+xml") ? setup.qrCode : setup ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(setup.qrCode)}` : "";
  return <section className="rounded-2xl border border-white/15 bg-[#09090C] p-6 space-y-5" aria-labelledby="mfa-heading">
    <h2 id="mfa-heading" className="font-display text-2xl font-bold text-white">{required ? "Verify your administrator session" : "Authenticator security"}</h2>
    <p className="text-sm text-zinc-400">{required ? "An authenticator code is required before accessing publishing tools or private submissions." : "Use an authenticator app to add a second verification step to your account."}</p>
    {loading && <p role="status" className="text-zinc-400">Loading security settings…</p>}
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {notice && <p role="status" className="text-[#C6FF3D]">{notice}</p>}
    {level === "aal2" && !setup && <p className="text-[#C6FF3D]">This session has completed two-factor verification.</p>}
    {setup && <div className="space-y-4"><p className="text-sm text-zinc-300">Scan this QR code using your authenticator app, then enter its current code.</p><Image src={qr} alt="QR code for your authenticator setup" width={200} height={200} unoptimized className="bg-white p-3 rounded-xl" /><details><summary className="cursor-pointer text-sm text-zinc-400">Enter the setup key manually</summary><code className="mt-3 block break-all select-all text-zinc-200">{setup.secret}</code></details><button disabled={busy} onClick={() => cancel(setup.factorId)} className="text-sm text-zinc-400 underline">Cancel this setup</button></div>}
    {(setup || verified.length > 0 && level !== "aal2") && <form onSubmit={verify} className="space-y-4 max-w-sm">
      {!setup && verified.length > 1 && <label className="block text-sm text-zinc-300">Authenticator<select value={factorId} onChange={event => setFactorId(event.target.value)} className="block mt-2 w-full p-3 bg-black border border-white/20 rounded-xl">{verified.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      <label className="block text-sm text-zinc-300">Six-digit code<input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required minLength={6} maxLength={6} className="block mt-2 w-full p-3 bg-black border border-white/20 rounded-xl font-mono tracking-widest" /></label>
      <button type="submit" disabled={busy} className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold disabled:opacity-50">{busy ? "Verifying…" : "Verify code"}</button>
    </form>}
    {!loading && !setup && (verified.length === 0 || level === "aal2") && <button disabled={busy} onClick={enroll} className="px-5 py-3 rounded-xl border border-white/20 text-white disabled:opacity-50">{busy ? "Starting setup…" : verified.length ? "Add another authenticator" : "Set up an authenticator"}</button>}
    {factors.filter(item => item.status === "unverified" && item.id !== setup?.factorId).map(item => <p key={item.id} className="text-sm text-zinc-400">Unfinished setup: {item.name} <button disabled={busy} onClick={() => cancel(item.id)} className="underline">Remove unfinished setup</button></p>)}
  </section>;
}
