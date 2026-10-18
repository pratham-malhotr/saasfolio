"use client";

import React, { useState } from "react";
import { Mail, Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { checkRateLimit } from "@/lib/rate-limiter";
import { SafeStorage } from "@/lib/storage";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check sliding window rate limit (max 3 subscribe attempts per minute)
    const rateCheck = checkRateLimit("newsletter_subscribe", 3, 60);
    if (!rateCheck.success) {
      setStatus("error");
      setErrorMessage(rateCheck.message || "Too many attempts. Please wait.");
      return;
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    // Simulate clean serverless submission
    setTimeout(() => {
      setStatus("success");
      SafeStorage.set("saasfolio_newsletter_subscriber", { email, subscribedAt: new Date().toISOString() });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#C6FF3D", "#FFFFFF", "#7C5CFF"],
      });
    }, 700);
  };

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#C6FF3D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0D0D12] to-[#070709] p-8 sm:p-14 text-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(198,255,61,0.06)]">
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#C6FF3D]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              THE TUESDAY SAAS BRIEF // ZERO SPAM
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-black tracking-tighter uppercase text-3xl sm:text-5xl lg:text-6xl text-white mb-4">
            GET THE BEST SAAS DEALS IN YOUR INBOX WEEKLY.
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 font-sans leading-relaxed mb-8">
            Every Tuesday, we deliver verified lifetime deals, newly dropped discount codes, and hands-on stack reviews straight to 10,400+ software founders.
          </p>

          {/* Subscription Form */}
          <div className="max-w-md mx-auto">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-[#C6FF3D]/15 border border-[#C6FF3D] text-[#C6FF3D] font-mono text-sm"
              >
                <div className="flex items-center justify-center gap-2 font-bold mb-1">
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>YOU&apos;RE ON THE VIP LIST!</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  Check your inbox for this week&apos;s curated SaaS discount digest.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-black/80 border border-white/20 focus-within:border-[#C6FF3D] transition-colors">
                  <div className="flex items-center gap-2 pl-3 w-full sm:w-auto flex-1">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="founder@company.com"
                      className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-2 outline-none font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(198,255,61,0.3)] cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <span>{status === "loading" ? "Subscribing..." : "Subscribe Free"}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-400 font-mono">{errorMessage}</p>
                )}
              </form>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF3D]" />
              100% Free Forever
            </span>
            <span>✦</span>
            <span>Unsubscribe Anytime</span>
            <span>✦</span>
            <span>Zero Spam</span>
          </div>
        </div>
      </div>
    </section>
  );
}
