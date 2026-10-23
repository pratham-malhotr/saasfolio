// Shared by the collector and public catalog: an ambiguous table label or a
// question about another product is insufficient evidence of a free offer.
export function discoverVendorOffer(text) {
  if (typeof text !== "string" || /<!--|-->/.test(text)) return null;
  const patterns = [
    { type: "free_trial", re: /\b(?:start|try|begin|get|claim)\s+(?:your\s+|a\s+|our\s+)?(?:\d+[- ]day\s+)?free\s+trial\b/i },
    { type: "free_trial", re: /\b(?:try|start|get)\s+(?:it\s+|your\s+|a\s+)?(?:free\s+for\s+\d+\s+days|\d+[- ]day\s+(?:free\s+)?trial)\b/i },
    { type: "free_plan", re: /\b(?:free\s+forever|forever\s+free|our\s+free\s+plan|free\s+plan\s+(?:offers|includes|provides))\b/i },
  ];
  for (const { type, re } of patterns) {
    for (const match of text.matchAll(new RegExp(re.source, "gi"))) {
      const before = text.slice(Math.max(0, match.index - 75), match.index);
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + 100);
      if (/\b(?:no|not|never|without|discontinued|previously)\b[^.!?]{0,50}$/i.test(before) || /^\s*(?:is\s+not|isn't|was\s+discontinued|\?\s*No\b)/i.test(after)) continue;
      return { type, evidence: text.slice(Math.max(0, match.index - 70), match.index + match[0].length + 150) };
    }
  }
  return null;
}
