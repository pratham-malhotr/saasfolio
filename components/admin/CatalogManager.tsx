"use client";
import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/catalog-categories";
import { blankCatalogEntry, EDITOR_FIELDS, type EditorField } from "@/lib/catalog-editor";
import type { StaffRole } from "@/lib/server/staff";

type Entry = { id: string; slug: string; kind: string; state: string; revision: number; payload: Record<string, unknown>; updated_at: string; hasPublication?: boolean };
type Release = { entries: Entry[]; deployedRevision: number; releaseRevision: number; nextCursor: string | null };
type Revision = { revision: number; created_at: string; payload: Record<string, unknown> };
const inputClass = "block mt-2 w-full p-3 rounded-xl bg-black border border-white/20 text-zinc-200 disabled:opacity-60";
const buttonClass = "px-4 py-2 rounded-xl border border-white/20 text-white disabled:opacity-50";

export function CatalogManager({ role }: { role: StaffRole }) {
  const [release, setRelease] = useState<Release | null>(null), [selected, setSelected] = useState<Entry | null>(null);
  const [kind, setKind] = useState("brand"), [slug, setSlug] = useState("");
  const [payload, setPayload] = useState<Record<string, unknown>>(() => blankCatalogEntry("brand"));
  const [history, setHistory] = useState<Revision[]>([]), [busy, setBusy] = useState("");
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false), [preview, setPreview] = useState(false);
  const canEdit = role === "owner" || role === "editor";
  const editable = canEdit && !busy;
  useEffect(() => { let active = true; apiRequest<Release>("/api/admin/catalog", undefined, "GET").then(result => { if (active) setRelease(result); }).catch(error => { if (active) setError(error.message); }); return () => { active = false; }; }, []);
  useEffect(() => { const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [dirty]);
  function change(key: string, value: unknown) { setPayload(previous => ({ ...previous, [key]: value })); setDirty(true); }
  function choose(entry: Entry | null, nextKind = kind) {
    if (dirty && !window.confirm("Discard the unsaved changes in this draft?")) return;
    setSelected(entry); setKind(entry?.kind || nextKind); setSlug(entry?.slug || ""); setPayload(entry ? structuredClone(entry.payload) : blankCatalogEntry(nextKind)); setDirty(false); setHistory([]); setError(""); setNotice("");
  }
  function showError(error: unknown) { setError(error instanceof ApiError && error.requestId ? `${error.message} Reference: ${error.requestId}` : error instanceof Error ? error.message : "The action could not be completed."); }
  async function refresh() { setRelease(await apiRequest<Release>("/api/admin/catalog", undefined, "GET")); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy("save"); setError(""); setNotice("");
    const normalized = { ...payload };
    for (const field of EDITOR_FIELDS[kind]) if (field.type === "lines" && Array.isArray(normalized[field.key])) normalized[field.key] = (normalized[field.key] as string[]).map(item => item.trim()).filter(Boolean);
    try { const result = await apiRequest<{ entry: Entry }>("/api/admin/catalog", { action: "save", kind, slug, payload: normalized, revision: selected?.revision || 0 }); setSelected({ ...result.entry, hasPublication: selected?.hasPublication || selected?.state === "published" }); setPayload(result.entry.payload); setDirty(false); setNotice("Draft saved. A different account must review the last edit before release."); await refresh(); }
    catch (error) { showError(error); } finally { setBusy(""); }
  }
  async function transition(action: string, restoreRevision?: number) {
    if (!selected) return;
    if (dirty) { setError("Save or discard your changes before changing the review state."); return; }
    if (action === "retire" && !window.confirm("Retire this publication in the next release? Its previous revision remains in history.")) return;
    setBusy(action); setError(""); setNotice("");
    try {
      const result = await apiRequest<{ entry?: Entry; message?: string }>("/api/admin/catalog", { action, id: selected.id, revision: selected.revision, ...(restoreRevision ? { restoreRevision } : {}) });
      if (result.entry) { setSelected({ ...result.entry, hasPublication: action === "retire" ? false : action === "publish" || selected.hasPublication }); setPayload(result.entry.payload); setDirty(false); }
      setNotice(result.message || (["publish", "retire"].includes(action) ? "Revision approved for release. Public pages change after release checks and deployment." : action === "restore" ? "Previous content restored as a new draft. It requires another review." : "Review state updated.")); await refresh();
    } catch (error) { showError(error); } finally { setBusy(""); }
  }
  async function revisions() { if (!selected) return; setBusy("history"); setError(""); try { const result = await apiRequest<{ history: Revision[] }>(`/api/admin/catalog?id=${selected.id}`, undefined, "GET"); setHistory(result.history); } catch (error) { showError(error); } finally { setBusy(""); } }
  async function more() { if (!release?.nextCursor) return; setBusy("more"); try { const next = await apiRequest<Release>(`/api/admin/catalog?before=${encodeURIComponent(release.nextCursor)}`, undefined, "GET"); setRelease(previous => previous ? { ...next, entries: [...previous.entries, ...next.entries.filter(item => !previous.entries.some(old => old.id === item.id))] } : next); } catch (error) { showError(error); } finally { setBusy(""); } }
  function fieldView(field: EditorField) {
    const { key, label } = field;
    if (field.children) {
      const children = field.children;
      const rows = Array.isArray(payload[key]) ? payload[key] as Record<string, string>[] : [];
      return <fieldset key={key} className="space-y-4 rounded-xl border border-white/10 p-4"><legend className="px-2 text-white font-semibold">{label}</legend>{rows.map((row, index) => <fieldset key={index} className="space-y-3 rounded-lg bg-white/[0.03] p-4"><legend className="text-xs text-zinc-400">{label} {index + 1}</legend>{children.map(([name, caption]) => <label key={name} className="block text-sm text-zinc-300">{caption}<textarea rows={["text", "answer", "terms"].includes(name) ? 5 : 2} value={typeof row[name] === "string" ? row[name] : ""} disabled={!editable} onChange={event => change(key, rows.map((item, position) => position === index ? { ...item, [name]: event.target.value } : item))} className={inputClass} /></label>)}{editable && rows.length > (field.minimum || 0) && <button type="button" onClick={() => change(key, rows.filter((_, position) => position !== index))} className="text-xs text-zinc-400 underline">Remove this item</button>}</fieldset>)}{editable && <button type="button" onClick={() => change(key, [...rows, Object.fromEntries(children.map(([name]) => [name, ""]))])} className="text-sm text-[#C6FF3D] underline">Add {label.toLowerCase()}</button>}</fieldset>;
    }
    const choices = field.type === "category" ? CATEGORIES.map(category => [category.slug, category.name]) : field.choices?.map(value => [value, value]);
    if (choices) return <label className="block text-sm text-zinc-300" key={key}>{label}<select value={String(payload[key] || "")} disabled={!editable} onChange={event => change(key, event.target.value)} className={inputClass}>{choices.map(([value, caption]) => <option key={value} value={value}>{caption}</option>)}</select></label>;
    if (field.type === "long" || field.type === "lines") return <label className="block text-sm text-zinc-300" key={key}>{label}<textarea rows={5} disabled={!editable} value={field.type === "lines" ? Array.isArray(payload[key]) ? (payload[key] as string[]).join("\n") : "" : String(payload[key] || "")} onChange={event => change(key, field.type === "lines" ? event.target.value.split("\n") : event.target.value)} className={inputClass} /></label>;
    return <label className="block text-sm text-zinc-300" key={key}>{label}<input type={field.type || "text"} value={String(payload[key] ?? "")} disabled={!editable} onChange={event => change(key, field.type === "number" ? Number(event.target.value) : event.target.value)} className={inputClass} /></label>;
  }
  const words = Array.isArray(payload.sections) ? (payload.sections as { text?: string }[]).map(item => item.text || "").join(" ").trim().split(/\s+/).filter(Boolean).length : 0;
  return <section className="space-y-6" aria-labelledby="catalog-manager-heading"><h2 id="catalog-manager-heading" className="text-2xl text-white font-display font-bold">Brands, guides and offers</h2>
    {release && <p className="text-sm text-zinc-400">Website release: {release.deployedRevision} · Approved release: {release.releaseRevision}. {release.releaseRevision > release.deployedRevision ? "Approved changes are awaiting release checks and deployment." : "This website contains the current approved release."}</p>}
    {error && <p role="alert" className="text-rose-400 rounded-xl border border-rose-500/30 p-4 break-words">{error}</p>}{notice && <p role="status" className="text-[#C6FF3D] rounded-xl border border-[#C6FF3D]/30 p-4">{notice}</p>}
    <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)] gap-6"><aside className="space-y-4 min-w-0"><div className="flex flex-wrap gap-2">{canEdit && ["brand", "guide", "offer"].map(value => <button type="button" key={value} onClick={() => choose(null, value)} className={buttonClass}>New {value}</button>)}</div>{!release && !error && <p role="status" className="text-zinc-400">Loading drafts…</p>}{release?.entries.length === 0 && <p className="text-sm text-zinc-400">No managed drafts yet. Create a brand, a complete guide or an explicitly sourced offer.</p>}<ul className="space-y-2">{release?.entries.map(entry => <li key={entry.id}><button type="button" onClick={() => choose(entry)} aria-pressed={selected?.id === entry.id} className={`w-full text-left p-3 rounded-xl border break-words ${selected?.id === entry.id ? "border-[#C6FF3D] text-white" : "border-white/15 text-zinc-300"}`}><span className="block text-sm font-semibold">{entry.slug}</span><span className="text-xs text-zinc-500">{entry.kind} · {entry.state} · revision {entry.revision}</span></button></li>)}</ul>{release?.nextCursor && <button type="button" disabled={!!busy} onClick={more} className="text-sm text-[#C6FF3D] underline">Load earlier drafts</button>}</aside>
    <div className="min-w-0 space-y-5"><h3 className="font-display text-xl text-white font-semibold">{selected ? `${selected.slug} · ${selected.state} · revision ${selected.revision}` : `New ${kind}`} {dirty && <span className="text-sm text-zinc-400">Unsaved changes</span>}</h3>
    <form onSubmit={save} className="space-y-5 rounded-2xl border border-white/15 p-5 sm:p-7"><label className="block text-sm text-zinc-300">Canonical URL slug<input value={slug} disabled={!editable || !!selected} onChange={event => { setSlug(event.target.value); setDirty(true); }} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} required className={inputClass} /><span className="block mt-2 text-xs text-zinc-500">Keep an existing brand or offer on its established URL.</span></label>{EDITOR_FIELDS[kind].map(fieldView)}{kind === "guide" && <p className="text-xs text-zinc-400">{words} words in buying sections; at least 280 are required.</p>}<div className="flex flex-wrap gap-3">{canEdit && <button type="submit" disabled={!!busy} className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold disabled:opacity-50">{busy === "save" ? "Saving…" : "Save draft"}</button>}<button type="button" onClick={() => setPreview(value => !value)} className={buttonClass}>{preview ? "Hide preview" : "Preview content"}</button></div></form>
    {preview && <section className="rounded-2xl border border-[#C6FF3D]/30 p-6 space-y-4 break-words" aria-label="Unpublished content preview"><p className="text-xs text-[#C6FF3D] uppercase">Unpublished preview</p><h3 className="text-2xl text-white font-display">{String(payload.searchTitle || payload.title || payload.name || "Untitled draft")}</h3><p className="text-zinc-400 whitespace-pre-wrap">{String(payload.metaDescription || payload.description || payload.terms || "")}</p>{Array.isArray(payload.sections) && (payload.sections as { heading?: string; text?: string }[]).map((section, index) => <div key={index}><h4 className="text-white font-semibold">{section.heading}</h4><p className="text-zinc-400 whitespace-pre-wrap">{section.text}</p></div>)}</section>}
    {selected && <section className="rounded-2xl border border-white/15 p-5 space-y-4"><h3 className="text-lg text-white font-semibold">Review and release</h3><p className="text-sm text-zinc-400">A different account must approve the last edit. Offers also need a current source check. Source checks establish published wording, not checkout acceptance.</p><div className="flex flex-wrap gap-3">
      {canEdit && selected.state === "draft" && <button disabled={!!busy || dirty} onClick={() => transition("submit")} className={buttonClass}>Submit for review</button>}
      {role !== "editor" && selected.state === "in_review" && <>{kind === "offer" && <button disabled={!!busy} onClick={() => transition("check_source")} className={buttonClass}>{busy === "check_source" ? "Checking source…" : "Check public source"}</button>}<button disabled={!!busy} onClick={() => transition("approve")} className={buttonClass}>Approve revision</button><button disabled={!!busy} onClick={() => transition("reject")} className={buttonClass}>Return to draft</button></>}
      {role === "owner" && selected.state === "approved" && <button disabled={!!busy} onClick={() => transition("publish")} className="px-4 py-2 rounded-xl bg-[#C6FF3D] text-black font-bold">Approve for release</button>}
      {role === "owner" && (selected.hasPublication || selected.state === "published") && <button disabled={!!busy} onClick={() => transition("retire")} className={buttonClass}>Retire in next release</button>}
      <button disabled={!!busy} onClick={revisions} className={buttonClass}>View revision history</button>
    </div>{history.length > 0 && <ol className="space-y-2">{history.map(item => <li key={item.revision} className="flex flex-wrap justify-between items-center gap-3 border border-white/10 rounded-xl p-3 text-sm text-zinc-400">Revision {item.revision} · {new Date(item.created_at).toLocaleString()}{canEdit && item.revision !== selected.revision && <button disabled={!!busy} onClick={() => transition("restore", item.revision)} className="text-[#C6FF3D] underline">Restore as a new draft</button>}</li>)}</ol>}</section>}
    </div></div>
  </section>;
}
