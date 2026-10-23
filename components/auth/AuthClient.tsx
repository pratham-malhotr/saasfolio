"use client";
import { useServiceAvailability } from "@/lib/use-service-availability";
import { ServiceNotice } from "@/components/forms/ServiceNotice";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

export function AuthClient({ initialMode = "login" }: { initialMode?: "login" | "signup" | "password" }) {
  const { status: serviceStatus, available: serviceAvailable } = useServiceAvailability("accountsConfigured");
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "reset" | "password">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "confirmation" ? "That confirmation link could not be used. Request a fresh link or try signing in." : "");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const heading = mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : mode === "password" ? "Choose a new password" : "Welcome back";

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const result = await apiRequest<{ user?: unknown; message?: string }>(`/api/auth/${mode}`, { name, email, password });
      if (result.user || mode === "password") {
        window.dispatchEvent(new Event("saasfolio_auth_changed"));
        const redirect = params.get("redirect");
        router.replace(redirect && /^\/(?!\/)/.test(redirect) && !/[\\\u0000-\u0020]/.test(redirect) ? redirect : "/profile");
        router.refresh();
      } else setNotice(result.message || "Your request has been saved.");
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  function changeMode(next: "login" | "signup" | "reset") { setMode(next); setPassword(""); setError(""); setNotice(""); }

  return <div className="max-w-lg mx-auto px-4 pt-32 pb-24">
    <Link href="/" className="text-sm text-zinc-400 hover:text-white">← Back to SaaSFolio</Link>
    <div className="mt-6 rounded-3xl p-6 sm:p-10 border border-white/10 bg-[#09090C] space-y-6">
      <header className="space-y-3"><p className="font-mono text-xs uppercase text-[#C6FF3D] tracking-widest">Your SaaSFolio account</p><h1 className="font-display font-bold text-3xl text-white">{heading}</h1><p className="text-sm text-zinc-400">Save software offers and articles to revisit across your devices.</p></header>
      {error && <p role="alert" className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm">{error}</p>}
      {notice && <p role="status" className="p-3 rounded-xl bg-[#C6FF3D]/10 text-[#C6FF3D] text-sm">{notice}</p>}
      <form onSubmit={submit} className="space-y-5">
        <ServiceNotice status={serviceStatus} />
        <fieldset disabled={!serviceAvailable} className="contents">
          <legend className="sr-only">Form details</legend>
          {mode === "signup" && <label className="block text-sm text-zinc-300">Name<input name="name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-xl p-3 bg-black border border-white/15 text-white" /></label>}
          {mode !== "password" && <label className="block text-sm text-zinc-300">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl p-3 bg-black border border-white/15 text-white" /></label>}
          {mode !== "reset" && <div><label htmlFor="account-password" className="block text-sm text-zinc-300">Password</label><div className="relative mt-2"><input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? 1 : 12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl p-3 pr-20 bg-black border border-white/15 text-white" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} className="absolute right-3 top-3 text-sm text-zinc-400">{showPassword ? "Hide" : "Show"}</button></div>{mode !== "login" && <p className="mt-2 text-xs text-zinc-500">Use at least 12 characters. Password managers and pasting are supported.</p>}</div>}
          <button type="submit" disabled={busy} className="w-full rounded-xl py-3 bg-[#C6FF3D] text-black font-bold disabled:opacity-50">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset email" : mode === "password" ? "Save new password" : "Sign in"}</button>
        </fieldset>
      </form>
      <div className="flex flex-wrap gap-4 text-sm text-[#C6FF3D]">{mode !== "login" && <button onClick={() => changeMode("login")}>Sign in</button>}{mode !== "signup" && <button onClick={() => changeMode("signup")}>Create an account</button>}{mode === "login" && <button onClick={() => changeMode("reset")}>Forgot password?</button>}</div>
      <p className="text-xs text-zinc-500">By creating an account, you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
    </div>
  </div>;
}
