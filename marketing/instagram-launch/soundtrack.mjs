// Original instrumental score. No samples, external recordings, or dependencies.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const SR=48000, duration=1024/30, N=Math.ceil(SR*duration), beat=60/112.5;
const left=new Float32Array(N),right=new Float32Array(N),TAU=Math.PI*2;
let seed=91573;
function noise(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2147483648-1;}
function add(time,len,fn,pan=0,gain=1){
  const start=Math.round(time*SR), count=Math.min(Math.ceil(len*SR),N-start),l=Math.sqrt((1-pan)/2)*gain,r=Math.sqrt((1+pan)/2)*gain;
  for(let j=Math.max(0,-start);j<count;j++){const v=fn(j/SR,j)*1.0;left[start+j]+=v*l;right[start+j]+=v*r;}
}
const hz=m=>440*2**((m-69)/12);
const chords=[[53,56,60,67],[49,53,56,60],[56,60,63,70],[51,55,58,65]];
const sceneTimes=[3.2,6.4,12.8,18.133333,23.466667,28.8];
// Warm, moving chord bed, with space around the transients.
for(let bar=0;bar<16;bar++){
  const time=bar*4*beat,chord=chords[Math.floor(bar/2)%4];
  chord.forEach((m,k)=>add(time,4*beat+.6,(s)=>{
    const env=Math.min(1,s/.28)*Math.exp(-s*.22)*Math.min(1,(4*beat+.6-s)/.5);
    const sc=1-.28*Math.exp(-((s%beat)/.065));
    const f=hz(m);return (Math.sin(TAU*f*s)+.33*Math.sin(TAU*f*1.002*s)+.14*Math.sin(TAU*f*2*s))*.027*env*sc;
  },(k-1.5)*.36));
}
// Soft analog arpeggio; eight-note pulse and stereo echoes.
for(let step=0;step<128;step++){
  const time=step*beat/2, chord=chords[Math.floor(step/16)%4],order=[0,2,1,3,2,1,3,2],m=chord[order[step%8]]+12;
  const introGain=time<3.2?.45:time<6.4?.65:1;
  const fn=s=>{const env=Math.min(1,s/.005)*Math.exp(-s*9);const f=hz(m);return(Math.sin(TAU*f*s)+.22*Math.sin(TAU*2*f*s)+.08*Math.sin(TAU*3*f*s))*env*.095*introGain;};
  add(time,.8,fn,step%2?.5:-.5);
  add(time+beat*.75,.8,fn,step%2?-.65:.65,.23);
}
// Tight kick, low bass, brushed clap, and restrained hi-hats.
for(let b=0;b<64;b++){
  const time=b*beat, sparse=time<6.4;
  if(!sparse||b%2===0)add(time,.46,s=>{const phase=TAU*(46*s+82*.022*(1-Math.exp(-s/.022)));return Math.sin(phase)*Math.exp(-s*11)*.47+noise()*Math.exp(-s*180)*.022;});
  if(!sparse){
    const root=chords[Math.floor(b/8)%4][0]-24,f=hz(root);
    add(time+.025,beat*.86,s=>{const env=Math.min(1,s/.012)*Math.exp(-s*4)*Math.min(1,(beat*.86-s)/.08);return (Math.sin(TAU*f*s)+.22*Math.sin(TAU*2*f*s)+.08*Math.sin(TAU*3*f*s))*env*.17;},0);
    if(b%4===1||b%4===3)add(time,.21,s=>{const env=Math.exp(-s*28)+.36*Math.exp(-(((s-.018)/.012)**2))+.25*Math.exp(-(((s-.035)/.014)**2));return(noise()*.07+Math.sin(TAU*175*s)*.027)*env;},.1);
    for(let sub=0;sub<2;sub++)add(time+sub*beat/2,.07,s=>noise()*Math.exp(-s*74)*.026,sub?.42:-.42);
    add(time+beat/2,.14,s=>{const n=noise();return n*Math.exp(-s*35)*.014;},-.35);
  }
}
// Transitions are synchronized to the visual wipes.
for(const at of sceneTimes){
  add(at-.43,.63,s=>{
    const p=s/.63,env=Math.sin(Math.PI*Math.min(1,p))**2;
    return (noise()*.036+Math.sin(TAU*(600*s+1800*s*s))*.007)*env;
  },0);
  add(at,1,s=>Math.sin(TAU*(62*s+50*.025*(1-Math.exp(-s/.025))))*Math.exp(-s*7)*.15,0);
}
// Resolve the outro with a small branded chord rather than an abrupt stop.
[65,68,72,79].forEach((m,k)=>add(31.8+k*.045,2.3,s=>Math.sin(TAU*hz(m)*s)*Math.exp(-s*2.2)*Math.min(1,s/.005)*.035,(k-1.5)*.3));
const out=Buffer.alloc(44+N*4);out.write('RIFF',0);out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(SR,24);out.writeUInt32LE(SR*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){
  const time=i/SR,fade=Math.min(1,time/.04)*Math.min(1,(duration-time)/1.1);
  const a=Math.tanh(left[i]*1.5)*fade,b=Math.tanh(right[i]*1.5)*fade;
  out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,a))*32766),44+i*4);out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,b))*32766),46+i*4);
}
const output=fileURLToPath(new URL('./assets/original-score.wav',import.meta.url));await writeFile(output,out);console.log('Original 112.5 BPM stereo score:',output);
