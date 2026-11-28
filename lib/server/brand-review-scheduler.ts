import "server-only";
import { reviewPendingBrandSubmissions } from "@/lib/server/brand-listings";

const HOUR = 60 * 60 * 1000;
const started = Symbol.for("saasfolio.brandReviewScheduler");

/**
 * Runs the automated brand review shortly after the server starts and then
 * every hour. Disable with BRAND_AUTO_REVIEW=false. Duplicate runs (several
 * processes) are safe: approval is transactional and emails are idempotent.
 */
export function startBrandReviewScheduler() {
  const scope = globalThis as typeof globalThis & { [started]?: boolean };
  if (scope[started] || process.env.BRAND_AUTO_REVIEW === "false") return;
  scope[started] = true;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const summary = await reviewPendingBrandSubmissions();
      if (summary.checked) console.info(`[brand-review] checked=${summary.checked} approved=${summary.approved} awaitingDns=${summary.awaitingDns} needsEditor=${summary.needsEditor}`);
    } catch {
      console.warn("[brand-review] run failed");
    } finally { running = false; }
  };
  setTimeout(run, 2 * 60 * 1000).unref();
  setInterval(run, HOUR).unref();
}
