"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Check if user has already seen the preloader this session
    try {
      const hasSeen = sessionStorage.getItem("saasfolio_preloader_seen");
      if (hasSeen === "true") {
        setLoading(false);
        return;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }

    // Failsafe safety timeout: ensure preloader unmounts within 1.2s regardless of animation state
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem("saasfolio_preloader_seen", "true");
      } catch {}
    }, 1200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLoading(false);
        try {
          sessionStorage.setItem("saasfolio_preloader_seen", "true");
        } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Smooth counter to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            try {
              sessionStorage.setItem("saasfolio_preloader_seen", "true");
            } catch {
              // Ignore
            }
          }, 250);
          return 100;
        }
        // Accelerate smoothly
        const step = prev < 50 ? 8 : prev < 85 ? 10 : 6;
        return Math.min(100, prev + step);
      });
    }, 35);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

  const dismiss = () => {
    setLoading(false);
    try {
      sessionStorage.setItem("saasfolio_preloader_seen", "true");
    } catch {}
  };

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader"
          onClick={dismiss}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#000000] text-white select-none overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#C6FF3D]/10 blur-[120px] pointer-events-none" />

          {/* Center Brand Elements */}
          <div className="relative flex flex-col items-center">
            {/* Animated Logo Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-16 h-16 rounded-xl bg-black border border-white/20 p-3 mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(198,255,61,0.2)] shrink-0"
              style={{ width: 64, height: 64 }}
            >
              <svg viewBox="0 0 32 32" fill="none" width={40} height={40} className="w-full h-full block">
                <path
                  d="M9 7L5 11V21L9 25"
                  stroke="#EDEDED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 8L11 16H20L13 24"
                  stroke="#C6FF3D"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 7L27 11V21L23 25"
                  stroke="#EDEDED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-display font-black tracking-tighter uppercase mb-2"
            >
              SAAS<span className="text-[#C6FF3D]">FOLIO</span>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-xs tracking-widest text-zinc-400 uppercase mb-8"
            >
              DISCOVER ✦ SAVE ✦ SCALE
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-56 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-4">
              <motion.div
                className="h-full bg-[#C6FF3D] shadow-[0_0_12px_#C6FF3D]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage Display */}
            <div className="font-mono text-sm tracking-wider text-[#C6FF3D] font-bold">
              {progress.toString().padStart(3, "0")}%
            </div>

            {/* Skip hint */}
            <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase mt-4 hover:text-[#C6FF3D] transition-colors">
              Click anywhere or press Esc to enter ↗
            </div>
          </div>

          {/* Editorial corner details */}
          <div className="absolute bottom-8 left-8 hidden sm:block font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            SAASFOLIO // VERIFIED DEALS ENGINE
          </div>
          <div className="absolute bottom-8 right-8 hidden sm:block font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            EDITION 2026.1 // PRODUCTION
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
