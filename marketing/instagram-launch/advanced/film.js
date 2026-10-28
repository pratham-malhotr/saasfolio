/* Deterministic 60 fps edit, optical transitions, and word-synced captions. */
(() => {
  const S=window.Studio,{canvas,c,L,W,INK,ease,clamp,rr,txt,background,footer,scenes}=S;
  const fps=60,duration=104/3,stages=[0,3.2,6.4,11.2,16,64/3,27.2,88/3,duration];
  const words=[];
  for(let i=0;i<(window.NARRATION_WORDS||[]).length;i++){
    const a=window.NARRATION_WORDS[i],b=window.NARRATION_WORDS[i+1];
    if(/^SaaS$/i.test(a.word)&&b&&/^Folio[.!?,]?$/i.test(b.word)){
      const d=window.NARRATION_WORDS[i+2],e=window.NARRATION_WORDS[i+3];
      if(d?.word==='dot'&&e&&/^tech[.!?,]?$/i.test(e.word)){words.push({word:'saasfolio.tech.',start:a.start,end:e.end});i+=3;}
      else{words.push({word:'SaaSFolio'+(/[.!?,]$/.test(b.word)?b.word.slice(-1):''),start:a.start,end:b.end});i++;}
    }else words.push(a);
  }
  const groups=[];
  for(const word of words){let last=groups[groups.length-1];if(!last||last.words.length>=4||last.text.length+word.word.length>31||word.start-last.end>.32||/[.!?]$/.test(last.words[last.words.length-1]?.word||'')){last={words:[],text:'',start:word.start,end:word.end};groups.push(last);}last.words.push(word);last.text=last.words.map(w=>w.word).join(' ');last.end=word.end;}
  function captions(time){
    const group=groups.find(g=>time>=g.start-.06&&time<=g.end+.11);if(!group)return;
    c.save();const fade=Math.min(clamp((time-group.start+.06)/.08),clamp((group.end+.14-time)/.1));c.globalAlpha=fade;
    const size=35;c.font=`600 ${size}px Display`;c.letterSpacing='-.35px';const space=c.measureText(' ').width;
    const widths=group.words.map(w=>c.measureText(w.word).width),total=widths.reduce((a,b)=>a+b,0)+(widths.length-1)*space;
    const left=540-total/2;rr(left-25,1490,total+50,72,18,'#070B09F2','#66795577');
    let x=left;group.words.forEach((w,i)=>{const active=time>=w.start-.02&&(time<w.end+.025||i===group.words.length-1);if(active)rr(x-7,1503,widths[i]+14,45,9,L);txt(w.word,x,1537,size,active?INK:W,600,'Display','left',-.35);x+=widths[i]+space;});c.restore();
  }
  const previous=document.createElement('canvas');previous.width=1080;previous.height=1920;const pc=previous.getContext('2d');let previousIndex=-1;
  function paint(i,u,t){background(t,i,i===6);scenes[i](Math.max(0,u),t);footer(i,u,stages,i===6);}
  function draw(time){
    time=Math.max(0,Math.min(duration-.00001,time));let i=stages.findIndex((s,j)=>j<8&&time>=s&&time<stages[j+1]);if(i<0)i=7;const u=time-stages[i];
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.filter='none';
    const transition=.29;
    if(i>0&&u<transition&&previousIndex!==i){paint(i-1,stages[i]-stages[i-1]-.001,stages[i]-.001);pc.drawImage(canvas,0,0);previousIndex=i;}
    paint(i,u,time);
    if(i>0&&u<transition){
      const p=ease(u/transition);c.save();c.globalAlpha=(1-p)**1.5;
      if(i%3===0){c.translate(-1080*p,0);c.drawImage(previous,0,0);}
      else{c.translate(540,950);c.scale(1+p*.5,1+p*.5);c.rotate((i%2?1:-1)*p*.025);c.filter=`blur(${p*9}px)`;c.drawImage(previous,-540,-950);}
      c.restore();c.save();c.globalAlpha=Math.sin(u/transition*Math.PI)*.055;c.fillStyle=L;c.fillRect(0,0,1080,1920);c.restore();
    }
    captions(time);
  }
  function cover(){
    background(5.2,1);S.brand();S.label('DISCOVER SOFTWARE. SPEND SMARTER.',3);
    S.fit('YOUR NEXT',80,475,866,129,W);S.fit('SOFTWARE',80,608,866,129,W);S.fit('ADVANTAGE.',80,746,866,129,L);
    S.torus(542,1047,276,49,.85,-.2,.3,.98,true);S.logo3d(540,1048,267,.1,-.18,4.5);
    rr(80,1370,865,99,23,L);txt('Meet SaaSFolio',112,1435,44,INK,600,'Display','left',-1.3);S.arrow(888,1420,34,INK,-Math.PI/4);S.mono('saasfolio.tech',80,1578,23,L);
  }
  window.film={draw,cover,duration,fps,stages,snapshots:[1.6,4.85,9.5,14.5,19.1,25.5,28.6,32.35]};
  window.ready=Promise.all([document.fonts.load('700 120px Display'),document.fonts.load('500 30px Body'),document.fonts.load('500 18px Mono')]).then(()=>{draw(1.6);return true;});
  if(!location.search.includes('render')){
    const audio=new Audio('assets/studio-mix.wav');audio.preload='auto';let started=0,playing=false;
    const start=()=>{if(playing)return;playing=true;started=performance.now();audio.currentTime=0;audio.play().catch(()=>{});requestAnimationFrame(tick);};
    function tick(now){if(!playing)return;const time=(now-started)/1000;if(time>=duration){playing=false;audio.pause();draw(0);return;}draw(time);requestAnimationFrame(tick);}
    canvas.title='Click to play the studio reel with narration';canvas.style.cursor='pointer';canvas.addEventListener('click',()=>{if(playing){playing=false;audio.pause();}else start();});
  }
})();
