import {spawn} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const dir=dirname(fileURLToPath(import.meta.url)),assets=join(dir,'assets');
const common=[
  '[0:a]loudnorm=I=-22:TP=-7:LRA=9,aresample=48000[music]',
  '[1:a]asplit=2[voice][control]',
  '[music][control]sidechaincompress=threshold=0.019:ratio=4:attack=12:release=260:makeup=1[ducked]',
  '[2:a]volume=0.65[effects]'
].join(';');
const master='[ducked][voice][effects]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.82:level=false,';
async function pass(normalization,analysis=false){
  const filters=common+';'+master+normalization+',aresample=48000,apad,atrim=duration=34.666666667[master]';
  const args=['-hide_banner','-nostats','-y','-i',join(assets,'studio-score.wav'),'-i',join(assets,'narration.wav'),'-i',join(assets,'studio-effects.wav'),'-filter_complex',filters,'-map','[master]','-ar','48000','-ac','2'];
  args.push(...(analysis?['-f','null','-']:['-c:a','pcm_s24le',join(assets,'studio-mix.wav')]));
  const p=spawn('ffmpeg',args,{stdio:['ignore','ignore','pipe']});let log='';p.stderr.on('data',b=>log+=b);
  await new Promise((resolve,reject)=>{p.on('error',reject);p.on('close',code=>code===0?resolve():reject(new Error(log)));});return log;
}
const analysis=await pass('loudnorm=I=-14:TP=-2.3:LRA=7:print_format=json',true);
const matches=[...analysis.matchAll(/\{\s*"input_i"[\s\S]*?\}/g)];if(!matches.length)throw new Error('Missing mastering measurements');
const measured=JSON.parse(matches.at(-1)[0]);
const final=await pass(`loudnorm=I=-14:TP=-2.3:LRA=7:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=json`);
await writeFile(join(assets,'audio-mastering.log'),analysis+'\nSECOND PASS\n'+final);console.log('Two-pass master ready: narration, ducked music and synchronized effects.');
