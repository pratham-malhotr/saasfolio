import assert from "node:assert/strict";
import test from "node:test";
import { editorialGuideIssues, duplicatedEditorialParagraphs } from "../lib/editorial-quality.mjs";

const now = Date.parse("2026-11-05T12:00:00Z");
const valid = () => ({ intro: "Compare the workspace configuration.", summary: "Identify who edits and which billing term fits.", metaDescription: "A source-based workspace buying guide.", reviewedAt: "2026-10-23", sourceUrl: "https://provider.example/pricing", sections: [{ heading: "Seats", text: "Count editing access." }, { heading: "Billing", text: "Compare the full commitment." }, { heading: "Exit", text: "Test a representative export." }], decisionRows: [{ option: "Individual", bestFor: "One editor", check: "Needed features" }, { option: "Team", bestFor: "Shared work", check: "Permissions and billable roles" }], sourceNotes: ["The source distinguishes workspace roles."], sources: [], savingsOptions: [] });

test("complete concise guidance is accepted without an invented word-count threshold", () => {
  assert.deepEqual(editorialGuideIssues(valid(), now), []);
  assert.deepEqual(editorialGuideIssues(valid(), now + 90 * 86400000), [], "Evergreen editorial guidance remains available after a pricing observation ages");
});

test("missing sources, empty guidance and generated placeholder text cannot qualify for publication", () => {
  for (const change of [{ sourceUrl: "http://provider.example" }, { sourceUrl: "https://127.0.0.1" }, { sourceNotes: [] }, { sections: [] }, { decisionRows: [] }, { intro: "Lorem ipsum" }, { summary: "Example is listed for teams. Visit the official provider." }]) assert.ok(editorialGuideIssues({ ...valid(), ...change }, now).length);
});

test("review dates must be genuine calendar dates and cannot come from the future", () => {
  for (const reviewedAt of ["2026-02-30", "2026-11-06", "today", ""]) assert.ok(editorialGuideIssues({ ...valid(), reviewedAt }, now).some(issue => /review date/.test(issue)));
});

test("renaming the brand does not turn the same substantive paragraph into original analysis", () => {
  const tail = "Compare the complete workspace, billing term and renewal cost before choosing. Record the account owner and the exact permissions needed, then inspect the final quote and retain the conditions for later review.";
  const duplicated = duplicatedEditorialParagraphs([{ slug: "first", paragraphs: [`FirstBrand: ${tail}`] }, { slug: "second", paragraphs: [`SecondBrand: ${tail}`] }], ["FirstBrand", "SecondBrand"]);
  assert.deepEqual(duplicated.map(item => item.slugs), [["first", "second"]]);
  assert.deepEqual(duplicatedEditorialParagraphs([{ slug: "first", paragraphs: ["Check terms"] }, { slug: "second", paragraphs: ["Check terms"] }]), []);
});
