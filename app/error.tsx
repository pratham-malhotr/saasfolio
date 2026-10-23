"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";

/**
 * Enterprise Resilient Error Boundary
 * 
 * System Design Principle: Graceful Degradation & Blast-Radius Containment
 * Prevents full-site crashes and provides self-healing recovery actions.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console/telemetry safely
    console.error("[SaaSFolio System Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#120808] border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
        SYSTEM RECOVERY PROTOCOL // FAULT DETECTED
      </div>

      <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter text-white mb-4">
        SOMETHING INTERRUPTED THE STREAM
      </h1>

      <p className="max-w-md text-sm text-zinc-400 font-sans leading-relaxed mb-6">
        An isolated client exception was caught by the SaaSFolio resilience layer. 
        Your session and data remain secure.
      </p>

      {error?.digest && (
        <div className="mb-8 font-mono text-xs text-zinc-500 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
          DIGEST REF: <span className="text-zinc-300">{error.digest}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Attempt Auto-Recovery</span>
        </button>

        <Link
          href="/deals"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <span>Return to Deals Hub</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
