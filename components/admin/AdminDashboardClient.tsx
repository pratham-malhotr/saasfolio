"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MousePointer,
  DollarSign,
  Tag,
  Clock,
  Eye,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  Users,
  AlertTriangle,
} from "lucide-react";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { SaaSDeal } from "@/lib/types";

interface SubmissionItem {
  id: string;
  toolName: string;
  tagline: string;
  websiteUrl: string;
  category: string;
  dealType: string;
  discountPercentage: number;
  couponCode: string;
  status: "PENDING VERIFICATION" | "APPROVED & LIVE" | "REJECTED";
  submittedAt: string;
  founderEmail: string;
}

export function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"submissions" | "deals" | "analytics" | "moderation">("submissions");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [dealList, setDealList] = useState<SaaSDeal[]>(DEALS_DATA);
  const [searchDealQuery, setSearchDealQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Load submissions from localStorage or supply defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saasfolio_submissions");
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        const seedQueue: SubmissionItem[] = [
          {
            id: "SUB-849201",
            toolName: "EdgeBase Cloud",
            tagline: "High-throughput distributed SQLite clusters with Raft consensus",
            websiteUrl: "https://edgebase.cloud",
            category: "Dev Tools",
            dealType: "Lifetime Deal (LTD)",
            discountPercentage: 80,
            couponCode: "LIFETIME-FOUNDER",
            status: "PENDING VERIFICATION",
            submittedAt: "10 mins ago",
            founderEmail: "marcus@edgebase.io",
          },
          {
            id: "SUB-710492",
            toolName: "CogniFlow AI",
            tagline: "Autonomous multi-agent LLM pipeline orchestrator",
            websiteUrl: "https://cogniflow.ai",
            category: "AI Tools",
            dealType: "Verified Coupon Code",
            discountPercentage: 50,
            couponCode: "FOLIO50",
            status: "PENDING VERIFICATION",
            submittedAt: "1 hour ago",
            founderEmail: "sophia@cogniflow.ai",
          },
          {
            id: "SUB-629110",
            toolName: "PulseMail Pro",
            tagline: "Dedicated IP warmup and deliverability recovery platform",
            websiteUrl: "https://pulsemail.pro",
            category: "Marketing",
            dealType: "Extended Free Trial",
            discountPercentage: 35,
            couponCode: "WARMUP35",
            status: "APPROVED & LIVE",
            submittedAt: "1 day ago",
            founderEmail: "sarah@pulsemail.pro",
          },
        ];
        setSubmissions(seedQueue);
        localStorage.setItem("saasfolio_submissions", JSON.stringify(seedQueue));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleApprove = (id: string) => {
    const updated = submissions.map((sub) =>
      sub.id === id ? { ...sub, status: "APPROVED & LIVE" as const } : sub
    );
    setSubmissions(updated);
    try {
      localStorage.setItem("saasfolio_submissions", JSON.stringify(updated));
    } catch (e) {}

    setNotification(`Submission ${id} approved and marked LIVE on directory.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReject = (id: string) => {
    const updated = submissions.map((sub) =>
      sub.id === id ? { ...sub, status: "REJECTED" as const } : sub
    );
    setSubmissions(updated);
    try {
      localStorage.setItem("saasfolio_submissions", JSON.stringify(updated));
    } catch (e) {}

    setNotification(`Submission ${id} has been rejected.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const [disabledDealIds, setDisabledDealIds] = useState<Record<string, boolean>>({});

  const toggleDealStatus = (id: string) => {
    setDisabledDealIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredDeals = dealList.filter(
    (d) =>
      d.title.toLowerCase().includes(searchDealQuery.toLowerCase()) ||
      d.toolName.toLowerCase().includes(searchDealQuery.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchDealQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Admin Mission Control Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-md bg-[#C6FF3D]/10 text-[#C6FF3D]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              SAASFOLIO MISSION CONTROL • ADMIN SUITE
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ● CLUSTER HEALTHY (18ms)
            </span>
          </div>
          <h1 className="font-display font-black tracking-tight text-3xl sm:text-4xl text-white uppercase">
            OPERATIONS & MODERATION
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-mono text-xs transition-colors"
          >
            + Test Submission Flow
          </Link>
          <Link
            href="/deals"
            className="px-4 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(198,255,61,0.2)]"
          >
            View Live Deals Shelf →
          </Link>
        </div>
      </div>

      {notification && (
        <div className="mb-6 p-4 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Total SaaS Impressions",
            value: "1,284,920",
            change: "+18.4% WoW",
            icon: Eye,
          },
          {
            label: "Coupon Code Reveals",
            value: "48,610",
            change: "14.2% Conversion",
            icon: Tag,
          },
          {
            label: "Outbound Partner Clicks",
            value: "19,420",
            change: "Zero dropouts",
            icon: MousePointer,
          },
          {
            label: "Est. Partner Pipeline",
            value: "$42,850",
            change: "92.4% Net Margin",
            icon: DollarSign,
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-3">
              <span className="font-mono text-xs uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-[#C6FF3D]" />
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white mb-1">
              {kpi.value}
            </div>
            <div className="font-mono text-xs text-[#C6FF3D]">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "submissions"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vendor Submissions Queue ({submissions.filter((s) => s.status === "PENDING VERIFICATION").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("deals")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "deals"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>All Deals & Expirations ({dealList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "analytics"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Affiliate Tracking Logs</span>
        </button>
      </div>

      {/* TAB 1: Submissions Approval Queue */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-white">
              Pending Vendor Submissions
            </h3>
            <span className="font-mono text-xs text-zinc-500">
              Showing {submissions.length} total tickets
            </span>
          </div>

          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    {sub.id}
                  </span>
                  <span className="font-display font-bold text-lg text-white">
                    {sub.toolName}
                  </span>
                  <span className="font-mono text-xs text-[#C6FF3D]">
                    ({sub.category})
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      sub.status === "APPROVED & LIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : sub.status === "REJECTED"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <p className="text-zinc-300 text-xs sm:text-sm">
                  {sub.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
                  <span>
                    Deal: <strong className="text-white">{sub.discountPercentage}% OFF</strong> ({sub.dealType})
                  </span>
                  <span>
                    Promo Code: <span className="text-[#C6FF3D] font-bold">{sub.couponCode}</span>
                  </span>
                  <span>Contact: {sub.founderEmail}</span>
                  <a
                    href={sub.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-white flex items-center gap-1 underline"
                  >
                    Visit Site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {sub.status === "PENDING VERIFICATION" && (
                  <>
                    <button
                      onClick={() => handleReject(sub.id)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 font-mono text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="px-5 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,61,0.25)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                  </>
                )}
                {sub.status === "APPROVED & LIVE" && (
                  <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Live in Directory
                  </span>
                )}
                {sub.status === "REJECTED" && (
                  <span className="font-mono text-xs text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Deals Active / Expired Manager */}
      {activeTab === "deals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative min-w-[300px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchDealQuery}
                onChange={(e) => setSearchDealQuery(e.target.value)}
                placeholder="Search by tool name, title, or code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090C] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
              />
            </div>
            <span className="font-mono text-xs text-zinc-500">
              Showing {filteredDeals.length} of {dealList.length} deals
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#09090C] border-b border-white/10 text-zinc-400 uppercase">
                <tr>
                  <th className="p-4">SaaS Tool</th>
                  <th className="p-4">Offer / Discount</th>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Deal Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/40">
                {filteredDeals.slice(0, 15).map((deal) => (
                  <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Link href={`/deals/${deal.slug}`} className="hover:text-[#C6FF3D]">
                        {deal.toolName}
                      </Link>
                    </td>
                    <td className="p-4 text-zinc-300">
                      <span className="text-[#C6FF3D] font-bold mr-1.5">
                        {deal.discountPercentage}% OFF
                      </span>
                      <span className="text-zinc-500 line-clamp-1">{deal.title}</span>
                    </td>
                    <td className="p-4 text-white font-bold">
                      {deal.code || "AUTO-APPLIED"}
                    </td>
                    <td className="p-4 text-zinc-400">{deal.dealType}</td>
                    <td className="p-4">
                      {!disabledDealIds[deal.id] ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          VERIFIED ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">
                          DISABLED / EXPIRED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleDealStatus(deal.id)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      >
                        {!disabledDealIds[deal.id] ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Affiliate Tracking Logs */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#09090C] border border-white/10">
            <h4 className="font-display font-bold text-lg text-white mb-2">
              Recent Outbound Affiliate Redirect Activity (`/go/[id]`)
            </h4>
            <p className="text-zinc-400 text-xs font-mono mb-6">
              Tracked live via SaaSFolio Zero-Trust Link Masking & Referrer Header Sanitization.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {[
                { tool: "EdgeBase Cloud", slug: "edgebase-cloud", ip: "104.28.19.42", country: "US", time: "2 mins ago" },
                { tool: "CogniFlow AI", slug: "cogniflow-ai", ip: "188.114.97.12", country: "DE", time: "5 mins ago" },
                { tool: "DeployJet", slug: "deployjet", ip: "172.67.142.8", country: "GB", time: "11 mins ago" },
                { tool: "ArmorID", slug: "armorid", ip: "162.158.12.90", country: "CA", time: "18 mins ago" },
                { tool: "LedgerZen", slug: "ledgerzen", ip: "141.101.90.31", country: "NL", time: "24 mins ago" },
              ].map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-zinc-400"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
                    <span className="text-white font-bold">{log.tool}</span>
                    <span className="text-zinc-500">/go/{log.slug}</span>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-500">
                    <span>IP: {log.ip} ({log.country})</span>
                    <span>{log.time}</span>
                    <span className="text-emerald-400 font-bold">200 OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
