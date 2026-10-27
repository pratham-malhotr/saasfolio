import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { emptyOfferUrlHistory, rememberOfferIdentifiers, rememberOfferUrls, validateOfferUrlHistory } from "./lib/offer-url-history.mjs";

// One-time recovery and repeatable maintenance from the repository's actual
// recorded URLs. Running this never requests provider pages or invents slugs.
const root = path.resolve(import.meta.dirname, "..");
const historyPath = path.join(root, "lib/data/offer-url-history.json");
const snapshotPath = "lib/data/offer-snapshot.json";
const { getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
const canonicalize = slug => getToolBySlug(slug)?.slug;
let history;
try { history = validateOfferUrlHistory(JSON.parse(await fs.readFile(historyPath, "utf8"))); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  history = emptyOfferUrlHistory();
}
const aliases = JSON.parse(await fs.readFile(path.join(root, "lib/data/legacy-deal-aliases.json"), "utf8"));
rememberOfferIdentifiers(history, Object.entries(history.offers), canonicalize);
rememberOfferIdentifiers(history, Object.entries(aliases), canonicalize);
const commits = execFileSync("git", ["log", "--format=%H", "--reverse", "--", snapshotPath], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
for (const commit of commits) {
  const snapshot = JSON.parse(execFileSync("git", ["show", `${commit}:${snapshotPath}`], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }));
  rememberOfferUrls(history, snapshot.offers, canonicalize);
}
rememberOfferUrls(history, JSON.parse(await fs.readFile(path.join(root, snapshotPath), "utf8")).offers, canonicalize);
history.origins.snapshotCommits = [...new Set([...history.origins.snapshotCommits, ...commits])].sort();
const temporary = `${historyPath}.${randomUUID()}.tmp`;
try {
  await fs.writeFile(temporary, `${JSON.stringify(history, null, 2)}\n`, { flag: "wx" });
  await fs.rename(temporary, historyPath);
} finally { await fs.rm(temporary, { force: true }); }
console.log(`Retained ${Object.keys(history.offers).length} exact offer identifiers from legacy aliases and ${commits.length} tracked source snapshots.`);
