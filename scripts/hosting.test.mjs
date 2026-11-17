import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { loadCatalogModule } from './lib/load-catalog.mjs';
const { calculateHostingCost, filterHostingProviders } = loadCatalogModule('lib/hosting.ts');
const { HOSTING_PROVIDERS } = loadCatalogModule('lib/data/hosting-providers.ts');
const { HOSTING_ARTICLES } = loadCatalogModule('lib/data/hosting-articles.ts');
const { getPublishedTool } = loadCatalogModule('lib/published-catalog.ts');

test('hosting budget includes renewals, required extras and the full prepaid commitment', () => {
 const q = { introRate: 3, introMonths: 12, renewalRate: 15, monthlyExtras: 2, setup: 20 };
 assert.deepEqual(calculateHostingCost(q, 24), { total: 284, upfront: 36, renewal: 180, extras: 68, renewalMonths: 12 });
 assert.equal(calculateHostingCost({ ...q, introMonths: 36 }, 12).total, 152, 'A longer prepaid term is never prorated into a smaller cash commitment');
 assert.equal(calculateHostingCost({ introRate: 0, introMonths: 1, renewalRate: 0, monthlyExtras: 0, setup: 0 }, 12).total, 0);
 for (const patch of [{ introRate: NaN }, { renewalRate: Infinity }, { monthlyExtras: -1 }, { introMonths: 1.5 }, { introMonths: 0 }, { setup: 1000001 }]) assert.equal(calculateHostingCost({ ...q, ...patch }, 24), undefined);
 for (const months of [0, -1, 121, NaN, 1.5]) assert.equal(calculateHostingCost(q, months), undefined);
});
test('finder composes workload, approach and management filters without changing order', () => {
 const results = filterHostingProviders(HOSTING_PROVIDERS, '  HETZNER ', 'VPS', 'application', false);
 assert.deepEqual(results.map(p => p.slug), ['hetzner']);
 assert.equal(filterHostingProviders(HOSTING_PROVIDERS, '', 'VPS', 'all', true).length, 0);
 const noServers = filterHostingProviders(HOSTING_PROVIDERS, '', 'all', 'all', true);
 assert.ok(noServers.length > 0 && noServers.every(p => p.kind !== 'VPS' && p.slug !== 'coolify'));
 assert.equal(filterHostingProviders(HOSTING_PROVIDERS, 'does-not-exist', 'all', 'all', false).length, 0);
});
test('hosting reading journeys resolve to published profiles, related articles and local cover assets', () => {
 const { DETAILED_ARTICLES } = loadCatalogModule('lib/data/articles-data.ts');
 for(const p of HOSTING_PROVIDERS) assert.ok(getPublishedTool(p.slug), `${p.slug}: publicly usable profile`);
 for(const article of HOSTING_ARTICLES) {
   assert.ok(DETAILED_ARTICLES.some(a => a.slug === article.slug));
   assert.ok(existsSync(`public${article.coverImage.src}`));
   for(const slug of article.providerSlugs) assert.ok(getPublishedTool(slug));
   for(const slug of article.relatedArticlesSlugs) assert.ok(DETAILED_ARTICLES.some(a => a.slug === slug), `${article.slug}: ${slug}`);
 }
 assert.ok(!readFileSync('app/layout.tsx', 'utf8').includes('google-adsense-account'));
});
