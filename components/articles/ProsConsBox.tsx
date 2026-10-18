import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProsConsBoxProps {
  toolName?: string;
  pros: string[];
  cons: string[];
}

export function ProsConsBox({ toolName, pros, cons }: ProsConsBoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-[#09090C] border border-white/10 overflow-hidden">
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
        <h4 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
          {toolName ? `${toolName} — Honest Take` : "Pros & Cons Analysis"}
        </h4>
        <span className="font-mono text-xs text-zinc-500">Editorial Verdict</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* Pros Column */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#C6FF3D] font-mono text-xs uppercase font-bold tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> The Strengths (Pros)
          </div>
          <ul className="space-y-3">
            {pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <span className="text-[#C6FF3D] mt-0.5 font-bold">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons Column */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-mono text-xs uppercase font-bold tracking-wider">
            <XCircle className="w-4 h-4" /> The Trade-offs (Cons)
          </div>
          <ul className="space-y-3">
            {cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
