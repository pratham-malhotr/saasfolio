"use client";
import { useState } from "react";
import Link from "next/link";
import { InquiryInbox } from "@/components/admin/InquiryInbox";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { OfferOperations } from "@/components/admin/OfferOperations";
import { StaffManagement, AuditLog } from "@/components/admin/StaffManagement";
import type { StaffRole } from "@/lib/server/staff";

export function AdminDashboardClient({ role }: { role: StaffRole }) {
  const [section, setSection] = useState("catalog");
  const sections = ["catalog", "offers", ...(role !== "editor" ? ["inquiries", "activity"] : []), ...(role === "owner" ? ["team"] : [])];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24 space-y-8">
    <header className="space-y-3"><p className="text-[#C6FF3D] text-xs font-mono uppercase tracking-widest">SaaSFolio publishing · {role}</p><h1 className="font-display text-4xl text-white font-bold">Publishing workspace</h1><p className="text-zinc-400 max-w-3xl">Prepare content, review source evidence and release approved revisions. Editing, review and publication are recorded separately.</p></header>
    <nav aria-label="Administration sections" className="flex flex-wrap gap-3">{sections.map(value => <button key={value} type="button" aria-pressed={section === value} onClick={() => setSection(value)} className={`px-5 py-3 rounded-xl capitalize border ${section === value ? "bg-[#C6FF3D] text-black border-[#C6FF3D]" : "border-white/20 text-white"}`}>{value}</button>)}</nav>
    <div hidden={section !== "catalog"}><CatalogManager role={role} /></div>
    {section === "offers" && <OfferOperations onReports={role !== "editor" ? () => setSection("inquiries") : undefined} />}
    {role !== "editor" && <><div hidden={section !== "inquiries"}><InquiryInbox /></div><div hidden={section !== "activity"}><AuditLog /></div></>}
    {role === "owner" && <div hidden={section !== "team"}><StaffManagement /></div>}
    <Link href="/profile" className="inline-block text-[#C6FF3D] underline">Back to your account</Link>
  </div>;
}
