"use client";

import React, { useState } from "react";
import { Mail, Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [consent, setConsent] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    const honeypot = new FormData(e.currentTarget).get("companyWebsite");
    setStatus("loading"); setErrorMessage("");
    try {
      await apiRequest("/api/newsletter", { email, consent, companyWebsite: honeypot });
      setStatus("success");
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ["#C6FF3D", "#FFFFFF"], disableForReducedMotion: true });
    } catch (error) { setStatus("error"); setErrorMessage(error instanceof Error ? error.message : "Please try again later."); }
  };

  return (
    <section id="newsletter" className="py-24 bg-[#050505] relative overflow-hidden">
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
            Get software offers, brand savings guides, and new articles. Confirm your email to join; unsubscribe using the link in your signup email or any future edition.
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
                  <span>CHECK YOUR INBOX</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  If your address needs confirmation, a signup email has been requested. Check your inbox and spam folder to confirm.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" aria-busy={status === "loading"}>
                <input name="companyWebsite" aria-label="Leave this field empty" tabIndex={-1} autoComplete="off" className="hidden" />
                <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-black/80 border border-white/20 focus-within:border-[#C6FF3D] transition-colors">
                  <div className="flex items-center gap-2 pl-3 w-full sm:w-auto flex-1">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <input
                      type="email" aria-label="Email address" autoComplete="email" required maxLength={254}
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

                <label className="flex items-start gap-2 text-left text-xs text-zinc-400"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required className="mt-0.5" /><span>I agree to receive the SaaSFolio newsletter. See the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span></label>
                {status === "error" && (
                  <p role="alert" className="text-xs text-red-400 font-mono">{errorMessage}</p>
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
