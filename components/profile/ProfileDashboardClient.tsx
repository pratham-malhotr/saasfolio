"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api-client";

type SavedItem = { kind: "deal" | "article"; slug: string; title: string; href: string | null; created_at: string };
type Account = { user: { name: string; email: string; isAdmin: boolean }; saved: SavedItem[]; bio: string };

export function ProfileDashboardClient() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    apiRequest<Account>("/api/account", undefined, "GET").then(result => {
      if (active) { setAccount(result); setName(result.user.name); setBio(result.bio); }
    }).catch(error => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401) router.replace("/login?redirect=/profile");
      else setError(error.message || "Your account could not be loaded.");
    });
    return () => { active = false; };
  }, [router]);
  async function remove(item: SavedItem) {
    setError(""); setBusy(true);
    try { await apiRequest("/api/account", { kind: item.kind, slug: item.slug, saved: false }); setAccount(previous => previous ? { ...previous, saved: previous.saved.filter(saved => saved.kind !== item.kind || saved.slug !== item.slug) } : null); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { await apiRequest("/api/account", { name, bio }, "PATCH"); setNotice("Your profile has been saved."); window.dispatchEvent(new Event("saasfolio_auth_changed")); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { await apiRequest("/api/auth/logout", {}); window.dispatchEvent(new Event("saasfolio_auth_changed")); router.replace("/login"); router.refresh(); }
    catch (error) { setBusy(false); setError(error instanceof Error ? error.message : "Sign out failed."); }
  }
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 space-y-10">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-3"><p className="text-[#C6FF3D] font-mono text-xs uppercase tracking-widest">Your account</p><h1 className="font-display text-4xl font-bold text-white">{account ? `Welcome, ${account.user.name}` : "Your saved software"}</h1><p className="text-sm text-zinc-400">{account?.user.email || "Loading your account…"}</p></div>{account && <button disabled={busy} onClick={logout} className="text-sm text-zinc-300 border border-white/15 px-4 py-2 rounded-xl">Sign out</button>}</header>
    {error && <p role="alert" className="text-rose-400 p-4 rounded-xl bg-rose-500/10">{error}</p>}
    {notice && <p role="status" className="text-[#C6FF3D]">{notice}</p>}
    {account && <>
      <section className="space-y-5"><h2 className="text-2xl text-white font-display font-bold">Saved deals & articles ({account.saved.length})</h2>
        {account.saved.length === 0 ? <div className="rounded-2xl border border-white/10 p-8 space-y-3 text-zinc-400"><p>You haven’t saved anything yet. Use the Save button on an offer or article.</p><Link href="/deals" className="inline-block text-[#C6FF3D] underline">Explore software offers →</Link></div> : <ul className="space-y-3">{account.saved.map(item => <li key={`${item.kind}:${item.slug}`} className="rounded-2xl border border-white/10 p-5 flex items-center justify-between gap-4"><div><p className="text-xs text-zinc-500 uppercase mb-2">{item.kind}</p>{item.href ? <Link href={item.href} className="text-white hover:text-[#C6FF3D]">{item.title}</Link> : <p className="text-zinc-400">{item.title}</p>}</div><button disabled={busy} onClick={() => remove(item)} className="text-sm text-zinc-400 hover:text-rose-400">Remove<span className="sr-only"> {item.title}</span></button></li>)}</ul>}
      </section>
      <section className="rounded-2xl border border-white/10 p-6 space-y-5"><h2 className="font-display text-2xl text-white font-bold">Profile settings</h2><form onSubmit={save} className="space-y-4 max-w-xl"><label className="block text-sm text-zinc-300">Display name<input value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" className="mt-2 w-full rounded-xl p-3 bg-black border border-white/15 text-white" /></label><label className="block text-sm text-zinc-300">About you<textarea value={bio} onChange={event => setBio(event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl p-3 bg-black border border-white/15 text-white" /></label><button disabled={busy} type="submit" className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold disabled:opacity-50">{busy ? "Saving…" : "Save profile"}</button></form><Link href="/reset-password" className="inline-block text-sm text-zinc-400 underline">Change password</Link></section>
      {account.user.isAdmin && <Link href="/admin" className="inline-block text-[#C6FF3D] underline">Open the review inbox →</Link>}
    </>}
  </div>;
}
