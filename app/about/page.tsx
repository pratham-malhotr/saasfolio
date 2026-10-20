import { pageMetadata } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Terminal, 
  Users, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  Cpu, 
  Zap, 
  Lock 
} from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";

export const metadata = pageMetadata({
  title: 'About SaaSFolio: SaaS Discounts & Software Reviews',
  description: 'Learn about SaaSFolio, our software discovery platform, editorial approach, SaaS discount listings and affiliate disclosure standards.',
  path: "/about",
});

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Zero Clickbait Guarantee",
    desc: "Every discount code, lifetime perk, and free tier on SaaSFolio is manually tested at checkout before being published.",
  },
  {
    icon: Terminal,
    title: "Engineering-First Benchmarks",
    desc: "Our architectural reviews aren't marketing fluff. We run real load tests, benchmark APIs, and analyze cold starts so founders know what's under the hood.",
  },
  {
    icon: Users,
    title: "Community-Validated Crowd Signals",
    desc: "Real founders and developers vote on whether coupons worked, share production migration stories, and review tool trade-offs in our open forum.",
  },
  {
    icon: Lock,
    title: "Radical Transparency",
    desc: "We disclose every affiliate partnership. If an affiliate deal is inferior to an active public discount, we publish the better discount every single time.",
  },
];

const MILESTONES = [
  { metric: "$2.4M+", label: "Capital Saved for Founders" },
  { metric: "1,200+", label: "Hand-Verified Active Deals" },
  { metric: "500+", label: "Vetted SaaS Tools Catalogued" },
  { metric: "99.2%", label: "Live Coupon Success Rate" },
];

const LEADERSHIP = [
  {
    name: "Alexandre Chen",
    role: "Co-Founder & Chief Architect",
    bio: "Ex-Stripe infrastructure lead. Obsessed with high-throughput distributed systems, developer tooling economics, and edge runtimes.",
    avatar: "AC",
  },
  {
    name: "Elena Rostova",
    role: "Head of Editorial & Benchmarks",
    bio: "Former staff engineer at Datadog. Specializes in observability pipelines, vector databases, and SaaS pricing tier teardowns.",
    avatar: "ER",
  },
  {
    name: "Marcus Vance",
    role: "Director of Vendor Partnerships",
    bio: "Passionate about negotiating verified discounts and lifetime deals directly with top-tier YC and independent software founders.",
    avatar: "MV",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">About SaaSFolio</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 font-mono text-xs text-[#C6FF3D]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE SAASFOLIO MANIFESTO</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95] mb-8">
            WHERE SAAS DEALS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C6FF3D]">
              WIN AND CLICKBAIT DIES.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-sans leading-relaxed">
            The internet is polluted with fake coupon scrapers, expired promo codes, and AI-generated reviews that repeat vendor marketing copy. 
            SaaSFolio is built by engineers and founders who were fed up with wasted hours and surprise credit card bills. 
            We verify every discount, benchmark every tool, and curate the modern software stack.
          </p>
        </div>

        {/* Real Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-[#09090C] border border-white/10 mb-24">
          {MILESTONES.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4">
              <span className="font-display font-black text-3xl sm:text-5xl text-[#C6FF3D] tracking-tighter mb-2">
                {item.metric}
              </span>
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Our 4 Core Pillars */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#C6FF3D] font-bold uppercase tracking-widest">
              OUR STANDARDS // HOW WE OPERATE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mt-2 text-white">
              THE 4 LAWS OF SAASFOLIO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#C6FF3D] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mb-3">
                      {p.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Methodology Deep Dive */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0E0E12] to-[#070709] border border-white/10 mb-24">
          <div className="max-w-3xl">
            <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
              VERIFICATION PROTOCOL
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2 mb-6">
              HOW WE TEST EVERY SINGLE OFFER
            </h2>
            <div className="space-y-4 font-sans text-sm text-zinc-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Active Checkout Test:</strong> Our team applies the coupon code in a real billing sandbox or live payment session to verify the percentage or dollar discount applies correctly.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Term & Exclusion Audit:</strong> We identify whether deals are valid for existing accounts, new workspaces only, annual commitments, or specific regional currencies.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Direct Founder Relationship:</strong> Over 60% of our deals are negotiated directly with SaaS founding teams under verified merchant partner agreements.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Community Feedback Quarantine:</strong> If a deal receives 3 or more negative community votes ("Didn't Work") within 24 hours, it is automatically paused and queued for staff audit.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#C6FF3D] font-bold uppercase tracking-widest">
              BEHIND THE CURATION
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mt-2 text-white">
              CORE EDITORIAL TEAM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERSHIP.map((lead, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-black border border-[#C6FF3D]/40 flex items-center justify-center font-display font-bold text-lg text-[#C6FF3D] mb-5 shadow-[0_0_15px_rgba(198,255,61,0.15)]">
                    {lead.avatar}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {lead.name}
                  </h3>
                  <div className="font-mono text-xs text-[#C6FF3D] mb-4">
                    {lead.role}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {lead.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0E] border border-[#C6FF3D]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-2">
              READY TO DISCOVER PREMIUM SAAS SOFTWARE?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl font-sans">
              Explore 1,200+ active discounts, read our independent developer benchmarks, or join the community discussion.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/deals"
              className="px-6 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)]"
            >
              <span>Explore Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/community"
              className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              <span>Community Q&A</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
