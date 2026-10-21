import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSimplyCodes, parseReaSimplyCodes, compareDiscoveryCandidates } from "./lib/simplycodes.mjs";
import { hash } from "./lib/offer-sources.mjs";

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const at = arg.indexOf("=");
  return at >= 0 ? [arg.slice(2, at), arg.slice(at + 1)] : [arg.slice(2), true];
}));
if (!args.input || !args.source || !args.tool || !args["observed-at"] || !["html", "text", "rea"].includes(args.format)) {
  console.error("Usage: npm run coupons:inspect -- --input=/path/to/capture --format=rea|html|text --source=https://simplycodes.com/store/example.com --tool=brand-slug --observed-at=ISO_DATE [--output=/path/report.json] [--write-candidates]");
  process.exitCode = 1;
} else {
  const stat = await fs.stat(args.input);
  if (!stat.isFile() || stat.size > 16_000_000) throw new Error("Expected a regular capture file under 16 MB");
  const input = await fs.readFile(args.input, "utf8");
  const options = { sourceUrl: args.source, toolSlug: args.tool, observedAt: args["observed-at"], format: args.format };
  const report = args.format === "rea" ? parseReaSimplyCodes(JSON.parse(input), options) : parseSimplyCodes(input, options);
  report.offers.sort(compareDiscoveryCandidates);
  report.inputSha256 = hash(input);
  report.importedAt = new Date().toISOString();
  // Import time is separate from source observation time; an old capture does
  // not become a freshly verified coupon merely because it was imported today.
  if (args["write-candidates"]) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const snapshotPath = path.join(root, "lib/data/offer-snapshot.json");
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
    const known = ["catalog-seeds.json", "expanded-tools.json"];
    const tools = (await Promise.all(known.map(name => fs.readFile(path.join(root, "lib/data", name), "utf8")))).flatMap(text => JSON.parse(text));
    if (!tools.some(tool => tool.slug === args.tool)) throw new Error("Unknown catalog tool slug");
    if (report.status === "parsed") {
      const candidates = new Map(snapshot.candidates.map(candidate => [`${candidate.sourceUrl}:${candidate.candidateId || candidate.code || candidate.status}`, candidate]));
      for (const candidate of report.offers) {
        const key = `${candidate.sourceUrl}:${candidate.candidateId}`;
        if (!candidates.has(key) || Date.parse(candidates.get(key).observedAt) <= Date.parse(candidate.observedAt)) candidates.set(key, candidate);
      }
      snapshot.candidates = [...candidates.values()].slice(-1000);
      await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    }
  }
  const output = `${JSON.stringify(report, null, 2)}\n`;
  if (args.output) await fs.writeFile(args.output, output);
  process.stdout.write(output);
  if (report.status !== "parsed") process.exitCode = 2;
}
