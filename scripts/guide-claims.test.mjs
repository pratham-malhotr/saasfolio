import test from "node:test";
import assert from "node:assert/strict";
import { extractClaimTokens, guideClaimTexts, guideEvidenceDate, guideSourceUrls, missingClaimTokens } from "../lib/guide-claims.mjs";

const guide = {
  reviewedAt: "2026-10-23",
  sourceUrl: "https://example.com/pricing",
  savingsOptions: [{ type: "Annual billing", saving: "20% off annual plans", terms: "", sourceUrl: "https://example.com/pricing" }],
  sourceNotes: ["Starter costs $12 per seat with a 14-day trial.", "Teams of 1,000 seats pay $1,200 a year."],
  sources: [{ label: "Help", url: "https://help.example.com/billing" }, { label: "Bad", url: "http://insecure.example.com" }],
};

test("claim tokens cover percentages, prices and trial lengths from savings and pricing notes", () => {
  assert.deepEqual(extractClaimTokens(guideClaimTexts(guide)), ["$12", "$1200", "14day", "20%"]);
});

test("figures are re-found despite spacing, decimals and plural units", () => {
  const page = "Save 20 % yearly. Starter: $12.00 per seat. Try it for 14 days. Enterprise from $1,200.";
  assert.deepEqual(missingClaimTokens(["$12", "$1200", "14day", "20%"], page), []);
});

test("a figure embedded in a different number does not count as evidence", () => {
  assert.deepEqual(missingClaimTokens(["20%", "$12"], "Up to 120% faster. Plans from $12.50 or $120."), ["20%", "$12"]);
});

test("a changed figure is reported as missing", () => {
  assert.deepEqual(missingClaimTokens(["20%", "14day"], "Save 15% annually with a 7-day trial."), ["20%", "14day"]);
});

test("only HTTPS guide sources are fetched, de-duplicated and capped", () => {
  assert.deepEqual(guideSourceUrls(guide), ["https://example.com/pricing", "https://help.example.com/billing"]);
});

test("only a successful verification extends the evidence date, never a future one", () => {
  const now = Date.parse("2026-11-27T12:00:00Z");
  assert.equal(guideEvidenceDate(guide, undefined, now), Date.parse("2026-10-23T00:00:00Z"));
  assert.equal(guideEvidenceDate(guide, { status: "changed", verifiedAt: "2026-11-27T00:00:00Z" }, now), Date.parse("2026-10-23T00:00:00Z"));
  assert.equal(guideEvidenceDate(guide, { status: "verified", verifiedAt: "2026-11-27T00:00:00Z" }, now), Date.parse("2026-11-27T00:00:00Z"));
  assert.equal(guideEvidenceDate(guide, { status: "verified", verifiedAt: "2026-12-30T00:00:00Z" }, now), Date.parse("2026-10-23T00:00:00Z"));
});

test("spelled-out durations are checkable figures", () => {
  assert.deepEqual(extractClaimTokens(["Two months free with annual payment and a seven-day trial."]), ["2month", "7day"]);
  assert.deepEqual(missingClaimTokens(["2month", "7day"], "Get 2 months free on yearly plans. Start a 7 day trial."), []);
});

test("savings without an amount need their defining term on the source", async () => {
  const { missingSavingTypes } = await import("../lib/guide-claims.mjs");
  const education = { savingsOptions: [{ type: "Education offer", saving: "Verified student pricing", terms: "", sourceUrl: "https://example.com" }] };
  assert.deepEqual(missingSavingTypes(education, "Pricing for students and teachers"), []);
  assert.deepEqual(missingSavingTypes(education, "Pricing for teams"), ["Education offer"]);
});
