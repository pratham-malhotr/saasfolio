export interface InboxInquiry { id: string; kind: string; email: string; payload: Record<string, unknown>; status: string; created_at: string }
export function filterInquiries(items: InboxInquiry[], type: string, status: string, query: string) {
  const search = query.trim().toLowerCase();
  return items.filter(item => {
    const matchesType = type === "all" || (type === "brands" ? item.kind === "submission" && item.payload.submissionType === "brand" : type === "reports" ? item.payload.reportStatus === "unreviewed" : item.kind === type);
    const matchesStatus = status === "all" || item.status === status;
    const searchable = [item.id, item.email, item.payload.toolName, item.payload.companyName, item.payload.contactName, item.payload.websiteUrl, item.payload.subject].filter(value => typeof value === "string").join(" ").toLowerCase();
    return matchesType && matchesStatus && (!search || searchable.includes(search));
  });
}
export function inquiryExport(items: InboxInquiry[]) {
  return { exportedAt: new Date().toISOString(), scope: "Only the loaded inquiries matching the current inbox filters. Contains private contact details; store securely.", count: items.length,
    inquiries: items.map(({ id, kind, email, payload, status, created_at }) => ({ id, kind, email, payload, status, created_at })) };
}
