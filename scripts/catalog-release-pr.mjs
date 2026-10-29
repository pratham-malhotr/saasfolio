import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const exec = promisify(execFile);
const branch = process.env.CATALOG_BRANCH;
if (process.env.GITHUB_ACTIONS !== "true" || !["automation/offer-refresh", "automation/managed-catalog"].includes(branch)) throw new Error("This command only runs in the catalog release workflows.");
const run = async (command, args) => (await exec(command, args)).stdout.trim();
if (process.argv.includes("--prepare")) {
  let exists = true;
  try { await run("git", ["ls-remote", "--exit-code", "--heads", "origin", branch]); } catch (error) { if (error.code === 2) exists = false; else throw error; }
  if (exists) {
    await run("git", ["fetch", "origin", `${branch}:refs/remotes/origin/${branch}`]);
    await run("git", ["checkout", "-b", branch, `origin/${branch}`]);
    await run("git", ["merge", "--no-edit", "origin/main"]);
  } else await run("git", ["checkout", "-b", branch]);
  console.log(`Prepared ${branch}. Existing release conflicts require review; branches are never force-pushed.`);
} else {
  const managed = branch.endsWith("managed-catalog");
  const files = managed ? ["lib/data/managed-catalog.json", "lib/data/managed-public-index.json"] : ["lib/data/offer-snapshot.json", "lib/data/offer-url-history.json"];
  await run("git", ["add", "--", ...files]);
  let changed = false;
  try { await run("git", ["diff", "--cached", "--quiet"]); } catch (error) { if (error.code === 1) changed = true; else throw error; }
  if (changed) await run("git", ["commit", "-m", managed ? "Release approved editorial catalog" : "Refresh source-backed SaaS offers"]);
  let releaseChanges = false;
  try { await run("git", ["diff", "--quiet", "origin/main", "HEAD"]); } catch (error) { if (error.code === 1) releaseChanges = true; else throw error; }
  if (!releaseChanges) { console.log("No release changes."); process.exit(0); }
  await run("git", ["push", "--set-upstream", "origin", branch]);
  const existing = JSON.parse(await run("gh", ["pr", "list", "--base", "main", "--head", branch, "--state", "open", "--json", "url"]));
  if (existing.length) console.log(existing[0].url);
  else {
    const directory = await mkdtemp(join(tmpdir(), "saasfolio-release-"));
    try {
      const file = join(directory, "body.md");
      await writeFile(file, `${managed ? "Publishes approved, versioned editorial records while preserving canonical identities and excluding staff and private submission data." : "Refreshes publicly sourced offers and preserves historical offer destinations. Failed source requests never advance evidence timestamps."}\n\nValidation: unit tests, catalog validation and production build passed in the publishing workflow. Review this diff and complete the required Website checks before merging.\n`);
      console.log(await run("gh", ["pr", "create", "--base", "main", "--head", branch, "--title", managed ? "Release approved catalog content" : "Refresh sourced SaaS offers", "--body-file", file]));
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
}
