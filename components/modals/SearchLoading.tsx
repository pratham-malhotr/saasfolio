"use client";

import { X } from "lucide-react";
import { useDialog } from "@/components/modals/useDialog";

export function SearchLoading() {
  const close = () => window.dispatchEvent(new Event("saasfolio_search_close"));
  const ref = useDialog(true, close);
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 px-4 pt-[15vh]" onClick={close}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Search SaaSFolio" tabIndex={-1} className="flex w-full max-w-2xl items-center justify-between rounded-2xl border border-white/15 bg-[#0D0D10] p-6 text-zinc-300" onClick={event => event.stopPropagation()}>
        <p role="status">Loading search…</p>
        <button type="button" onClick={close} aria-label="Close search" className="p-2"><X className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
