import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogModule } from './lib/load-catalog.mjs';
const { getHostingAffiliateUrl } = loadCatalogModule('lib/server/hosting-affiliates.ts', { 'server-only': {} });
test('hosting referrals preserve promotional activation routes and reject unsafe configuration', () => {
 const old=process.env.HOSTING_AFFILIATE_URLS;
 try {
  process.env.HOSTING_AFFILIATE_URLS=JSON.stringify({hostinger:'https://www.hostinger.com/?ref=test', 'hostinger-vps-introductory-offer':'https://www.hostinger.com/vps-hosting?ref=test',kinsta:'https://127.0.0.1/private'});
  assert.equal(getHostingAffiliateUrl('hostinger','unmapped-campaign'),undefined);
  assert.equal(getHostingAffiliateUrl('hostinger','hostinger-vps-introductory-offer'),'https://www.hostinger.com/vps-hosting?ref=test');
  assert.equal(getHostingAffiliateUrl('hostinger','hostinger-pricing',true),'https://www.hostinger.com/?ref=test');
  assert.equal(getHostingAffiliateUrl('kinsta',undefined,true),undefined);
  assert.equal(getHostingAffiliateUrl('unknown',undefined,true),undefined);
  for(const value of ['{','null','[]','"https://example.com"']) {process.env.HOSTING_AFFILIATE_URLS=value;assert.equal(getHostingAffiliateUrl('hostinger',undefined,true),undefined);}
 }finally{if(old===undefined)delete process.env.HOSTING_AFFILIATE_URLS;else process.env.HOSTING_AFFILIATE_URLS=old;}
});
