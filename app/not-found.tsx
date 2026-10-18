import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4 pt-20">
      <div className="relative mb-6">
        <div className="font-display font-black text-8xl sm:text-9xl text-white/[0.08] tracking-tighter select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center font-display font-black text-5xl sm:text-6xl text-[#C6FF3D] tracking-tighter">
          404
        </div>
      </div>

      <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
        RESOURCE NOT LOCATED // VOID DETECTED
      </div>
      <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-4">
        LOST IN THE SAAS MATRIX
      </h1>
      <p className="max-w-md text-sm text-zinc-400 mb-8 font-sans">
        The tool, discount code, or editorial page you were seeking has migrated or expired. Return to the discovery grid to explore active deals.
      </p>

      <Link
        href="/"
        className="px-6 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.3)]"
      >
        <Home className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
