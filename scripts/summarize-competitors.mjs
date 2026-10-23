import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "parse5";

const directory = process.argv[2] || "/tmp";
const sources = ["simplycodes", "secret", "appsumo", "dealfuel", "saasfolio"];
const results = [];
for (const name of sources) {
  const file = `${directory}/saasfolio-rea-competitor-${name}.json`;
  const raw = await readFile(file);
  const evidence = JSON.parse(raw);
  assert.equal(evidence.operation, "capture_browser_scenario");
  const result = evidence.normalized_result;
  const final = result.steps.at(-1);
  const dom = final.artifacts.dom.value;
  assert.equal(Buffer.byteLength(dom.text), dom.bytes, name);
  assert.equal(createHash("sha256").update(dom.text).digest("hex"), dom.sha256, name);
  let pageTitle = "", searchInputs = 0, categoryLinks = 0, links = 0, icons = 0;
  const attrs = node => Object.fromEntries((node.attrs || []).map(attribute => [attribute.name, attribute.value]));
  const text = node => node.value || (node.childNodes || []).map(text).join("");
  function inspect(node) {
    const values = attrs(node);
    if (node.tagName === "title") pageTitle = text(node);
    if (node.tagName === "input" && /search/i.test(`${values.type || ""} ${values.name || ""} ${values.placeholder || ""}`)) searchInputs++;
    if (node.tagName === "link" && /icon/.test(values.rel || "")) icons++;
    if (node.tagName === "a") { links++; if (/categor|\/browse/.test(values.href || "")) categoryLinks++; }
    for (const child of node.childNodes || []) inspect(child);
  }
  inspect(parse(dom.text));
  const statuses = result.events.items.filter(event => event.resource_type === "document" && event.kind === "response").map(event => event.status);
  const blocked = /just a moment|attention required|captcha/i.test(pageTitle) || statuses.at(-1) === 403;
  results.push({ name, sourceUrl: evidence.parameters.start_url.url, evidenceId: evidence.evidence_id, captureFileSha256: createHash("sha256").update(raw).digest("hex"), localCaptureFinishedAt: (await stat(file)).mtime.toISOString(), browser: result.browser, documentStatuses: statuses, dom: { bytes: dom.bytes, sha256: dom.sha256 }, blocked, pageTitle,
    pageInventory: blocked ? null : { links, searchInputs, categoryLinks, declaredIcons: icons },
    completeness: result.completeness, limitations: evidence.limitations,
  });
}
const output = "docs/research/competitors/rea-observations.json";
await writeFile(output, `${JSON.stringify({ tool: "rea-agents", version: "6.7.0", scope: "Public navigation in isolated temporary browser profiles. No checkout, accounts or challenge bypass.", results }, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ name, documentStatuses, blocked, pageInventory }) => ({ name, documentStatuses, blocked, pageInventory }))));
