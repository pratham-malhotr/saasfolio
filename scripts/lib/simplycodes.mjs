import { parse } from "parse5";
import { hash } from "./offer-sources.mjs";

export function isSimplyCodesStore(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "simplycodes.com" && !url.username && !url.password &&
      !url.port && /^\/store\/[a-z0-9.-]+\/?$/.test(url.pathname);
  } catch { return false; }
}

// Convert document structure once. Navigation, scripts and hidden reveal data
// cannot supply a visible code or bleed into a neighboring offer's conditions.
export function htmlOutline(html) {
  const output = [];
  const blocks = new Set(["div", "p", "section", "article", "li", "ul", "ol", "br", "dl", "dt", "dd"]);
  function visit(node) {
    const tag = node.tagName;
    const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
    if (["script", "style", "noscript", "svg", "template", "nav", "header", "footer", "aside"].includes(tag) ||
      "hidden" in attrs || attrs["aria-hidden"] === "true" || /display\s*:\s*none|visibility\s*:\s*hidden/i.test(attrs.style || "")) return;
    if (node.nodeName === "#text") { output.push(node.value.replace(/\s+/g, " ")); return; }
    const heading = /^h[1-6]$/.test(tag || "");
    if (heading) output.push(`\n${"#".repeat(Number(tag[1]))} `);
    else if (blocks.has(tag)) output.push("\n");
    if (tag === "li") output.push("- ");
    if (tag === "button") output.push("\n[Button: ");
    if (tag === "code") output.push(" [Code: ");
    for (const child of node.childNodes || []) visit(child);
    if (tag === "button" || tag === "code") output.push("]\n");
    if (heading || blocks.has(tag)) output.push("\n");
  }
  visit(parse(html));
  return output.join("").split(/\n/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
}

function number(value) {
  if (!value) return null;
  const match = /^([\d,.]+)\s*([KM])?$/i.exec(value.trim());
  return match ? Math.round(Number(match[1].replaceAll(",", "")) * (match[2]?.toUpperCase() === "K" ? 1000 : match[2]?.toUpperCase() === "M" ? 1000000 : 1)) : null;
}
function field(lines, label) {
  const index = lines.findIndex(line => new RegExp(`^${label}(?:\\s*:|$)`, "i").test(line));
  if (index < 0) return null;
  return lines[index].replace(new RegExp(`^${label}\\s*:?\\s*`, "i"), "") || lines[index + 1] || null;
}

export function parseSimplyCodes(input, { sourceUrl, toolSlug, observedAt = new Date().toISOString(), format = "html", evidenceId = null } = {}) {
  if (!isSimplyCodesStore(sourceUrl)) throw new Error("Expected a public SimplyCodes store URL");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(toolSlug || "")) throw new Error("An explicit catalog tool slug is required");
  if (!Number.isFinite(Date.parse(observedAt))) throw new Error("Invalid observation timestamp");
  if (Buffer.byteLength(input, "utf8") > 3_000_000) throw new Error("Store input exceeds 3 MB");
  const text = format === "html" ? htmlOutline(input) : input;
  if (/sorry, you have been blocked|attention required!|verify you are human|just a moment|checking your browser/i.test(text)) {
    return { status: "blocked", sourceUrl, toolSlug, observedAt, evidenceId, offers: [], limitations: ["The captured document is an access challenge, not the merchant store page."] };
  }
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const start = lines.findIndex(line => /^#{1,2}\s/.test(line) && /promo codes.*verific|promo codes.*report/i.test(line));
  if (start < 0) return { status: "unrecognized", sourceUrl, toolSlug, observedAt, evidenceId, offers: [], limitations: ["The expected offer-list section was not observed; the page may have changed."] };
  const section = lines.slice(start + 1);
  const end = section.findIndex(line => /^#{1,2}\s+\S/.test(line));
  if (end >= 0) section.splice(end);
  const starts = section.flatMap((line, index) => /^###\s+/.test(line) &&
    (/\b(?:\d+%\s*off|\$\d+\s*off|free gift|early access|free trial|months? free)\b/i.test(line) ||
      section.slice(index + 1, index + 10).some(l => /\[Button:\s*(?:Show|View|Get) Code\]/i.test(l))) ? [index] : []);
  const offers = starts.slice(0, 250).map((position, ordinal) => {
    const card = section.slice(position, starts[ordinal + 1] ?? section.length);
    const headline = card[0].replace(/^###\s+/, "");
    const title = card.find(line => !line.startsWith("#") && !line.startsWith("[") && /\b(?:at|from)\s+.+\b(?:w\/Code|with code|coupon)\b/i.test(line)) || headline;
    const explicitCode = card.map(line => /^\[Code:\s*([A-Z0-9_-]{3,48})\]$/i.exec(line) || /^Promo code:\s*([A-Z0-9_-]{3,48})$/i.exec(line)).find(Boolean)?.[1] || null;
    const publicCode = explicitCode && !/^(?:CODE|COUPON|PROMO|HIDDEN|COPY|SHOW_CODE|X{3,})$/i.test(explicitCode) ? explicitCode : null;
    const restrictions = [];
    for (let i = 0; i < card.length; i++) if (/^####\s*Code restrictions/i.test(card[i])) {
      for (let j = i + 1; j < card.length && !card[j].startsWith("#"); j++) if (/^[-*]\s+/.test(card[j])) restrictions.push(card[j].replace(/^[-*]\s+/, ""));
    }
    if (/\bmembers?\s+only\b/i.test(title) && !restrictions.includes("members")) restrictions.push("members");
    const button = card.findIndex(line => /^\[Button:/.test(line));
    const badges = card.slice(1, button < 0 ? 12 : button);
    const reportedVerification = badges.some(l => /^Verified$/i.test(l)) ? "source-reported-verified" :
      badges.some(l => /^Community Code$/i.test(l)) ? "community-submission" : "unknown";
    const percent = /\b(\d{1,2}|100)%\s*off\b/i.exec(headline);
    const health = field(card, "Health");
    return {
      candidateId: hash(`${sourceUrl}:${publicCode ? `code:${publicCode}:${[...restrictions].sort().join("|")}` : `position:${ordinal}:${headline}`}`).slice(0, 24),
      sourceOfferId: null, sourcePosition: ordinal, toolSlug, sourceUrl, sourceKind: "coupon-site", observedAt, evidenceId,
      title: title.slice(0, 200), code: publicCode, codeVisibility: publicCode ? "explicit-markup" : "not-observed",
      status: publicCode ? "needs-review" : "hidden-code", checkoutTested: false,
      reportedDiscountPercentage: percent ? Number(percent[1]) : null,
      reportedVerification,
      reportedHealthPercent: health && /^\d{1,3}%$/.test(health) && Number.parseInt(health) <= 100 ? Number.parseInt(health) : null,
      reportedUsesToday: number(field(card, "Uses today")), reportedTotalUses: number(field(card, "Total uses")),
      reportedVerificationCount: number(field(card, "Verifications")),
      reportedLastUsed: field(card, "Last used"), reportedLastVerified: field(card, "Last Verified"),
      restrictions, expiresAt: null,
    };
  });
  return { status: "parsed", sourceUrl, toolSlug, observedAt, evidenceId, offers,
    limitations: ["Source-reported health and verification are not SaaSFolio checkout evidence.",
      "Explicit code markup is retained; computed CSS visibility is not established by this parser.",
      "Relative activity labels are retained as reported; no exact verification date is inferred.",
      "Hidden-code candidate IDs use capture positions; explicit-code IDs use the reported value and restrictions, not a proven merchant coupon identity.",
      ...(starts.length > 250 ? ["Only the first 250 offer cards were retained."] : [])] };
}

export function parseReaSimplyCodes(capture, options) {
  if (!options.observedAt) throw new Error("Supply the original capture observation time; importing does not refresh evidence");
  if (capture.operation !== "capture_browser_scenario" || !capture.normalized_result?.steps) throw new Error("Expected REA browser-scenario Evidence");
  if (!/^ev_[a-f0-9]{64}$/.test(capture.evidence_id || "")) throw new Error("Invalid REA Evidence identifier");
  const steps = capture.normalized_result.steps;
  const lastDom = [...steps].reverse().find(step => step.artifacts?.dom?.state === "captured");
  if (!lastDom?.artifacts.dom.value?.text) throw new Error("REA capture has no retained DOM");
  const finalUrl = [...steps].reverse().find(step => step.after_url?.url)?.after_url.url;
  if (!isSimplyCodesStore(finalUrl) || new URL(finalUrl).pathname !== new URL(options.sourceUrl).pathname) throw new Error("Capture belongs to a different store");
  const dom = lastDom.artifacts.dom.value;
  if (dom.sha256 !== hash(dom.text) || dom.bytes !== Buffer.byteLength(dom.text, "utf8")) throw new Error("REA DOM digest or byte count does not match");
  return { ...parseSimplyCodes(dom.text, { ...options, format: "html", evidenceId: capture.evidence_id }),
    captureCoverage: capture.normalized_result.completeness || null };
}

export function compareDiscoveryCandidates(a, b) {
  const priority = item => (item.code ? 100 : 0) + (item.reportedVerification === "source-reported-verified" ? 20 : 0) +
    (item.reportedHealthPercent ?? 0) / 100;
  return priority(b) - priority(a) || a.sourcePosition - b.sourcePosition;
}
