import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {once} from 'node:events';
import sharp from 'sharp';

const dir=dirname(fileURLToPath(import.meta.url)),out=join(dir,'exports');
await mkdir(out,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'saasfolio-studio-'));
const chrome=spawn(process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
  '--headless=new','--remote-debugging-pipe',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--allow-file-access-from-files','--hide-scrollbars','--disable-background-timer-throttling','about:blank'
],{stdio:['ignore','ignore','pipe','pipe','pipe']});
let seq=0,buffer='',errors='';const pending=new Map();let encoder;const runtimeErrors=[];
chrome.stderr.on('data',b=>errors=(errors+b).slice(-1800));
chrome.on('exit',code=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(`Chrome exited ${code}: ${errors}`));}pending.clear();});
chrome.stdio[4].on('data',chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf('\0'))>=0){const m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params.exceptionDetails);if(!m.id||!pending.has(m.id))continue;const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
function send(method,params={},sessionId){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out: ${errors}`));},30000);pending.set(id,{resolve,reject,timer});chrome.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0');});}
try{
  const{targetId}=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  const page=(method,params)=>send(method,params,sessionId),evaluate=async expression=>{const r=await page('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await page('Page.enable');await page('Runtime.enable');await page('Emulation.setDeviceMetricsOverride',{width:1080,height:1920,deviceScaleFactor:1,mobile:false});
  await page('Page.navigate',{url:pathToFileURL(join(dir,'reel.html')).href+'?render'});
  let initialized=false;for(let i=0;i<100;i++){initialized=await evaluate('Boolean(window.film && window.ready)');if(initialized)break;await new Promise(r=>setTimeout(r,60));}
  if(!initialized)throw new Error('Film did not initialize: '+JSON.stringify(runtimeErrors));await evaluate('window.ready');
  const config=await evaluate('({duration:film.duration,fps:film.fps,stages:film.stages,snapshots:film.snapshots,captionWords:NARRATION_WORDS.length})');
  const imageAt=async t=>Buffer.from(await evaluate(`film.draw(${t});document.querySelector('canvas').toDataURL('image/jpeg',.985).split(',')[1]`),'base64');
  const thumbs=[];
  for(let i=0;i<config.snapshots.length;i++){const b=await imageAt(config.snapshots[i]);await writeFile(join(out,`scene-${String(i+1).padStart(2,'0')}.jpg`),b);thumbs.push({input:await sharp(b).resize(270,480).jpeg({quality:94}).toBuffer(),left:(i%4)*270,top:Math.floor(i/4)*480});}
  await sharp({create:{width:1080,height:960,channels:3,background:'#080B09'}}).composite(thumbs).jpeg({quality:96}).toFile(join(out,'studio-storyboard.jpg'));
  await evaluate('film.cover()');await writeFile(join(out,'saasfolio-studio-cover.jpg'),Buffer.from(await evaluate("document.querySelector('canvas').toDataURL('image/jpeg',.99).split(',')[1]"),'base64'));
  if(runtimeErrors.length)throw new Error('Animation errors: '+JSON.stringify(runtimeErrors));
  await writeFile(join(out,'render-config.json'),JSON.stringify(config,null,2));
  console.log(`Studio storyboard and cover ready. ${config.captionWords} timed words, ${config.fps} fps.`);
  if(!process.argv.includes('--preview')){
    await readFile(join(dir,'assets/studio-mix.wav'));
    const frames=Math.round(config.duration*config.fps),file=join(out,'saasfolio-studio-reel-v2.mp4');
    encoder=spawn('ffmpeg',['-hide_banner','-loglevel','warning','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(config.fps),'-i','pipe:0','-i',join(dir,'assets/studio-mix.wav'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','slow','-crf','15','-profile:v','high','-level','4.2','-pix_fmt','yuv420p','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart','-t',String(config.duration),'-metadata','title=SaaSFolio | Your next software advantage.','-metadata','comment=Studio edition: neural narration, original score and effects, word-synced captions, bespoke 3D motion design. Illustrated product demonstrations.',file],{stdio:['pipe','ignore','pipe']});
    let encodeError='';encoder.stderr.on('data',b=>encodeError=(encodeError+b).slice(-3000));const done=once(encoder,'close');
    for(let frame=0;frame<frames;frame++){if(encoder.exitCode!==null)throw new Error(encodeError);const b=await imageAt(frame/config.fps);if(!encoder.stdin.write(b))await once(encoder.stdin,'drain');if(frame%180===0)console.log(`Studio frames: ${frame}/${frames} (${(frame/config.fps).toFixed(1)}s)`);}
    encoder.stdin.end();const[code]=await done;if(code!==0)throw new Error(encodeError);console.log('Finished: '+file);
  }
}finally{
  if(encoder&&encoder.exitCode===null)encoder.kill();const closed=once(chrome,'exit');chrome.kill();await closed;await rm(profile,{recursive:true,force:true});
}
