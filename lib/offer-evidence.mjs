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
      if (/\b(?:no|not|never|without|discontinued|previously|do(?:es)?n['’]t|isn['’]t|aren['’]t|won['’]t|cannot)\b[^.!?]{0,50}$/i.test(before) || /^\s*(?:is\s+not|isn't|was\s+discontinued|\?\s*No\b)/i.test(after)) continue;
      // An institution-specific sales enquiry cannot establish an unrestricted
      // individual trial. A reviewed record can preserve that audience instead.
      const audienceContext = text.slice(Math.max(0, match.index - 160), match.index);
      if (type === "free_trial" && /institution[-\s]wide pricing/i.test(audienceContext) && /contact us to\s*$/i.test(before)) continue;
      // A provider can discuss why it rejects free plans. That explanation is
      // not a free offer, even when the heading contains "free forever".
      if (type === "free_plan" && /^\s*(?:plans?\s+)?create[sd]?\s+bad\s+incentives\b/i.test(after)) continue;
      if (type === "free_plan" && /^(?:free\s+forever|forever\s+free)$/i.test(match[0])) {
        const affirmativeBefore = /(?:\$\s*0(?:\.00)?[.!,:]?|\b(?:is|are|stays?|remains?))\s*$/i.test(before);
        const affirmativeAfter = /^\s*[.,:!–-]?\s*(?:get\s+started|sign\s*up|start\s+(?:now|free)|with\b|for\b|includes\b)/i.test(after);
        if (!affirmativeBefore && !affirmativeAfter) continue;
      }
      return { type, evidence: text.slice(Math.max(0, match.index - 70), match.index + match[0].length + 150) };
    }
  }
  return null;
}
