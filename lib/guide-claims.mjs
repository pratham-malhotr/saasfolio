// Verifiable figures in a brand guide's dated pricing observations.
//
// A guide's savings options and source notes state concrete figures such as
// "20% off annual billing", "$12 per seat" or "a 14-day trial". Re-finding every
// one of those figures on the guide's own official sources is the evidence that
// lets a guide stay current after its original review date. Guides whose claims
// contain no checkable figure are never renewed automatically.

const PATTERNS = [
  /\d+(?:\.\d+)?\s?%/g,
  /[$€£]\s?\d[\d,]*(?:\.\d+)?/g,
  /\b\d+[- ](?:day|month|year)s?\b/gi,
];

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fourteen: 14, fifteen: 15, thirty: 30, sixty: 60, ninety: 90 };
// "two months free" and "a seven-day trial" state the same figures as "2 months" and "7-day".
const numerals = text => String(text).replace(new RegExp(`\\b(${Object.keys(WORD_NUMBERS).join("|")})([\\s-]+)(?=(?:day|month|year)s?\\b)`, "gi"), (_, word, gap) => `${WORD_NUMBERS[word.toLowerCase()]}${gap}`);

const normalize = token => token.toLowerCase().replace(/\s+/g, "").replace(/,/g, "").replace(/-/g, "")
  .replace(/^([$€£])(\d+)\.0+$/, "$1$2").replace(/(day|month|year)s$/, "$1");

export function guideClaimTexts(guide) {
  return [
    ...(guide?.savingsOptions || []).map(option => option.saving),
    ...(guide?.sourceNotes || []),
  ].filter(text => typeof text === "string" && text.trim());
}

export function extractClaimTokens(texts) {
  const tokens = new Set();
  for (const text of texts) for (const pattern of PATTERNS) for (const match of numerals(text).matchAll(pattern)) tokens.add(normalize(match[0]));
  return [...tokens].sort();
}

// Page text is normalized the same way, so "20 %", "$12.00" and "14 days"
// match "20%", "$12" and "14-day" respectively.
export function normalizedPageText(text) {
  return numerals(String(text || "")).toLowerCase().replace(/,/g, "")
    .replace(/(\d+(?:\.\d+)?)\s+%/g, "$1%")
    .replace(/([$€£])\s+(\d)/g, "$1$2")
    .replace(/([$€£]\d+)\.0+(?!\d)/g, "$1")
    .replace(/\b(\d+)[\s-]+(day|month|year)s?\b/g, "$1$2");
}

export function missingClaimTokens(tokens, pageText) {
  const text = normalizedPageText(pageText);
  return tokens.filter(token => {
    // Require a non-digit boundary before the figure so "20%" is not found in "120%".
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // ...and none after it, so "$12" is not found in "$12.50" or "$120".
    return !new RegExp(`(^|[^\\d.])${escaped}(?!\\d|\\.\\d)`).test(text);
  });
}

export function guideSourceUrls(guide, limit = 4) {
  const urls = [guide?.sourceUrl, ...(guide?.savingsOptions || []).map(option => option.sourceUrl), ...(guide?.sources || []).map(source => source.url)]
    .filter(url => typeof url === "string" && url.startsWith("https://"));
  return [...new Set(urls)].slice(0, limit);
}

// Savings options that state no amount ("student pricing", "nonprofit plans by
// application") are re-established when the defining term is still published.
const SAVING_TYPE_TERMS = {
  "Annual billing": /\b(annual(?:ly)?|yearly|per year|billed year)/i,
  "Team discount": /\b(team|seats?|volume)\b/i,
  "Bundle discount": /\b(bundle|suite|package)/i,
  "Education offer": /\b(student|education(?:al)?|academic|teacher|universit)/i,
  "Nonprofit discount": /\b(non-?profit|charit|ngo)/i,
  "Organization offer": /\b(non-?profit|charit|education(?:al)?|student|startup|organi[sz]ation)/i,
};

export function missingSavingTypes(guide, pageText) {
  return [...new Set((guide?.savingsOptions || []).map(option => option.type))]
    .filter(type => SAVING_TYPE_TERMS[type] && !SAVING_TYPE_TERMS[type].test(pageText));
}

export const GUIDE_FRESHNESS_DAYS = 30;

// The date a guide's observations were last established: its editorial review
// or a later automated source check in which every stated figure was re-found.
export function guideEvidenceDate(guide, check, now = Date.now()) {
  const dates = [guide?.reviewedAt ? Date.parse(`${guide.reviewedAt}T00:00:00Z`) : NaN];
  if (check?.status === "verified" && check.verifiedAt) dates.push(Date.parse(check.verifiedAt));
  const valid = dates.filter(date => Number.isFinite(date) && date <= now);
  return valid.length ? Math.max(...valid) : NaN;
}
