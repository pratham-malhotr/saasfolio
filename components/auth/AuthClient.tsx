"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";

export function AuthClient({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const saveUserAndRedirect = (userObj: any) => {
    try {
      localStorage.setItem("saasfolio_current_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
    } catch (e) {
      console.error(e);
    }
    router.push(redirectUrl);
  };

  const handleOAuthLogin = (provider: "github" | "google") => {
    setIsLoading(true);
    setTimeout(() => {
      if (provider === "github") {
        saveUserAndRedirect({
          id: "usr_gh_982",
          username: "alex_chen_dev",
          name: "Alex Chen",
          email: "alex@syntaxflow.dev",
          avatarLetter: "A",
          provider: "github",
          badge: "PRO FOUNDER",
          role: "Full-Stack SaaS Architect",
          reputation: 640,
          joinedDate: "October 2026",
          bio: "Building developer tooling and high-concurrency event pipelines. Power user of EdgeBase & DeployJet.",
        });
      } else {
        saveUserAndRedirect({
          id: "usr_goog_412",
          username: "sarah_infra",
          name: "Sarah Lin",
          email: "sarah.lin@cloudscale.io",
          avatarLetter: "S",
          provider: "google",
          badge: "STAFF ARCHITECT",
          role: "Staff Infrastructure Engineer",
          reputation: 820,
          joinedDate: "October 2026",
          bio: "Obsessed with p99 database latency, multi-region Raft replication, and cutting cloud egress bills.",
        });
      }
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
    }, 500);
  };

  const handleSimulateMagicLinkClick = () => {
    const handle = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_") || "founder";
    saveUserAndRedirect({
      id: `usr_${Date.now()}`,
      username: handle,
      name: fullName.trim() || handle.charAt(0).toUpperCase() + handle.slice(1),
      email: email.trim(),
      avatarLetter: (fullName.trim() || handle).charAt(0).toUpperCase(),
      provider: "email",
      badge: "MEMBER",
      role: "Verified Founder / Engineer",
      reputation: 250,
      joinedDate: "October 2026",
      bio: "SaaSFolio verified member discovering verified SaaS coupons and architecture blueprints.",
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C6FF3D]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO SAASFOLIO
        </Link>

        {/* Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0B0E] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-[11px] text-[#C6FF3D] font-bold uppercase mb-3">
              <Sparkles className="w-3 h-3" /> SAASFOLIO PASSPORT
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
              {mode === "login" ? "WELCOME BACK" : "JOIN SAASFOLIO"}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2">
              {mode === "login"
                ? "Access saved coupon codes, upvoted architecture benchmarks, and profile badges."
                : "Get verified deals, submit software, and participate in founder discussions."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/60 border border-white/10 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMagicLinkSent(false);
              }}
              className={`py-2 rounded-lg transition-all font-bold uppercase tracking-wider ${
                mode === "login"
                  ? "bg-[#C6FF3D] text-black shadow-[0_0_15px_rgba(198,255,61,0.25)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMagicLinkSent(false);
              }}
              className={`py-2 rounded-lg transition-all font-bold uppercase tracking-wider ${
                mode === "signup"
                  ? "bg-[#C6FF3D] text-black shadow-[0_0_15px_rgba(198,255,61,0.25)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Social 1-Click OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 group"
            >
              <svg className="w-4 h-4 fill-current text-white group-hover:text-[#C6FF3D] transition-colors" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
              <span className="text-[10px] text-zinc-500 font-normal ml-auto">1-Click</span>
            </button>

            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <span className="text-[10px] text-zinc-500 font-normal ml-auto">1-Click</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0B0B0E] px-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest relative z-10">
              OR EMAIL MAGIC LINK
            </span>
          </div>

          {/* Magic link state */}
          {magicLinkSent ? (
            <div className="p-6 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-[#C6FF3D] text-black flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(198,255,61,0.3)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-lg">Magic Link Dispatched</h4>
                <p className="text-zinc-300 text-xs font-mono mt-1">
                  We sent a cryptographic login link to <span className="text-[#C6FF3D]">{email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulateMagicLinkClick}
                className="w-full py-3 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Complete Instant Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Full Name / Handle
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Work / Founder Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.2)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === "login" ? "Send Magic Link" : "Create Free Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer security badges */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF3D]" /> Zero-Password Auth
            </span>
            <span>Ed25519 Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
