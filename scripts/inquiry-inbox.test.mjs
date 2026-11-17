import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogModule } from './lib/load-catalog.mjs';
const { filterInquiries, inquiryExport } = loadCatalogModule('lib/inquiry-inbox.ts');
const rows = [
 { id:'brand-1', kind:'submission', email:'owner@example.com', payload:{ submissionType:'brand',toolName:'Example Host',websiteUrl:'https://example.com',keyFeatures:['One','Two','Three'],contactName:'Jane Owner' },status:'pending',created_at:'2026-11-17T00:00:00Z',submissionFingerprint:'must-not-be-exported' },
 { id:'code-1',kind:'submission',email:'user@example.com',payload:{submissionType:'code',toolName:'Other'},status:'resolved',created_at:'2026-11-16T00:00:00Z' },
 { id:'report-1',kind:'contact',email:'reader@example.com',payload:{reportStatus:'unreviewed',subject:'Expired listing'},status:'reviewing',created_at:'2026-11-15T00:00:00Z' },
];
test('brand, review status and contact search compose without exposing unmatched inquiries',()=>{
 assert.deepEqual(filterInquiries(rows,'brands','pending',' JANE ').map(r=>r.id),['brand-1']);
 assert.equal(filterInquiries(rows,'brands','resolved','').length,0);
 assert.deepEqual(filterInquiries(rows,'reports','all','expired').map(r=>r.id),['report-1']);
 assert.deepEqual(filterInquiries(rows,'all','all','owner@example.com').map(r=>r.id),['brand-1']);
});
test('an inbox export preserves contact and product details only for the selected loaded records',()=>{
 const exported=inquiryExport(filterInquiries(rows,'brands','all',''));
 assert.equal(exported.count,1);
 assert.equal(exported.inquiries[0].email,'owner@example.com');
 assert.deepEqual(exported.inquiries[0].payload.keyFeatures,['One','Two','Three']);
 assert.equal(exported.inquiries[0].submissionFingerprint,undefined);
 assert.ok(exported.scope.includes('loaded'));
});
