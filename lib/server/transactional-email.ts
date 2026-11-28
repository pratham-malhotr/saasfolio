import "server-only";

// Same origin rule as lib/seo (kept local so this module stays dependency-free).
const absoluteUrl = (path: string) => new URL(path, `${new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin}/`).toString();

// Transactional email through Resend (the provider the newsletter already
// uses). Sending is best effort: when no provider is configured, or a send
// fails, the calling flow still succeeds and nothing is retried here.
//
//   RESEND_API_KEY              Resend API key (server only)
//   TRANSACTIONAL_FROM_EMAIL    e.g. "SaaSFolio <brands@saasfolio.tech>" on a domain verified in Resend
//                               (falls back to NEWSLETTER_FROM_EMAIL)

export function transactionalEmailConfigured() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL;
  return Boolean(key && !/your_api_key|replace/i.test(key) && from && /@/.test(from));
}

export async function sendTransactionalEmail(message: { to: string; subject: string; text: string; html: string; idempotencyKey: string }) {
  if (!transactionalEmailConfigured()) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": message.idempotencyKey },
      body: JSON.stringify({ from: process.env.TRANSACTIONAL_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

function layout(title: string, paragraphs: string[], action?: { label: string; href: string }) {
  const body = paragraphs.map(paragraph => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#27272a">${paragraph}</p>`).join("");
  const button = action ? `<p style="margin:22px 0"><a href="${escapeHtml(action.href)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c6ff3d;color:#0b1102;font-weight:700;text-decoration:none">${escapeHtml(action.label)}</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif"><div style="max-width:560px;margin:0 auto;padding:28px;border-radius:12px;background:#ffffff"><p style="margin:0 0 18px;font-weight:700;font-size:18px">SaaS<span style="color:#5f8a00">Folio</span></p><h1 style="margin:0 0 16px;font-size:21px;color:#09090b">${escapeHtml(title)}</h1>${body}${button}<p style="margin:24px 0 0;font-size:12px;color:#71717a">You received this because this address was used to submit a brand to SaaSFolio. Reply to this email if you did not submit it.</p></div></body></html>`;
}

export function brandReceivedEmail(input: { to: string; brand: string; receipt: string; dnsName: string; dnsValue: string }) {
  const verifyUrl = absoluteUrl("/brands/promote#verify");
  const subject = `We received ${input.brand} — verify your domain to get listed`;
  const text = [
    `Thanks for submitting ${input.brand} to SaaSFolio.`,
    `Your submission reference: ${input.receipt}`,
    "To get listed automatically, prove you control the brand's domain by adding this DNS TXT record:",
    `  Name:  ${input.dnsName}`,
    `  Value: ${input.dnsValue}`,
    "We check pending submissions every hour. Once the record is found and your homepage and pricing or documentation page match the brand, your listing is approved and we email you. You can also check it yourself:",
    verifyUrl,
    "Submissions without domain verification stay in our editorial review queue.",
  ].join("\n\n");
  const html = layout(`We received ${input.brand}`, [
    `Thanks for submitting <strong>${escapeHtml(input.brand)}</strong>. Your submission reference is <code>${escapeHtml(input.receipt)}</code>.`,
    "To get listed automatically, prove you control the brand's domain by adding this DNS TXT record:",
    `<code style="display:block;padding:10px;border-radius:6px;background:#f4f4f5;font-size:13px;word-break:break-all">Name: ${escapeHtml(input.dnsName)}<br>Value: ${escapeHtml(input.dnsValue)}</code>`,
    "We check pending submissions every hour. When the record is found and your homepage and pricing or documentation page match the brand, your listing is approved and we email you.",
  ], { label: "Check verification now", href: verifyUrl });
  return { to: input.to, subject, text, html, idempotencyKey: `brand-received:${input.receipt}` };
}

export function brandApprovedEmail(input: { to: string; brand: string; receipt: string }) {
  const listingUrl = absoluteUrl(`/brands?q=${encodeURIComponent(input.brand)}`);
  const subject = `${input.brand} is now listed on SaaSFolio`;
  const text = [
    `Good news: ${input.brand} was verified and successfully added to the SaaSFolio brand directory.`,
    `See your listing: ${listingUrl}`,
    `Submission reference: ${input.receipt}`,
    `Want more visibility? Sponsored placement and offer listings are explained at ${absoluteUrl("/brands/promote")}.`,
  ].join("\n\n");
  const html = layout(`${input.brand} is now listed`, [
    `Good news: <strong>${escapeHtml(input.brand)}</strong> was verified and successfully added to the SaaSFolio brand directory.`,
    `Submission reference: <code>${escapeHtml(input.receipt)}</code>`,
    `Want more visibility? You can <a href="${escapeHtml(absoluteUrl("/brands/promote"))}">promote your listing</a> or submit a current offer.`,
  ], { label: "View your listing", href: listingUrl });
  return { to: input.to, subject, text, html, idempotencyKey: `brand-approved:${input.receipt}` };
}
