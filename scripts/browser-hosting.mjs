import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from 'parse5';
import { openChromePage } from './lib/chrome-page.mjs';
import { loadCatalogModule } from './lib/load-catalog.mjs';
const origin = (process.argv[2] || 'http://127.0.0.1:3245').replace(/\/$/,'');
const { HOSTING_ARTICLES } = loadCatalogModule('lib/data/hosting-articles.ts');
const { HOSTING_PROVIDERS } = loadCatalogModule('lib/data/hosting-providers.ts');
const nodes = (node, tag) => [...(node.tagName === tag ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, tag))];
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const content = node => node?.value || (node?.childNodes || []).map(content).join('');
for(const article of HOSTING_ARTICLES) {
 const response=await fetch(`${origin}/articles/${article.slug}`);
 assert.equal(response.status,200);
 const doc=parse(await response.text());
 const metas=nodes(doc,'meta');
 assert.equal(attr(nodes(doc,'link').find(n=>attr(n,'rel')==='canonical'),'href'),`https://saasfolio.tech/articles/${article.slug}`);
 assert.ok(metas.some(n=>attr(n,'name')==='description' && attr(n,'content').length>=70));
 assert.ok(metas.some(n=>attr(n,'property')==='og:type' && attr(n,'content')==='article'));
 assert.ok(metas.some(n=>attr(n,'name')==='twitter:card' && attr(n,'content')==='summary_large_image'));
 assert.ok(metas.some(n=>attr(n,'property')==='og:image' && attr(n,'content').includes(article.slug)));
 assert.ok(content(doc).includes(article.sections.at(-1).content),`${article.slug}: full article before client scripts`);
 assert.ok(nodes(doc,'img').some(n=>attr(n,'alt')===article.coverImage.alt));
 assert.ok(!metas.some(n=>attr(n,'name')==='google-adsense-account'));
 const graph=nodes(doc,'script').filter(n=>attr(n,'type')==='application/ld+json').flatMap(n=>JSON.parse(content(n))['@graph']||[]);
 const schema=graph.find(n=>n['@type']==='Article');
 assert.ok(schema.wordCount>700 && schema.image.url.endsWith('.webp'));
}
const og=await fetch(`${origin}/articles/${HOSTING_ARTICLES[0].slug}/opengraph-image`);
assert.equal(og.status,200);assert.match(og.headers.get('content-type'),/image\/png/);
const { getAllDeals } = loadCatalogModule('lib/data/deals-data.ts');
for (const slug of ['hostinger-vps-introductory-offer','siteground-startup-first-term-offer','cloudways-two-month-introductory-offer','kinsta-three-month-introductory-offer']) {
 const offer=getAllDeals().find(deal=>deal.slug===slug);
 assert.ok(offer, `${slug}: sourced, fresh offer is published`);
 const response=await fetch(`${origin}/go/${slug}`,{redirect:'manual'});
 assert.equal(response.status,302);
 assert.equal(response.headers.get('location'),offer.destinationUrl, `${slug}: exact campaign survives the redirect`);
 assert.ok(response.headers.get('cache-control').includes('no-store'));
}
const browser=await openChromePage(origin);
const {page,evaluate,until}=browser;
const visits=[];
async function visit(path){await page('Page.navigate',{url:origin+path});await until(()=>evaluate(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && !!document.querySelector('main h1')`),path);}
async function setValue(selector,value){await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
try {
 await page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const width of [390,1440]){
  await page('Emulation.setDeviceMetricsOverride',{width,height:950,mobile:width===390,deviceScaleFactor:1});
  for(const path of ['/hosting',`/articles/${HOSTING_ARTICLES[0].slug}`]){
   await visit(path);
   await until(()=>evaluate("[...document.querySelectorAll('main img')].filter(i=>i.loading!=='lazy').every(i=>i.complete && i.naturalWidth>0)"),'priority artwork loads');
   const state=await evaluate("({headings:document.querySelectorAll('main h1').length,width:document.documentElement.scrollWidth,broken:[...document.querySelectorAll('main a[href^=\"#\"]')].map(a=>a.hash.slice(1)).filter(id=>id&&!document.getElementById(decodeURIComponent(id)))})");
   assert.equal(state.headings,1);assert.ok(state.width<=width+1,`${path}: mobile overflow`);assert.deepEqual(state.broken,[]);
   visits.push({path,width,...state});
   const shot=await page('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
   await writeFile(join(tmpdir(),`saasfolio-${path==='/hosting'?'hosting':'hosting-article'}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 await visit('/hosting');
 await until(()=>evaluate("Object.keys(document.querySelector('#finder input[type=search]')).some(k=>k.startsWith('__reactProps'))"),'finder hydration');
 assert.equal(await evaluate("document.querySelectorAll('#finder article').length"),HOSTING_PROVIDERS.length);
 await setValue('#finder input[type=search]','hetzner');
 await until(()=>evaluate("document.querySelectorAll('#finder article').length===1"),'provider search');
 assert.ok(await evaluate("document.querySelector('#finder article').innerText.includes('Hetzner')"));
 await setValue('#finder input[type=search]','');
 await until(()=>evaluate(`document.querySelectorAll('#finder article').length===${HOSTING_PROVIDERS.length}`),'search reset');
 await evaluate("[...document.querySelectorAll('#finder article input[type=checkbox]')].slice(0,3).forEach(el=>el.click())");
 await until(()=>evaluate("document.querySelectorAll('#shortlist thead th').length===4"),'three provider shortlist');
 await evaluate("document.querySelectorAll('#finder article input[type=checkbox]')[3].click()");
 await until(()=>evaluate("document.querySelector('#finder').innerText.includes('Remove one to add another')"),'shortlist cap');
 await setValue('#finder input[type=search]','no-such-host');
 await until(()=>evaluate("document.querySelectorAll('#finder article').length===0"),'empty state');
 assert.ok(await evaluate("document.querySelectorAll('#shortlist thead th').length===4"),'shortlist survives filtering');
 assert.ok(await evaluate("document.querySelector('#cost-calculator [aria-live]').innerText.includes('$48.00')"));
 await setValue('#cost-calculator input','10');
 await until(()=>evaluate("document.querySelector('#cost-calculator [aria-live]').innerText.includes('$132.00')"),'renewal math recalculates');
 await setValue('#cost-calculator input','');
 await until(()=>evaluate("document.querySelector('#cost-calculator [aria-live]').innerText.includes('Enter valid')"),'empty input produces no false quote');
 await page('Emulation.setScriptExecutionDisabled',{value:true});
 for(const path of ['/hosting',`/articles/${HOSTING_ARTICLES[0].slug}`]){await visit(path);assert.ok(await evaluate("document.querySelector('main').innerText.length>3000"));visits.push({path,javascript:false});}
 assert.deepEqual(browser.runtimeErrors,[]);assert.deepEqual(browser.failedAssets,[]);assert.deepEqual(browser.writes,[]);
 await writeFile('docs/reports/hosting-browser-2026-11-17.json',JSON.stringify({generatedAt:new Date().toISOString(),origin,articleMetadataChecks:HOSTING_ARTICLES.length,visits,interactionChecks:['search','empty state','three-provider cap','shortlist retains selection','renewal math','invalid inputs'],runtimeErrors:browser.runtimeErrors,failedAssets:browser.failedAssets},null,2)+'\n');
 console.log(`Hosting QA passed: ${HOSTING_ARTICLES.length} server-rendered article metadata/schema checks, generated social image, desktop/mobile layouts, filters, shortlist, calculator, reduced motion and no-JavaScript reading.`);
}finally{await browser.close();}
