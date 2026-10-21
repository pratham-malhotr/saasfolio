export default function Loading() {
  return <div role="status" className="max-w-6xl mx-auto px-6 pt-36 pb-24 space-y-6" aria-live="polite">
    <span className="sr-only">Loading the page…</span>
    <div aria-hidden="true" className="h-10 w-2/3 rounded-xl bg-white/5 animate-pulse" />
    <div aria-hidden="true" className="h-5 w-1/2 rounded bg-white/5 animate-pulse" />
    <div aria-hidden="true" className="grid sm:grid-cols-2 gap-5"><div className="h-48 rounded-2xl bg-white/5 animate-pulse" /><div className="h-48 rounded-2xl bg-white/5 animate-pulse" /></div>
  </div>;
}
