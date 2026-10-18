"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";

const CHANNELS = [
  {
    icon: Mail,
    title: "Member & Community Support",
    email: "support@saasfolio.tech",
    description: "Account credentials, passport reputation, saved bookmarks, and general inquiry.",
  },
  {
    icon: Sparkles,
    title: "Vendor Deals & Sponsorships",
    email: "partners@saasfolio.tech",
    description: "Submit exclusive coupons, lifetime offers, and homepage featured tool placements.",
  },
  {
    icon: MessageSquare,
    title: "Editorial & Architecture Reviews",
    email: "editorial@saasfolio.tech",
    description: "Pitch in-depth benchmarks, stack comparison articles, and developer tooling case studies.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Bug Bounty Desk",
    email: "security@saasfolio.tech",
    description: "Responsible vulnerability disclosures, cryptographic checks, and infrastructure audits.",
  },
];

const FAQS = [
  {
    q: "How quickly do you verify coupon submissions?",
    a: "Our editorial staff tests every submitted promo code in a live checkout session within 12 business hours. If approved, it is immediately routed to the active Deals Hub.",
  },
  {
    q: "Does SaaSFolio charge founders for basic directory listings?",
    a: "No! Standard tool inclusion in the Software Directory is 100% free for legitimate SaaS products. Paid packages only apply to featured hero placements, newsletter sponsorships, and sponsored deep-dive guides.",
  },
  {
    q: "What should I do if a coupon code didn't work for me?",
    a: "Click the 'Didn't Work' button on the deal modal. If a deal receives 3 or more negative community signals, our monitoring bot automatically flags it for immediate staff review.",
  },
  {
    q: "Can I contribute an architectural stack review as a guest engineer?",
    a: "Yes! We welcome technical reviews from verified founders and staff engineers. Reach out to editorial@saasfolio.tech with your outline and production benchmarks.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "support",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const id = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(id);
    setSubmitted(true);

    try {
      const existing = JSON.parse(localStorage.getItem("saasfolio_support_tickets") || "[]");
      existing.unshift({
        ticketId: id,
        ...formData,
        date: new Date().toISOString(),
        status: "OPEN_ASSIGNED",
      });
      localStorage.setItem("saasfolio_support_tickets", JSON.stringify(existing));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Contact & Support Desk</span>
        </div>

        {/* Header */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 font-mono text-xs text-[#C6FF3D]">
            <Clock className="w-3.5 h-3.5" />
            <span>AVG RESPONSE TIME &lt; 6 HOURS</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95] mb-6">
            WE&apos;RE HERE TO HELP <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C6FF3D]">
              SCALE YOUR SOFTWARE STACK.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-sans leading-relaxed">
            Have a question about a discount code, want to submit your software, or need help with your Member Passport? Send us a message or contact our team directly.
          </p>
        </div>

        {/* 4 Direct Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {CHANNELS.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#C6FF3D] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    {ch.title}
                  </h3>
                  <a
                    href={`mailto:${ch.email}`}
                    className="font-mono text-xs text-[#C6FF3D] hover:underline block mb-3"
                  >
                    {ch.email}
                  </a>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {ch.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid: Interactive Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* Dispatch Form (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#0A0A0E] border border-white/10">
            <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
              DIRECT DISPATCH
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1 mb-6">
              SEND A MESSAGE TO OUR TEAM
            </h2>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-[#09090C] border border-[#C6FF3D]/40 text-center">
                <div className="w-16 h-16 rounded-2xl bg-black border border-[#C6FF3D] flex items-center justify-center text-[#C6FF3D] mx-auto mb-4 shadow-[0_0_20px_rgba(198,255,61,0.2)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mb-2">
                  TICKET LOGGED // #{ticketId}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6 font-sans">
                  We have assigned your ticket to the <span className="text-white font-mono uppercase">{formData.department}</span> desk. A confirmation has been dispatched to <span className="text-white">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white uppercase hover:bg-white/10 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Department Desk
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    >
                      <option value="support">Member Support & Passports</option>
                      <option value="partners">Vendor Partnerships & Deals</option>
                      <option value="editorial">Editorial & Architecture Reviews</option>
                      <option value="security">Security & Bug Bounty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief topic summary..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe how we can assist you in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)]"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick FAQs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="mb-6">
              <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
                KNOWLEDGE BASE
              </span>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-1">
                FREQUENTLY ASKED
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#09090C] border border-white/10 p-5 cursor-pointer hover:border-white/20 transition-all"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between font-display font-bold text-sm text-white">
                    <span>{faq.q}</span>
                    <span className="font-mono text-xs text-[#C6FF3D] ml-2">
                      {activeFaq === idx ? "−" : "+"}
                    </span>
                  </div>
                  {activeFaq === idx && (
                    <p className="mt-3 text-xs text-zinc-400 font-sans leading-relaxed pt-3 border-t border-white/5">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
