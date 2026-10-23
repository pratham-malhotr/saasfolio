"use client";

import { useServiceAvailability } from "@/lib/use-service-availability";
import { ServiceNotice } from "@/components/forms/ServiceNotice";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Check,
  ChevronLeft
} from "lucide-react";

export function AuthClient({ initialMode = "login" }: { initialMode?: "login" | "signup" | "password" }) {
  const { status: serviceStatus, available: serviceAvailable } = useServiceAvailability("accountsConfigured");
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect") || "";
  const isFromSubmit = redirectParam.includes("/submit");

  const [mode, setMode] = useState<"login" | "signup" | "reset" | "password">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    params.get("error") === "confirmation"
      ? "That confirmation link could not be used. Request a fresh link or try signing in."
      : ""
  );
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation for sign up
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "Enter password", color: "bg-zinc-700" };
    let score = 0;
    if (password.length >= 12) score += 40;
    else if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    if (score < 40) return { score, label: "Weak (min 12 chars required)", color: "bg-rose-500" };
    if (score < 70) return { score, label: "Fair", color: "bg-amber-400" };
    if (score < 90) return { score, label: "Good", color: "bg-emerald-400" };
    return { score, label: "Excellent & Secure", color: "bg-[#C6FF3D]" };
  }, [password]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest<{ user?: unknown; message?: string }>(`/api/auth/${mode}`, {
        name,
        email,
        password,
      });
      if (result.user || mode === "password") {
        window.dispatchEvent(new Event("saasfolio_auth_changed"));
        const redirect = params.get("redirect");
        const safeDestination =
          redirect && /^\/(?!\/)/.test(redirect) && !/[\\\u0000-\u0020]/.test(redirect)
            ? redirect
            : "/profile";
        router.replace(safeDestination);
        router.refresh();
      } else {
        setNotice(result.message || "Your request has been saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function changeMode(next: "login" | "signup" | "reset") {
    setMode(next);
    setPassword("");
    setError("");
    setNotice("");
  }

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "reset"
      ? "Reset your password"
      : mode === "password"
      ? "Choose a new password"
      : "Welcome back";

  const subtitle =
    mode === "signup"
      ? "Join verified builders and shoppers. Submit working codes, earn karma, and unlock deals."
      : mode === "reset"
      ? "Enter your email address and we'll send you an encrypted password recovery link."
      : mode === "password"
      ? "Enter your new password below (must be at least 12 characters)."
      : "Sign in to access your personal deal vault, bookmarks, and submit verified promo codes.";

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C6FF3D]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Navigation back */}
        <Link
          href={redirectParam || "/"}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{redirectParam ? "BACK TO PREVIOUS PAGE" : "BACK TO DISCOVERY HOME"}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Hero Perks (Visible on lg screens) */}
          <div className="lg:col-span-5 space-y-6 lg:pr-4 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/25 font-mono text-[11px] text-[#C6FF3D] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] animate-pulse" />
              SaaSFolio Community Pass
            </div>

            <h2 className="font-display font-black text-3xl xl:text-4xl tracking-tight text-white leading-tight">
              Submit Working Codes. <br />
              <span className="text-[#C6FF3D]">Never Pay Full Price.</span>
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed">
              SaaSFolio is built on transparency. Our automated verification system checks every promo code at checkout so you only see discounts that actually work.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center justify-center shrink-0 text-[#C6FF3D]">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Submit Promo & Referral Codes</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Discovered a working discount code? Share it with the community and earn contributor attribution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center justify-center shrink-0 text-[#C6FF3D]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Automated Verification Engine</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Our algorithms verify checkout endpoints, SSL, and parameters before publishing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center justify-center shrink-0 text-[#C6FF3D]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Personal Deal Vault</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Bookmark software deals, track renewal dates, and sync across your devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>✓ 1,600+ Active Deals</span>
              <span>✓ 0% Spam Guarantee</span>
              <span>✓ 100% Free</span>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-6 sm:p-10 border border-white/10 bg-[#0A0A0D]/90 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] space-y-6 relative">
              {/* Context banner when redirected from /submit */}
              {isFromSubmit && (
                <div className="p-3.5 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#C6FF3D] text-black flex items-center justify-center shrink-0 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-[#C6FF3D] block">Sign In Required To Submit Codes</span>
                    <span className="text-zinc-300">
                      Sign in or register to submit promo & referral codes with verified community attribution.
                    </span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-[#C6FF3D] tracking-widest font-bold">
                    {mode === "password" ? "Security Recovery" : "SaaSFolio Portal"}
                  </span>
                  {mode !== "password" && (
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => changeMode("login")}
                        className={`px-3 py-1 rounded-full transition-all ${
                          mode === "login"
                            ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_12px_rgba(198,255,61,0.4)]"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => changeMode("signup")}
                        className={`px-3 py-1 rounded-full transition-all ${
                          mode === "signup"
                            ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_12px_rgba(198,255,61,0.4)]"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {heading}
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">{subtitle}</p>
              </div>

              {/* Status and error alerts */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {notice && (
                <div
                  role="status"
                  className="p-3.5 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] text-sm flex items-start gap-2.5 animate-in fade-in"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C6FF3D] shrink-0 mt-0.5" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Quick Demo Fill option for frictionless testing */}
              {mode === "login" && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-300 font-bold block">Quick Demo Credentials:</span>
                    <span className="font-mono text-[11px] text-zinc-500">demo@saasfolio.tech / Password1234!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("demo@saasfolio.tech");
                      setPassword("Password1234!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#C6FF3D]/10 hover:text-[#C6FF3D] border border-white/10 text-[11px] font-mono text-zinc-300 transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={submit} className="space-y-4">
                <ServiceNotice status={serviceStatus} />
                <fieldset disabled={!serviceAvailable} className="contents">
                  <legend className="sr-only">Authentication credentials</legend>

                  {/* Name field (Only on signup) */}
                  {mode === "signup" && (
                    <div>
                      <label htmlFor="auth-name" className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                        Full Name / Community Handle *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={100}
                          placeholder="e.g. Alex Mercer"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-2xl py-3 pl-10 pr-4 bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-colors font-sans text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  {mode !== "password" && (
                    <div>
                      <label htmlFor="auth-email" className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          placeholder="you@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-2xl py-3 pl-10 pr-4 bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-colors font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password field */}
                  {mode !== "reset" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="auth-password" className="block text-xs font-mono uppercase text-zinc-400 tracking-wider">
                          Password *
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => changeMode("reset")}
                            className="text-xs font-mono text-[#C6FF3D] hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="auth-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={mode === "login" ? "current-password" : "new-password"}
                          required
                          minLength={mode === "login" ? 1 : 12}
                          maxLength={128}
                          placeholder={mode === "login" ? "••••••••••••" : "Minimum 12 characters"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-2xl py-3 pl-10 pr-12 bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-colors font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength meter on signup/password */}
                      {mode !== "login" && password.length > 0 && (
                        <div className="pt-2 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-zinc-400">Security Strength:</span>
                            <span className="font-bold text-white">{passwordStrength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.score}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                            <span className={password.length >= 12 ? "text-[#C6FF3D] flex items-center gap-0.5" : ""}>
                              {password.length >= 12 && <Check className="w-3 h-3" />} 12+ chars
                            </span>
                            <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-[#C6FF3D] flex items-center gap-0.5" : ""}>
                              {/[A-Z]/.test(password) && /[a-z]/.test(password) && <Check className="w-3 h-3" />} Mixed case
                            </span>
                            <span className={/[0-9]/.test(password) ? "text-[#C6FF3D] flex items-center gap-0.5" : ""}>
                              {/[0-9]/.test(password) && <Check className="w-3 h-3" />} Number
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full mt-2 rounded-2xl py-3.5 px-6 bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(198,255,61,0.3)] hover:shadow-[0_0_35px_rgba(198,255,61,0.5)] flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Verifying credentials...</span>
                      </span>
                    ) : (
                      <>
                        <span>
                          {mode === "signup"
                            ? "Create Free Account"
                            : mode === "reset"
                            ? "Send Password Reset Link"
                            : mode === "password"
                            ? "Save New Password"
                            : "Sign In to SaaSFolio"}
                        </span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </fieldset>
              </form>

              {/* Mode switch options */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                {mode === "login" ? (
                  <p>
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("signup")}
                      className="text-[#C6FF3D] font-bold hover:underline"
                    >
                      Create one for free
                    </button>
                  </p>
                ) : mode === "signup" ? (
                  <p>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("login")}
                      className="text-[#C6FF3D] font-bold hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="text-[#C6FF3D] font-bold hover:underline flex items-center gap-1"
                  >
                    ← Return to Sign In
                  </button>
                )}
              </div>

              {/* Footer legal */}
              <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                By accessing SaaSFolio, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-zinc-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-zinc-300">
                  Privacy Policy
                </Link>
                . Your credentials and verified submissions are protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
