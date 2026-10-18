"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Briefcase,
  AlertCircle,
  KeyRound,
  Check
} from "lucide-react";
import { SafeStorage } from "@/lib/storage";

export function AuthClient({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [authMethod, setAuthMethod] = useState<"password" | "magic">("password");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Founder / CEO");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Helper to commit user and broadcast event
  const commitUserAndRedirect = (userObj: any) => {
    SafeStorage.set("saasfolio_current_user", userObj);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
    }
    setSuccessMessage(`Authenticated as ${userObj.name}! Transferring...`);
    setTimeout(() => {
      router.push(redirectUrl);
    }, 600);
  };

  // 1-Click OAuth Handlers
  const handleOAuthLogin = (provider: "github" | "google") => {
    setIsLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setIsLoading(false);
      if (provider === "github") {
        commitUserAndRedirect({
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
        commitUserAndRedirect({
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
    }, 500);
  };

  // Standard Password Sign-In / Sign-Up
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid work or personal email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setErrorMessage("Please enter your full name or nickname.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const computedHandle = (username.trim() || email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      const displayName = fullName.trim() || computedHandle.charAt(0).toUpperCase() + computedHandle.slice(1);

      commitUserAndRedirect({
        id: `usr_${Date.now()}`,
        username: computedHandle,
        name: displayName,
        email: email.trim(),
        avatarLetter: displayName.charAt(0).toUpperCase(),
        provider: "credentials",
        badge: mode === "signup" ? "NEW MEMBER" : "VERIFIED PRO",
        role: mode === "signup" ? role : "SaaS Operator",
        reputation: mode === "signup" ? 150 : 350,
        joinedDate: "October 2026",
        bio: `Member of SaaSFolio discovering curated software architecture and verified discounts.`,
      });
    }, 600);
  };

  // Passwordless Magic Link Flow
  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address to receive your magic link.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
    }, 500);
  };

  // Simulate clicking the magic link
  const handleSimulateMagicLinkClick = () => {
    const computedHandle = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    const displayName = fullName.trim() || computedHandle.charAt(0).toUpperCase() + computedHandle.slice(1);

    commitUserAndRedirect({
      id: `usr_${Date.now()}`,
      username: computedHandle,
      name: displayName,
      email: email.trim(),
      avatarLetter: displayName.charAt(0).toUpperCase(),
      provider: "magic_link",
      badge: "MEMBER",
      role: role,
      reputation: 200,
      joinedDate: "October 2026",
      bio: "SaaSFolio verified member discovering software stack benchmarks.",
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6FF3D]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO SAASFOLIO
        </Link>

        {/* Auth Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#09090C] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.85)] relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-[11px] text-[#C6FF3D] font-bold uppercase mb-3">
              <Sparkles className="w-3 h-3" /> SAASFOLIO PASSPORT AUTH
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
              {mode === "login" ? "SIGN IN TO PASSPORT" : "CREATE FREE PASSPORT"}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 font-sans">
              {mode === "login"
                ? "Unlock your saved coupon reveals, architecture bookmarks, and founder badges."
                : "Join 10,000+ founders and engineers finding verified software deals & tech benchmarks."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/70 border border-white/10 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
                setMagicLinkSent(false);
              }}
              className={`py-2.5 rounded-lg transition-all font-bold uppercase tracking-wider ${
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
                setErrorMessage("");
                setSuccessMessage("");
                setMagicLinkSent(false);
              }}
              className={`py-2.5 rounded-lg transition-all font-bold uppercase tracking-wider ${
                mode === "signup"
                  ? "bg-[#C6FF3D] text-black shadow-[0_0_15px_rgba(198,255,61,0.25)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Social 1-Click OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
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
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
              <span className="text-[10px] text-zinc-500 font-normal ml-auto">1-Click</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full" />
            <div className="bg-[#09090C] px-3 flex items-center gap-2 relative z-10">
              <button
                type="button"
                onClick={() => setAuthMethod("password")}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  authMethod === "password" ? "bg-white/10 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Password
              </button>
              <span className="text-zinc-600 text-[10px]">•</span>
              <button
                type="button"
                onClick={() => setAuthMethod("magic")}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                  authMethod === "magic" ? "bg-white/10 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Magic Link
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Method A: Password Authentication Form */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jordan Lee"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Handle / Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="jordan_dev"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Professional Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                      >
                        <option value="Founder / CEO">Founder / CEO</option>
                        <option value="Staff Software Engineer">Staff Software Engineer</option>
                        <option value="Full-Stack Developer">Full-Stack Developer</option>
                        <option value="Product & Growth Lead">Product & Growth Lead</option>
                        <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Work / Personal Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Password *
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMethod("magic")}
                      className="text-[11px] font-mono text-[#C6FF3D] hover:underline"
                    >
                      Use Magic Link instead
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-black border-white/20 text-[#C6FF3D] focus:ring-0"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)] flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">Authenticating Session...</span>
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In to Passport" : "Complete Free Registration"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Method B: Magic Link Form */}
          {authMethod === "magic" && (
            <div>
              {magicLinkSent ? (
                <div className="p-6 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#C6FF3D] text-black flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(198,255,61,0.3)]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-lg uppercase">
                      One-Time Magic Link Dispatched
                    </h4>
                    <p className="text-zinc-300 text-xs font-mono mt-1">
                      We dispatched a cryptographic session link to <span className="text-[#C6FF3D]">{email}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateMagicLinkClick}
                    className="w-full py-3 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Complete Instant Sign In</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="font-mono text-xs">Dispatching Link...</span>
                    ) : (
                      <>
                        <span>Send Passwordless Link</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Access Pills */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 text-center mb-3">
              INSTANT DEMO PROFILES (1-CLICK EVALUATION)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#C6FF3D]/40 text-left transition-all group"
              >
                <div className="font-display font-bold text-xs text-white group-hover:text-[#C6FF3D] transition-colors">
                  Alex Chen
                </div>
                <div className="font-mono text-[10px] text-zinc-500">
                  Founder // 640 PTS
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#C6FF3D]/40 text-left transition-all group"
              >
                <div className="font-display font-bold text-xs text-white group-hover:text-[#C6FF3D] transition-colors">
                  Sarah Lin
                </div>
                <div className="font-mono text-[10px] text-zinc-500">
                  Staff Architect // 820 PTS
                </div>
              </button>
            </div>
          </div>

          {/* Footer Security Guarantee */}
          <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF3D]" /> TLS 1.3 Verified
            </span>
            <span>Ed25519 Session Token</span>
          </div>

        </div>

      </div>
    </div>
  );
}
