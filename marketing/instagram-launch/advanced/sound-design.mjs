// Original stereo score + separate cinematic/UI effects. No external samples.
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=join(dirname(fileURLToPath(import.meta.url)),'assets');await mkdir(dir,{recursive:true});
const SR=48000,D=104/3,N=Math.ceil(SR*D),TAU=2*Math.PI,beat=.5;
const music=[new Float32Array(N),new Float32Array(N)],fx=[new Float32Array(N),new Float32Array(N)];
let seed=92717;function noise(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2147483648-1;}
const hz=m=>440*2**((m-69)/12);
function add(stem,start,length,fn,pan=0,level=1){const a=Math.round(start*SR),count=Math.min(Math.ceil(length*SR),N-a),l=Math.sqrt((1-pan)/2)*level,r=Math.sqrt((1+pan)/2)*level;for(let i=Math.max(0,-a);i<count;i++){const v=fn(i/SR,i);stem[0][a+i]+=v*l;stem[1][a+i]+=v*r;}}
// Fmaj9 / Dm9 / Bbmaj7 / Cadd9. Warm pads with a lightly ducked, breathing envelope.
const chords=[[53,57,60,64,67],[50,53,57,60,64],[46,53,57,62,65],[48,55,58,62,67]];
for(let bar=0;bar<18;bar++){
  const start=bar*2,ch=chords[Math.floor(bar/2)%4];
  ch.forEach((m,k)=>add(music,start,2.7,s=>{const env=Math.min(1,s/.22)*Math.min(1,(2.7-s)/.65)*Math.exp(-s*.16),f=hz(m),pump=1-.27*Math.exp(-(s%beat)*22);return(Math.sin(TAU*f*s)+.3*Math.sin(TAU*f*1.003*s)+.12*Math.sin(TAU*f*2*s))*.034*env*pump;},(k-2)*.29));
}
// Airy glass plucks, a recurring melody and stereo eighth-note echoes.
const pattern=[0,2,4,2,1,3,4,2];
for(let step=0;step<139;step++){
  const at=step*.25,ch=chords[Math.floor(at/4)%4],m=ch[pattern[step%8]]+12;
  const energy=at<3.2?.33:at<6.4?.7:at>29.33?.65:1;
  const fn=s=>{const f=hz(m),env=Math.min(1,s/.003)*Math.exp(-s*9);return(Math.sin(TAU*f*s+.8*Math.sin(TAU*f*2*s)*Math.exp(-s*14))+.2*Math.sin(TAU*f*3*s))*env*.075*energy;};
  add(music,at,.85,fn,step%2?.48:-.48);add(music,at+.375,.85,fn,step%2?-.65:.65,.23);
}
for(let b=0;b<70;b++){
  const at=b*beat,full=at>=6.4&&at<29.33;
  if(full||b%2===0)add(music,at,.5,s=>Math.sin(TAU*(47*s+76*.024*(1-Math.exp(-s/.024))))*Math.exp(-s*10)*.39+noise()*Math.exp(-s*190)*.017);
  const f=hz(chords[Math.floor(at/4)%4][0]-12);
  if(at>=3.2)add(music,at+.035,.43,s=>{const env=Math.min(1,s/.012)*Math.exp(-s*4.5)*Math.min(1,(.43-s)/.08);return(Math.sin(TAU*f*s)+.18*Math.sin(TAU*f*2*s))*.15*env;});
  if(full){
    if(b%4===1||b%4===3)add(music,at,.24,s=>(noise()*.06+Math.sin(TAU*180*s)*.02)*(Math.exp(-s*25)+.33*Math.exp(-(((s-.026)/.012)**2))),.13);
    for(let sub=0;sub<2;sub++)add(music,at+sub*.25,.09,s=>noise()*Math.exp(-s*66)*.024,sub?.45:-.45);
    if(b%4===3)for(let sub=0;sub<3;sub++)add(music,at+.125*sub,.05,s=>noise()*Math.exp(-s*110)*.012,sub%2?.6:-.6);
  }
}
// An open, richer chord on the brand payoff, then a resolved logo signature.
[53,57,60,64,67,72].forEach((m,k)=>add(music,27.2+k*.026,3.1,s=>Math.sin(TAU*hz(m)*s)*Math.exp(-s*1.35)*Math.min(1,s/.007)*.025,(k-2.5)*.22));
[65,69,72,79].forEach((m,k)=>add(music,33.1+k*.045,1.56,s=>Math.sin(TAU*hz(m)*s)*Math.exp(-s*2.1)*Math.min(1,s/.004)*.045,(k-1.5)*.3));

function whoosh(at,length=.5,pan=0){add(fx,at-length*.68,length,s=>{const p=s/length,env=Math.sin(Math.PI*p)**2;return(noise()*.10+Math.sin(TAU*(350*s+2200*s*s))*.012)*env;},pan);}
function impact(at){add(fx,at,.72,s=>Math.sin(TAU*(50*s+62*.024*(1-Math.exp(-s/.024))))*Math.exp(-s*8)*.24);}
for(const[at,i]of[3.2,6.4,11.2,16,64/3,27.2,88/3].map((v,i)=>[v,i])){whoosh(at,.46,i%2?.25:-.25);impact(at);}
// Small details line up with card entrances, typing, selections, and the cost reveal.
for(const[at,pan]of[[.62,-.4],[.77,.4],[.91,-.2],[1.05,.2]])whoosh(at,.14,pan);
for(let i=0;i<6;i++)add(fx,7.55+i*.105,.04,s=>(noise()*.065+Math.sin(TAU*1450*s)*.025)*Math.exp(-s*135),(i-2.5)*.12);
function click(at,pan=0){add(fx,at,.13,s=>(Math.sin(TAU*760*s)+.5*Math.sin(TAU*1180*s))*Math.exp(-s*44)*.08,pan);}
click(8.5,.3);click(9.95,.15);
for(const at of[12.85,13.27,13.69,17.45,18.35,19.25])click(at,at%1-.5);
whoosh(22.5,.7,-.2);
[72,76,79].forEach((m,i)=>add(fx,24.26+i*.065,.95,s=>Math.sin(TAU*hz(m)*s)*Math.exp(-s*5)*Math.min(1,s/.004)*.075,(i-1)*.3));
whoosh(30.3,.65,.35);click(31.1,.2);

async function wav(stem,name){const out=Buffer.alloc(44+N*4);out.write('RIFF',0);out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(SR,24);out.writeUInt32LE(SR*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);for(let i=0;i<N;i++){const t=i/SR,fade=Math.min(1,t/.015)*Math.min(1,(D-t)/.8);for(let k=0;k<2;k++)out.writeInt16LE(Math.round(Math.tanh(stem[k][i]*1.3)*fade*32766),44+i*4+k*2);}await writeFile(join(dir,name),out);}
await wav(music,'studio-score.wav');await wav(fx,'studio-effects.wav');console.log('Original studio score and cinematic/UI effects generated.');
