/* SaaSFolio launch film. Deterministic, editable Canvas 2D motion design. */
(() => {
  const W = 1080, H = 1920, FPS = 30, DURATION = 1024 / FPS;
  const LIME = '#C6FF3D', INK = '#080A08', WHITE = '#F5F6F1', GRAY = '#939B92';
  const canvas = document.querySelector('canvas');
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d', { alpha: false });
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => 1 - Math.pow(1 - clamp(x), 4);
  const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
  const mix = (a, b, x) => a + (b-a)*x;
  const stages = [0, 3.2, 6.4, 12.8, 18.133333, 23.466667, 28.8, DURATION];
  let t = 0;
  const noise = document.createElement('canvas');
  noise.width = noise.height = 180;
  const nc = noise.getContext('2d'), nd = nc.createImageData(180,180);
  let seed = 4728;
  const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0)/4294967296; };
  for (let i=0;i<nd.data.length;i+=4) { const v = random()*255; nd.data[i]=nd.data[i+1]=nd.data[i+2]=v; nd.data[i+3]=15; }
  nc.putImageData(nd,0,0);

  function rr(x,y,w,h,r=22,fill,stroke) {
    c.beginPath(); c.roundRect(x,y,w,h,r);
    if(fill) { c.fillStyle=fill; c.fill(); }
    if(stroke) { c.strokeStyle=stroke; c.lineWidth=1.5; c.stroke(); }
  }
  function line(x1,y1,x2,y2,color,width=2) {
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.strokeStyle=color; c.lineWidth=width; c.stroke();
  }
  function circle(x,y,r,fill,stroke) {
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2);
    if(fill) { c.fillStyle=fill;c.fill(); }
    if(stroke) { c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke(); }
  }
  function text(str,x,y,size=40,color=WHITE,weight=500,font='Display',align='left',spacing=-1) {
    c.font=`${weight} ${size}px "${font}"`; c.fillStyle=color; c.textAlign=align;
    c.textBaseline='alphabetic'; c.letterSpacing=`${spacing}px`; c.fillText(str,x,y); c.letterSpacing='0px';
  }
  function fit(str,x,y,max,size=100,color=WHITE,weight=700,align='left') {
    c.font=`${weight} ${size}px "Display"`; c.letterSpacing='-3px';
    while(c.measureText(str).width > max && size > 12) { size--; c.font=`${weight} ${size}px "Display"`; }
    text(str,x,y,size,color,weight,'Display',align,-3);
  }
  function mono(str,x,y,size=20,color=GRAY,align='left') { text(str,x,y,size,color,500,'Mono',align,1.8); }
  function appear(local,delay,fn,duration=.55) {
    const p=ease((local-delay)/duration); if(!p)return;
    c.save(); c.globalAlpha*=p; c.translate(0,(1-p)*54); fn(p); c.restore();
  }
  function reveal(str,x,y,size,color,local,delay=0,max=880) {
    c.save(); c.beginPath(); c.rect(x-5,y-size-12,max+12,size+27); c.clip();
    const p=ease((local-delay)/.7); c.translate(0,(1-p)*(size+28));
    fit(str,x,y,max,size,color); c.restore();
  }
  function arrow(x,y,size=28,color=LIME,angle=0) {
    c.save(); c.translate(x,y); c.rotate(angle); c.lineCap='round'; c.lineJoin='round';
    line(-size*.6,0,size*.55,0,color,3.5); line(size*.55,0,size*.05,-size*.48,color,3.5); line(size*.55,0,size*.05,size*.48,color,3.5); c.restore();
  }
  function check(x,y,color=LIME,s=1) {
    c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';c.lineJoin='round';
    c.beginPath();c.moveTo(-8,0);c.lineTo(-2,6);c.lineTo(10,-7);c.strokeStyle=color;c.lineWidth=3;c.stroke();c.restore();
  }
  function search(x,y,color=LIME) { circle(x,y,12,null,color); line(x+9,y+9,x+20,y+20,color,2.5); }
  function mark(x,y,s=64,dark=false) {
    c.save(); c.translate(x,y); c.scale(s/64,s/64);
    rr(0,0,64,64,15,dark?INK:LIME);
    const p=new Path2D('M48 17H26C20 17 16 21 16 27S20 37 26 37H38C42 37 46 40 46 44S42 49 38 49H16');
    c.strokeStyle=dark?LIME:'#10120B';c.lineWidth=10;c.lineJoin='round';c.stroke(p);
    c.beginPath();c.moveTo(40,12);c.lineTo(48,12);c.lineTo(48,20);c.fillStyle=dark?WHITE:WHITE;c.fill();c.restore();
  }
  function wordmark(x,y,size=39,dark=false) {
    const first='SaaS'; c.font=`700 ${size}px "Display"`;c.letterSpacing='-1.5px';const w=c.measureText(first).width;
    text(first,x,y,size,dark?INK:WHITE,700,'Display','left',-1.5);
    text('Folio',x+w,y,size,dark?INK:LIME,700,'Display','left',-1.5);
  }
  function brandTop(dark=false) { mark(78,152,44,dark);wordmark(136,186,34,dark); }
  function background(time,light=false) {
    c.fillStyle=light?LIME:INK;c.fillRect(0,0,W,H);
    if(!light) {
      const g=c.createRadialGradient(850+100*Math.sin(time*.15),900,20,600,900,1000);
      g.addColorStop(0,'#1B2511');g.addColorStop(.45,'#0D130B');g.addColorStop(1,INK);
      c.fillStyle=g;c.fillRect(0,0,W,H);
    }
    c.save();c.globalAlpha=light?.08:.11;
    const col=light?'#263713':'#93A474';
    for(let x=0;x<W;x+=72)line(x,0,x,H,col,.7);
    for(let y=-72;y<H;y+=72) {const yy=y+(time*8)%72;line(0,yy,W,yy,col,.7);}
    c.restore();
    c.save(); c.globalAlpha=light?.28:.4;
    for(let i=0;i<22;i++) {
      const x=(i*197+97)%1080,y=(i*313+time*(6+i%4))%1920;
      circle(x,y,i%5===0?2:1,light?INK:LIME);
    }
    c.restore();
    c.save();c.globalAlpha=.25;c.fillStyle=c.createPattern(noise,'repeat');c.fillRect(0,0,W,H);c.restore();
  }
  function footer(index,local,light=false) {
    const col=light?'#364519':GRAY;
    mono('saasfolio.tech',80,1626,20,col);
    mono(String(index+1).padStart(2,'0')+' / 07',922,1626,18,col,'right');
    for(let i=0;i<7;i++) {
      rr(80+i*121,1660,106,3,1,light?'#9BC630':'#2E3628');
      if(i<index) rr(80+i*121,1660,106,3,1,light?INK:LIME);
      if(i===index)rr(80+i*121,1660,106*clamp(local/(stages[i+1]-stages[i])),3,1,light?INK:LIME);
    }
  }
  function eyebrow(label,x=80,y=294,color=LIME) { circle(x+4,y-7,4,color);mono(label,x+22,y,19,color); }
  function shadow(fn,color='#00000070',blur=60) { c.save();c.shadowColor=color;c.shadowBlur=blur;c.shadowOffsetY=25;fn();c.restore(); }
  function cursor(x,y,local,clickAt=99) {
    const p=clamp(1-Math.abs(local-clickAt)/.28);
    if(p) {circle(x,y,18+42*p,null,`rgba(198,255,61,${1-p})`);}
    c.save();c.translate(x,y);c.rotate(-.22);c.beginPath();c.moveTo(0,0);c.lineTo(0,33);c.lineTo(9,24);c.lineTo(16,40);c.lineTo(23,36);c.lineTo(15,21);c.lineTo(29,20);c.closePath();c.fillStyle=WHITE;c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();c.restore();
  }
  function pill(str,x,y,w,active=false) { rr(x,y,w,45,22,active?LIME:'#141A12',active?LIME:'#33402B');text(str,x+w/2,y+29,21,active?INK:'#BDC5B5',500,'Body','center',0); }
  function browser(x,y,w,h,path,fn) {
    shadow(()=>rr(x,y,w,h,30,'#0D120D','#39462D'));
    c.save();c.beginPath();c.roundRect(x,y,w,h,30);c.clip();
    c.fillStyle='#121910';c.fillRect(x,y,w,62);
    circle(x+26,y+30,5,'#64705B');circle(x+44,y+30,5,'#49523F');circle(x+62,y+30,5,'#343F2B');
    rr(x+142,y+15,w-280,30,7,'#0A0F09');text('saasfolio.tech'+path,x+w/2,y+36,16,'#AAB6A0',400,'Mono','center',0);
    fn();c.restore();
  }

  function hook(u) {
    brandTop();eyebrow('GOOD SOFTWARE. BETTER PRICES.');
    reveal('YOUR NEXT',80,532,120,WHITE,u,.03);
    reveal('TOOL SHOULD',80,657,120,WHITE,u,.16);
    reveal('COST LESS.',80,796,134,LIME,u,.32);
    appear(u,.7,()=>text('Make a smarter software decision.',83,878,31,'#B7BFB1',400,'Body','left',-.6));
    const cards=[['AI TOOLS',0,148],['DESIGN',1,191],['PRODUCTIVITY',2,232]];
    cards.forEach(([label,i,offset])=>appear(u,.65+i*.13,p=>{
      const y=1000+i*106;const drift=Math.sin(t*1.2+i)*4;
      c.save();c.translate(0,drift);rr(80,y,842,86,18,'#10170E','#33402A');
      mono(label,108,y+51,21,'#C3CCBA');
      const start=630+i*30,end=410-i*48;const q=ease((u-1.1-i*.13)/1.1);
      rr(430,y+34,mix(start-430,end-250,q),17,8,'#7A865E');
      rr(430,y+34,Math.max(40,mix(240,130-i*25,q)),17,8,LIME);
      arrow(875,y+43,24,LIME,Math.PI*.5);c.restore();
    }));
    appear(u,1.45,()=>mono('FIND THE RIGHT TOOL. CHECK THE FULL COST.',80,1421,18,GRAY));
  }
  function intro(u) {
    const centerX=524,centerY=777;
    c.save();c.translate(centerX,centerY);c.rotate(-.15+u*.04);
    for(let i=0;i<4;i++) {c.beginPath();c.ellipse(0,0,230+i*67,230+i*67,.2,0,Math.PI*2);c.strokeStyle=i===0?'#6B8C32':'#28391B';c.lineWidth=i===0?2:1;c.stroke();}
    for(let i=0;i<4;i++){const a=u*.3+i*Math.PI/2;circle(Math.cos(a)*364,Math.sin(a)*364,5,LIME);} c.restore();
    const p=ease(u/.8);c.save();c.translate(centerX,centerY);c.rotate((1-p)*-.5);c.scale(.65+.35*p,.65+.35*p);
    shadow(()=>mark(-132,-132,264), '#C6FF3D25', 100);c.restore();
    appear(u,.15,()=>mono('INTRODUCING',524,366,22,'#B7C49E','center'));
    appear(u,.45,()=>{c.font='700 105px Display';c.letterSpacing='-4px';const w=c.measureText('SaaSFolio').width;wordmark(524-w/2,1145,105);});
    appear(u,.65,()=>text('Software savings. Clear terms.',524,1225,34,'#BFC9B5',400,'Body','center',-.6));
    appear(u,.85,()=>{rr(266,1322,516,76,38,'#1C2812','#576B34');text('Discover. Compare. Save.',524,1371,29,LIME,500,'Display','center',-.3);});
  }
  function discover(u) {
    brandTop();eyebrow('01 / DISCOVER');
    reveal('YOUR STACK.',80,463,113,WHITE,u,.03);
    reveal('YOUR CHOICE.',80,585,113,LIME,u,.13);
    appear(u,.35,()=>text('Search software by brand or category.',80,659,30,'#B7BFB1',400,'Body','left',-.5));
    appear(u,.4,()=>{
      const y=744;
      browser(80,y,842,690,'/brands',()=>{
        mark(110,y+85,34);wordmark(155,y+110,28);
        mono('SOFTWARE BRANDS',891,y+109,13,GRAY,'right');
        const p=ease((u-.9)/.45);rr(110,y+151,782,83,16,'#090E09',p>.5?'#8AAF4A':'#405431');search(143,y+187);
        const query=u<2.5?'Search your next tool…':'Notion';
        let typed=u<2.5?query:query.slice(0,Math.floor((u-2.5)*9));
        text(typed,176,y+203,29,u<2.5?'#B1BBA8':WHITE,400,'Body','left',-.2);
        if(u>2.5&&u<3.5&&Math.sin(u*13)>0)line(178+c.measureText(typed).width,y+177,178+c.measureText(typed).width,y+211,LIME,2);
        rr(806,y+166,69,53,10,LIME);arrow(841,y+193,22,INK);
        pill('All brands',110,y+259,160,true);pill('AI tools',283,y+259,139);pill('Design',435,y+259,127);pill('Marketing',575,y+259,163);
        const brands=u<3?[
          ['N','Notion','Productivity','#F0EEE5'],['F','Figma','Design','#C6A6FF'],['C','ClickUp','Project management','#A7DBFF']
        ]:[['N','Notion','Productivity','#F0EEE5'],['↗','Explore savings guide','Offers, eligibility & sources',LIME]];
        brands.forEach((b,i)=>{
          const by=y+331+i*107;
          rr(110,by,782,91,15,i===0&&u>3?'#1C2A13':'#121B10',i===0&&u>3?'#769F3C':'#2A3922');
          rr(127,by+15,60,60,13,b[3]);text(b[0],157,by+57,35,INK,700,'Display','center',-1);
          text(b[1],207,by+36,28,WHITE,600,'Display','left',-.7);
          text(b[2],207,by+65,19,'#9FAC95',400,'Body','left',0);arrow(856,by+46,21,LIME);
        });
      });
      if(u>2) { const p=ease((u-2)/.8); cursor(mix(960,844,p),mix(1470,y+193,p),u,2.9); }
    });
    appear(u,1,()=>text('AI  /  Design  /  Marketing  /  Productivity',80,1510,25,'#AEBBA0',400,'Body','left',-.5));
  }
  function offers(u) {
    brandTop();eyebrow('02 / FIND YOUR WAY TO SAVE');
    reveal('MORE WAYS',80,453,113,WHITE,u,.03);
    reveal('TO SAVE.',80,574,128,LIME,u,.16);
    appear(u,.4,()=>text('Coupons. Trials. Annual savings.',80,650,32,'#BEC8B3',400,'Body','left',-.5));
    const opts=[['01','Coupon codes','See recorded code availability.'],['02','Free plans & trials','Explore before you commit.'],['03','Annual savings','Compare the full commitment.']];
    opts.forEach(([n,title,sub],i)=>appear(u,.35+i*.17,()=>{
      const y=755+i*150; rr(80,y,842,126,20,'#11190E','#3A4B2C');
      mono(n,110,y+47,19,LIME);text(title,169,y+49,35,WHITE,600,'Display','left',-.7);
      text(sub,169,y+88,24,'#A8B69B',400,'Body','left',-.2);arrow(875,y+64,23,LIME);
      const q=ease((u-1.2-i*.35)/.55);if(q){c.save();c.globalAlpha=q;line(169,y+110,169+672*q,y+110,'#6B8D38',2);c.restore();}
    }));
    appear(u,1.5,()=>{
      rr(80,1261,842,171,22,'#1C2A12','#749B3C');
      text('CLEAR TERMS BEFORE YOU CLICK.',110,1305,25,LIME,600,'Display','left',-.3);
      [['Source links',110],['Eligibility',381],['Check dates',638]].forEach(([s,x],i)=>{check(x+10,1360);text(s,x+32,1368,23,'#D7E4C9',400,'Body','left',-.2);});
    });
    appear(u,2,()=>text('Confirm eligibility and the provider’s checkout total.',80,1510,23,GRAY,400,'Body','left',-.4));
  }
  function compare(u) {
    brandTop();eyebrow('03 / COMPARE');
    reveal('COMPARE BEFORE',80,451,104,WHITE,u,.02);
    reveal('YOU COMMIT.',80,571,117,LIME,u,.17);
    appear(u,.4,()=>text('Find the software that fits your workflow.',80,650,29,'#B9C3AF',400,'Body','left',-.5));
    appear(u,.5,()=>{
      browser(80,747,842,674,'/compare',()=>{
        mono('HEAD-TO-HEAD',114,859,18,LIME);
        const p=ease((u-.75)/.65);const xoff=(1-p)*160;
        c.save();c.translate(-xoff,0);rr(111,897,339,144,18,'#151E11','#435832');rr(134,920,50,50,11,'#F2EFE6');text('N',159,956,32,INK,700,'Display','center',-1);text('Notion',134,1013,35,WHITE,600);c.restore();
        c.save();c.translate(xoff,0);rr(552,897,339,144,18,'#151E11','#435832');rr(575,920,50,50,11,'#B2D8FF');text('C',600,956,32,INK,700,'Display','center',-1);text('ClickUp',575,1013,35,WHITE,600);c.restore();
        circle(501,970,38,LIME);text('vs',501,980,29,INK,700,'Display','center',-1);
        [['Features','What do you need?'],['Pricing','What will you pay?'],['Alternatives','What else fits?']].forEach(([a,b],i)=>{
          const y=1095+i*93;const p=ease((u-1.2-i*.3)/.55);c.save();c.globalAlpha=p;
          text(a,115,y,29,WHITE,600);text(b,805,y,22,'#A5B398',400,'Body','right',-.4);check(862,y-10,LIME,.8);
          line(114,y+24,886,y+24,'#2E3E23',1);c.restore();
        });
      });
    });
    appear(u,1.7,()=>text('Choose with clarity.',80,1510,30,'#C1CCB5',500,'Display','left',-.5));
  }
  function savings(u) {
    brandTop();eyebrow('04 / CALCULATE');
    reveal('SEE THE',80,451,119,WHITE,u,.02);
    reveal('FULL COST.',80,574,126,LIME,u,.17);
    appear(u,.35,()=>text('Monthly vs annual. Access fees included.',80,650,30,'#BEC8B3',400,'Body','left',-.5));
    appear(u,.45,()=>{
      browser(80,743,842,719,'/savings-calculator',()=>{
        mono('YOUR 12-MONTH COMPARISON',113,853,18,LIME);
        [['Monthly quote','$30 / month',112],['Annual quote','$300 / year',513]].forEach(([a,b,x])=>{
          text(a,x,911,22,'#9DAE90',400,'Body','left',-.3);rr(x,933,375,83,13,'#111A0E','#435831');text(b,x+20,986,33,WHITE,500,'Display','left',-.8);
        });
        text('Access fee: $0',114,1062,24,'#ADBBA0',400,'Body','left',-.4);
        const p=ease((u-1.15)/.9);
        text('12 monthly payments',114,1120,22,'#C0CDB4',400,'Body','left',-.4);text('$360',884,1120,27,WHITE,600,'Display','right');
        rr(114,1144,770*p,29,7,'#708357');
        text('Annual payment + fee',114,1221,22,'#C0CDB4',400,'Body','left',-.4);text('$300',884,1221,27,LIME,600,'Display','right');
        rr(114,1245,642*p,29,7,LIME);
        const n=Math.round(60*ease((u-2.05)/.8));
        rr(112,1312,775,112,18,LIME);
        text('YEARLY SAVINGS',138,1350,17,INK,600,'Mono','left',1);
        text('$'+n,857,1395,77,INK,700,'Display','right',-3);
        text('Based on your own quotes.',138,1390,21,'#34491C',500,'Body','left',-.3);
      });
    });
    appear(u,1.2,()=>text('Illustrative example. Check renewal prices and terms.',80,1514,23,GRAY,400,'Body','left',-.4));
  }
  function close(u) {
    brandTop(true);
    eyebrow('SOFTWARE SAVINGS. CLEAR TERMS.',80,294,INK);
    reveal('GOOD',80,569,179,INK,u,.04);
    reveal('SOFTWARE.',80,747,157,INK,u,.15);
    reveal('BETTER',80,942,179,INK,u,.28);
    reveal('PRICES.',80,1121,179,INK,u,.4);
    appear(u,.9,()=>{
      rr(80,1244,842,115,24,INK);text('saasfolio.tech',124,1317,49,LIME,600,'Display','left',-1.5);arrow(853,1303,41,LIME,-Math.PI/4);
    });
    appear(u,1.15,()=>text('Follow for smarter SaaS finds.',80,1450,34,INK,500,'Display','left',-.8));
    appear(u,1.35,()=>mono('DISCOVER  /  COMPARE  /  SAVE',80,1514,20,'#354919'));
  }
  const scenes=[hook,intro,discover,offers,compare,savings,close];
  function scene(i,u,time) { background(time,i===6);scenes[i](Math.max(0,u));footer(i,u,i===6); }
  function draw(time) {
    t=Math.max(0,Math.min(DURATION-.0001,time));
    let i=stages.findIndex((v,j)=>j<7&&t>=v&&t<stages[j+1]);if(i<0)i=6;
    const u=t-stages[i];c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;
    if(i>0&&u<.34) {
      scene(i-1,t-stages[i-1],t);
      const p=ease(u/.34);c.save();c.beginPath();c.rect(0,H*(1-p),W,H*p);c.clip();scene(i,u,t);c.restore();
      if(p<.99) {c.fillStyle=i===6?INK:LIME;c.fillRect(0,H*(1-p)-5,W,8);}
    } else scene(i,u,t);
  }
  function cover() {
    t=30.8;background(t);brandTop();eyebrow('MEET YOUR NEXT SOFTWARE ADVANTAGE');
    fit('GOOD',80,577,870,186,WHITE);fit('SOFTWARE.',80,756,870,161,WHITE);
    fit('BETTER',80,945,870,182,LIME);fit('PRICES.',80,1126,870,182,LIME);
    rr(80,1250,842,112,24,LIME);text('Discover SaaSFolio',122,1322,44,INK,600,'Display','left',-1);arrow(858,1306,38,INK,-Math.PI/4);
    text('Discover. Compare. Save.',80,1460,36,'#C4D0BA',500,'Display','left',-.6);mono('saasfolio.tech',80,1550,24,LIME);
  }
  window.film={draw,cover,duration:DURATION,fps:FPS,stages};
  window.ready=document.fonts.ready.then(()=>{draw(1.9);return true;});
  if(!location.search.includes('render')){
    const start=performance.now();function tick(now){draw(((now-start)/1000)%DURATION);requestAnimationFrame(tick);}window.ready.then(()=>requestAnimationFrame(tick));
  }
})();
