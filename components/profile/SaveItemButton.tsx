"use client";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api-client";

export function SaveItemButton({ kind, slug }: { kind: "deal" | "article"; slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<{ saved: { kind: string; slug: string }[] }>("/api/account", undefined, "GET")
      .then(result => { if (active) setSaved(result.saved.some(item => item.kind === kind && item.slug === slug)); }).catch(() => {});
    return () => { active = false; };
  }, [kind, slug]);
  async function toggle() {
    setBusy(true); setError("");
    try { await apiRequest("/api/account", { kind, slug, saved: !saved }); setSaved(!saved); }
    catch (error) {
      if (error instanceof ApiError && error.status === 401) router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      else setError(error instanceof Error ? error.message : "Couldn’t save. Please try again.");
    } finally { setBusy(false); }
  }
  return <div className="relative">
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={saved ? "Remove saved item" : "Save item to your account"}
      className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs disabled:opacity-50 ${saved ? "bg-[#C6FF3D]/10 border-[#C6FF3D]/40 text-[#C6FF3D]" : "bg-white/5 border-white/10 text-zinc-300"}`}>
      <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />{busy ? "Saving…" : saved ? "Saved" : "Save"}
    </button>
    {error && <p role="alert" className="absolute top-full right-0 z-20 w-64 mt-2 p-3 rounded-xl bg-[#151519] text-xs text-rose-400 border border-white/10">{error}</p>}
  </div>;
}
