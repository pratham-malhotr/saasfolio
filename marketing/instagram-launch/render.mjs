import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { once } from 'node:events';
import sharp from 'sharp';

if (process.argv.includes('--advanced')) {
  await import('./advanced/render.mjs');
  process.exit(0);
}

const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../..');
await mkdir(join(dir,'assets'),{recursive:true});await mkdir(join(dir,'exports'),{recursive:true});
const fonts=[['36966cca54120369-s.p.woff2','display.woff2'],['e4af272ccee01ff0-s.p.woff2','body.woff2'],['558ca1a6aa3cb55e-s.p.woff2','mono.woff2']];
for(const [source,dest] of fonts) {
  try {await readFile(join(dir,'assets',dest));} catch {await copyFile(join(root,'.next/static/media',source),join(dir,'assets',dest));}
}
const profile=await mkdtemp(join(tmpdir(),'saasfolio-film-'));
const chrome=spawn(process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
  '--headless=new','--remote-debugging-pipe',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--allow-file-access-from-files','--hide-scrollbars','--disable-background-timer-throttling','about:blank'
],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let sequence=0,buffer='',chromeErrors='';const pending=new Map();
chrome.stderr.on('data',b=>chromeErrors=(chromeErrors+b.toString()).slice(-1500));
chrome.on('exit',code=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(`Chrome exited ${code}: ${chromeErrors}`));}pending.clear();});
chrome.stdio[4].on('data',chunk=>{
  buffer+=chunk.toString();let end;
  while((end=buffer.indexOf('\0'))>=0){const m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);if(!m.id||!pending.has(m.id))continue;const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}
});
function send(method,params={},sessionId){const id=++sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}: ${chromeErrors}`));},30000);pending.set(id,{resolve,reject,timer});chrome.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
let encoder;
try{
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  const page=(method,params)=>send(method,params,sessionId);
  const evaluate=async expression=>{const r=await page('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await page('Page.enable');await page('Runtime.enable');
  await page('Emulation.setDeviceMetricsOverride',{width:1080,height:1920,deviceScaleFactor:1,mobile:false});
  await page('Page.navigate',{url:pathToFileURL(join(dir,'reel.html')).href+'?render'});
  let ready=false;for(let i=0;i<100;i++){ready=await evaluate('Boolean(window.film && window.ready)');if(ready)break;await new Promise(r=>setTimeout(r,50));}
  if(!ready)throw new Error('Film did not initialize');await evaluate('window.ready');
  const loaded=await evaluate(`Promise.all([document.fonts.load('700 48px Display'),document.fonts.load('400 32px Body'),document.fonts.load('400 20px Mono')]).then(x=>x.every(v=>v.length))`);
  if(!loaded)throw new Error('Brand fonts failed to load');
  const imageAt=async time=>Buffer.from(await evaluate(`film.draw(${time});document.querySelector('canvas').toDataURL('image/jpeg',.98).split(',')[1]`),'base64');
  const snapshots=[1.8,4.8,10.2,15.7,21.2,26.8,31.4];
  const thumbs=[];
  for(let i=0;i<snapshots.length;i++){
    const bytes=await imageAt(snapshots[i]);await writeFile(join(dir,'exports',`scene-${String(i+1).padStart(2,'0')}.jpg`),bytes);
    thumbs.push({input:await sharp(bytes).resize(270,480).jpeg({quality:90}).toBuffer(),left:i*270,top:0});
  }
  await sharp({create:{width:270*7,height:480,channels:3,background:'#080a08'}}).composite(thumbs).jpeg({quality:94}).toFile(join(dir,'exports','storyboard.jpg'));
  await evaluate('film.cover()');const cover=Buffer.from(await evaluate("document.querySelector('canvas').toDataURL('image/jpeg',.99).split(',')[1]"),'base64');
  await writeFile(join(dir,'exports','saasfolio-reel-cover.jpg'),cover);
  console.log('Brand fonts loaded. Cover and seven storyboard frames saved.');
  if(process.argv.includes('--preview'))process.exitCode=0;
  else{
    const frames=1024,fps=30;
    encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i',join(dir,'assets/original-score.wav'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','slow','-crf','16','-profile:v','high','-level','4.2','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1','-c:a','aac','-b:a','256k','-ar','48000','-af','loudnorm=I=-14:TP=-2.2:LRA=9','-movflags','+faststart','-t',String(frames/fps),'-metadata','title=SaaSFolio | Good software. Better prices.','-metadata','comment=Original motion design and synthesized instrumental score. Illustrated product demonstrations.',join(dir,'exports','saasfolio-instagram-reel.mp4')],{stdio:['pipe','ignore','pipe']});
    let errors='';encoder.stderr.on('data',b=>{errors=(errors+b.toString()).slice(-4000);});
    const done=once(encoder,'close');
    for(let frame=0;frame<frames;frame++){
      if(encoder.exitCode!==null)throw new Error('Encoder failed: '+errors);
      const bytes=await imageAt(frame/fps);if(!encoder.stdin.write(bytes))await once(encoder.stdin,'drain');
      if(frame%120===0)console.log(`Rendered ${frame}/${frames} frames (${(frame/fps).toFixed(1)}s)`);
    }
    encoder.stdin.end();const [code]=await done;if(code!==0)throw new Error(errors);console.log('Finished: exports/saasfolio-instagram-reel.mp4');
  }
}finally{if(encoder&&encoder.exitCode===null)encoder.kill();chrome.kill();}
