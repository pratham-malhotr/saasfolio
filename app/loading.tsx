import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="relative flex items-center justify-center w-14 h-14 mb-4">
        {/* Pulsing radar rings */}
        <div className="absolute inset-0 rounded-xl border border-[#C6FF3D]/40 animate-ping opacity-30" />
        <div className="w-12 h-12 rounded-xl bg-black border border-white/20 flex items-center justify-center p-2.5 shadow-[0_0_20px_rgba(198,255,61,0.2)]">
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <path
              d="M19 8L11 16H20L13 24"
              stroke="#C6FF3D"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="font-mono text-xs tracking-widest text-[#C6FF3D] uppercase font-bold animate-pulse">
        CALIBRATING SAAS FEED...
      </div>
    </div>
  );
}
