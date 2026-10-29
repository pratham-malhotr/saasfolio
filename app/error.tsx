"use client";
import { useEffect } from "react";
import Link from "next/link";
import { errorReference, reportClientError } from "@/lib/client-diagnostics";
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => { reportClientError(error); }, [error]);
  return <div className="min-h-[70vh] px-4 pt-40 pb-24 text-center text-white"><h1 className="font-display text-3xl font-bold mb-4">This page could not load</h1><p className="text-zinc-400 mb-6">Please try again. If the problem continues, contact support.</p>{errorReference(error) && <p className="font-mono text-sm text-zinc-400 mb-6">Reference: {errorReference(error)}</p>}<div className="flex justify-center flex-wrap gap-4"><button type="button" onClick={retry} className="rounded-lg bg-[#C6FF3D] px-6 py-3 text-black font-semibold">Try again</button><Link href="/contact" className="rounded-lg border border-white/20 px-6 py-3">Contact support</Link><Link href="/deals" className="rounded-lg border border-white/20 px-6 py-3">Browse deals</Link></div></div>;
}
