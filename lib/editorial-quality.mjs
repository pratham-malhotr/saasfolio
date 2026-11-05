import { normalizePublicHttpsUrl } from "./public-url.mjs";

const nonempty = value => typeof value === "string" && value.trim().length > 0;
const placeholder = /\blorem ipsum\b|\bcoming soon\b|\bTODO\b|\[insert (?:brand|text|content)\]|is listed for[\s\S]*visit the official provider/i;

// Internal publication requirements, not a Google quality score or minimum
// word-count rule. Evergreen guidance does not expire with a pricing quote.
export function editorialGuideIssues(guide, now = Date.now()) {
  if (!guide || typeof guide !== "object") return ["No original guide"];
  const issues = [];
  for (const key of ["intro", "summary", "metaDescription"]) if (!nonempty(guide[key])) issues.push(`Missing ${key}`);
  if (!normalizePublicHttpsUrl(guide.sourceUrl)) issues.push("Invalid primary source");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(guide.reviewedAt || "") ? Date.parse(`${guide.reviewedAt}T00:00:00Z`) : NaN;
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== guide.reviewedAt || date > now) issues.push("Invalid or future review date");
  if (!Array.isArray(guide.sections) || guide.sections.length < 3 || guide.sections.some(section => !nonempty(section.heading) || !nonempty(section.text))) issues.push("Incomplete original sections");
  if (!Array.isArray(guide.decisionRows) || guide.decisionRows.length < 2 || guide.decisionRows.some(row => !nonempty(row.option) || !nonempty(row.bestFor) || !nonempty(row.check))) issues.push("Incomplete decision guidance");
  if (!Array.isArray(guide.sourceNotes) || !guide.sourceNotes.length || guide.sourceNotes.some(note => !nonempty(note))) issues.push("Missing source observations");
  for (const source of [...(guide.sources || []).map(item => item.url), ...(guide.savingsOptions || []).map(item => item.sourceUrl)]) if (!normalizePublicHttpsUrl(source)) issues.push("Invalid supporting source");
  const body = [guide.intro, guide.summary, ...(guide.sections || []).map(section => section.text)].filter(nonempty).join("\n");
  if (placeholder.test(body)) issues.push("Unfinished or generated placeholder content");
  return [...new Set(issues)];
}

export function duplicatedEditorialParagraphs(entries, brandNames = []) {
  const names = [...brandNames].filter(nonempty).sort((a, b) => b.length - a.length);
  const paragraphs = new Map();
  for (const entry of entries) for (const text of entry.paragraphs) {
    let normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
    for (const name of names) normalized = normalized.split(name.toLowerCase()).join("[brand]");
    // Ignore short headings, labels and incidental common phrases. This is a
    // duplication detector, not a required article length.
    if (normalized.length < 160) continue;
    const existing = paragraphs.get(normalized) || new Set();
    existing.add(entry.slug); paragraphs.set(normalized, existing);
  }
  return [...paragraphs].filter(([, slugs]) => slugs.size > 1).map(([text, slugs]) => ({ text, slugs: [...slugs] }));
}
