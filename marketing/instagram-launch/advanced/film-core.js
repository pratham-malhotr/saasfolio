/* Original motion system: perspective geometry, shaded meshes, tactile UI. */
(() => {
  const canvas=document.querySelector('canvas');canvas.width=1080;canvas.height=1920;
  const c=canvas.getContext('2d',{alpha:false}),L='#C6FF3D',W='#F7F8EF',INK='#080B09',G='#A7B09F';
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**4;
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,p)=>a+(b-a)*p;
  const spring=x=>1-Math.exp(-8*clamp(x))*Math.cos(11*clamp(x));
  let seed=62291;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const grain=document.createElement('canvas');grain.width=grain.height=200;
  const gc=grain.getContext('2d'),im=gc.createImageData(200,200);
  for(let i=0;i<im.data.length;i+=4){const v=rand()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=16;}gc.putImageData(im,0,0);
  const starfield=Array.from({length:65},()=>({x:rand()*1080,y:rand()*1920,r:rand()*1.7+.3,s:rand()*9+2}));
  function rr(x,y,w,h,r=20,fill,stroke,width=1.5){
    c.beginPath();c.roundRect(x,y,Math.max(0,w),Math.max(0,h),r);
    if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  }
  function line(x,y,a,b,color,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  function circle(x,y,r,fill,stroke,width=1.5){c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function txt(str,x,y,size=36,color=W,weight=500,font='Display',align='left',spacing=-.8){c.font=`${weight} ${size}px "${font}"`;c.textAlign=align;c.textBaseline='alphabetic';c.letterSpacing=`${spacing}px`;c.fillStyle=color;c.fillText(str,x,y);c.letterSpacing='0px';}
  function fit(str,x,y,max,size,color=W,weight=700,align='left'){
    c.letterSpacing='-3px';c.font=`${weight} ${size}px Display`;while(c.measureText(str).width>max&&size>18){size--;c.font=`${weight} ${size}px Display`;}txt(str,x,y,size,color,weight,'Display',align,-3);
  }
  function mono(str,x,y,size=18,color=G,align='left'){txt(str,x,y,size,color,500,'Mono',align,1.3);}
  function fade(u,delay,fn,length=.6){const p=ease((u-delay)/length);if(!p)return;c.save();c.globalAlpha*=p;c.translate(0,35*(1-p));fn(p);c.restore();}
  function headline(lines,x,y,size,u,delay=.02,gap=1.01){lines.forEach((row,i)=>{
    const [str,col]=Array.isArray(row)?row:[row,W],p=ease((u-delay-i*.12)/.66),base=y+i*size*gap;
    c.save();c.beginPath();c.rect(x-6,base-size*1.12,880,size*1.35);c.clip();c.translate(0,(1-p)*(size+30));fit(str,x,base,866,size,col);c.restore();
  });}
  function glow(x,y,r,color,alpha=1){c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore();}
  function shadow(fn,blur=40,color='#00000088',dy=24){c.save();c.shadowColor=color;c.shadowBlur=blur;c.shadowOffsetY=dy;fn();c.restore();}
  function arrow(x,y,s=26,color=L,ang=0){c.save();c.translate(x,y);c.rotate(ang);c.lineCap='round';c.lineJoin='round';line(-s*.6,0,s*.55,0,color,3);line(s*.55,0,s*.05,-s*.5,color,3);line(s*.55,0,s*.05,s*.5,color,3);c.restore();}
  function check(x,y,col=L,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(-9,0);c.lineTo(-2,7);c.lineTo(11,-8);c.strokeStyle=col;c.lineWidth=3;c.stroke();c.restore();}
  function search(x,y,col=L,s=1){c.save();c.translate(x,y);c.scale(s,s);circle(0,0,12,null,col,2.5);line(9,9,21,21,col,2.5);c.restore();}
  function mark(x,y,s=64,dark=false){c.save();c.translate(x,y);c.scale(s/64,s/64);rr(0,0,64,64,15,dark?INK:L);const p=new Path2D('M48 17H26C20 17 16 21 16 27S20 37 26 37H38C42 37 46 40 46 44S42 49 38 49H16');c.strokeStyle=dark?L:'#10120B';c.lineWidth=10;c.lineJoin='round';c.stroke(p);c.beginPath();c.moveTo(40,12);c.lineTo(48,12);c.lineTo(48,20);c.fillStyle=W;c.fill();c.restore();}
  function wordmark(x,y,size=36,dark=false){c.font=`700 ${size}px Display`;c.letterSpacing='-1.3px';const w=c.measureText('SaaS').width;txt('SaaS',x,y,size,dark?INK:W,700,'Display','left',-1.3);txt('Folio',x+w,y,size,dark?INK:L,700,'Display','left',-1.3);}
  function brand(dark=false){mark(78,139,45,dark);wordmark(136,174,34,dark);}
  function label(str,u,color=L){fade(u,.06,()=>{circle(83,267,4,color);mono(str,102,274,18,color);});}
  function pill(str,x,y,w,active=false,light=false){rr(x,y,w,43,21,active?L:light?'#E2E7DA':'#172016',active?'#A1D02B':light?'#CFD7C5':'#35472D');txt(str,x+w/2,y+28,20,active||light?INK:'#C4CEBA',500,'Body','center',-.2);}
  function background(t,scene=0,light=false){
    c.fillStyle=light?L:INK;c.fillRect(0,0,1080,1920);
    if(!light){
      const g=c.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#141A16');g.addColorStop(.5,'#0B100D');g.addColorStop(1,'#040806');c.fillStyle=g;c.fillRect(0,0,1080,1920);
      glow(730+Math.sin(t*.22)*120,750+Math.cos(t*.18)*190,740,scene%2?'#405E203E':'#5E70412A');
      glow(60,1300,650,'#253C4320');
      c.save();c.globalAlpha=.16;c.strokeStyle='#8DA568';c.lineWidth=1;
      for(let i=0;i<9;i++){c.beginPath();for(let j=0;j<=32;j++){const x=j/32*1500-210,y=760+i*68+Math.sin(j*.12+t*.16+i*.12)*105+i*(x-500)*.13;j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();
      c.save();for(const s of starfield){c.globalAlpha=.12+.25*(.5+.5*Math.sin(t*.6+s.x));circle(s.x,(s.y-t*s.s+19200)%1920,s.r,'#D9ECC0');}c.restore();
      const v=c.createRadialGradient(540,880,450,540,880,1250);v.addColorStop(0,'#00000000');v.addColorStop(1,'#000000BF');c.fillStyle=v;c.fillRect(0,0,1080,1920);
    }else{
      glow(780,470,900,'#F7FF9C99');c.save();c.globalAlpha=.15;for(let i=0;i<9;i++){c.beginPath();c.arc(1220,1080,360+i*100,t*.04,t*.04+Math.PI*1.5);c.strokeStyle=INK;c.lineWidth=1;c.stroke();}c.restore();
    }
    c.save();c.globalAlpha=.3;c.fillStyle=c.createPattern(grain,'repeat');c.fillRect(0,0,1080,1920);c.restore();
  }
  function footer(index,u,stages,light=false){const col=light?'#41551B':'#7C8D74';mono('saasfolio.tech',80,1640,17,col);mono('DISCOVER / COMPARE / SAVE',944,1640,14,col,'right');for(let i=0;i<8;i++){rr(80+i*109,1670,94,3,1,light?'#94BF2D':'#293723');if(i<index)rr(80+i*109,1670,94,3,1,light?INK:L);if(i===index)rr(80+i*109,1670,94*clamp(u/(stages[i+1]-stages[i])),3,1,light?INK:L);}}
  function cursor(x,y,t,click=0){if(click>0){c.save();c.globalAlpha=(1-click)*.85;circle(x,y,18+55*click,null,L,2);circle(x,y,9+26*click,null,L,1);c.restore();}c.save();c.translate(x,y);c.rotate(-.18);c.beginPath();c.moveTo(0,0);c.lineTo(0,35);c.lineTo(9,27);c.lineTo(17,43);c.lineTo(24,39);c.lineTo(16,23);c.lineTo(31,22);c.closePath();c.fillStyle=W;c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();c.restore();}
  function panel(cx,cy,w,h,{angle=0,scale=1,skew=0,light=false,alpha=1}={},fn){
    c.save();c.translate(cx,cy);c.rotate(angle);c.transform(1,skew,0,1,0,0);c.scale(scale,scale);c.globalAlpha*=alpha;
    const x=-w/2,y=-h/2,g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,light?'#F8FAF1':'#1B251C');g.addColorStop(1,light?'#E5EBDD':'#0B120C');
    shadow(()=>rr(x,y+8,w,h,28,'#020603'),55,'#00000099',24);rr(x,y,w,h,28,g,light?'#FFFFFF':'#536449');
    c.save();c.beginPath();c.roundRect(x,y,w,h,28);c.clip();c.translate(x,y);fn?.(w,h);c.restore();
    const sheen=c.createLinearGradient(x,y,x+w,y+h);sheen.addColorStop(0,'#FFFFFF25');sheen.addColorStop(.24,'#FFFFFF00');sheen.addColorStop(1,'#FFFFFF00');rr(x,y,w,h,28,sheen);c.restore();
  }
  function tinyBrowser(w,path,light=false){const col=light?'#748566':'#8C9E7E';for(let i=0;i<3;i++)circle(22+i*17,28,4.5,col);rr(130,12,w-260,30,8,light?'#DDE5D3':'#080E08');mono('saasfolio.tech'+path,w/2,33,13,light?'#526148':'#9CAA91','center');line(0,56,w,56,light?'#CBD6BE':'#34462D',1);}
  function appTile(cx,cy,s,letter,name,col,angle=0,alpha=1){c.save();c.translate(cx,cy);c.rotate(angle);c.globalAlpha*=alpha;shadow(()=>rr(-s/2,-s/2,s,s,25,'#172018','#5D7051'),35,'#00000077',18);rr(-s/2+12,-s/2+12,s-24,s-24,20,col);txt(letter,0,s*.16,s*.51,INK,700,'Display','center',-2);if(name)txt(name,0,s/2+32,21,'#CDD6C4',500,'Body','center',-.3);c.restore();}
  function logo3d(cx,cy,s,rx,ry,time){
    c.save();c.translate(cx,cy);c.rotate(Math.sin(time*.3)*.035);c.transform(Math.cos(ry),Math.sin(ry)*.16,Math.sin(rx)*.16,Math.cos(rx),0,0);
    shadow(()=>rr(-s/2+12,-s/2+22,s,s,s*.234,'#182803'),75,'#B6FC3833',22);
    for(let i=25;i>=0;i--){const v=i/25;rr(-s/2+v*18,-s/2+v*24,s,s,s*.234,`rgb(${45+Math.round((1-v)*55)},${68+Math.round((1-v)*75)},12)`);}
    mark(-s/2,-s/2,s);c.save();c.beginPath();c.roundRect(-s/2,-s/2,s,s,s*.234);c.clip();
    const p=(time*.17)%1,gl=c.createLinearGradient(-s+s*p,-s/2,s*p,s/2);gl.addColorStop(0,'#FFFFFF00');gl.addColorStop(.45,'#FFFFFF00');gl.addColorStop(.5,'#FFFFFF55');gl.addColorStop(.56,'#FFFFFF00');gl.addColorStop(1,'#FFFFFF00');c.fillStyle=gl;c.fillRect(-s/2,-s/2,s,s);c.restore();c.restore();
  }
  function rotate(p,rx,ry,rz){let[x,y,z]=p;[y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];[x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];[x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];return[x,y,z];}
  // A true projected, depth-sorted torus mesh with diffuse and specular lighting.
  function torus(cx,cy,r,tube,rx,ry,rz,alpha=1,chrome=false){
    const points=[],normals=[],A=128,B=32,F=1500;
    for(let a=0;a<A;a++){points[a]=[];normals[a]=[];const u=a/A*Math.PI*2;for(let b=0;b<B;b++){const v=b/B*Math.PI*2;const p=rotate([(r+tube*Math.cos(v))*Math.cos(u),(r+tube*Math.cos(v))*Math.sin(u),tube*Math.sin(v)],rx,ry,rz),n=rotate([Math.cos(v)*Math.cos(u),Math.cos(v)*Math.sin(u),Math.sin(v)],rx,ry,rz),q=F/(F+p[2]);points[a][b]=[cx+p[0]*q,cy+p[1]*q,p[2]];normals[a][b]=n;}}
    const faces=[];for(let a=0;a<A;a++)for(let b=0;b<B;b++){const q=[points[a][b],points[(a+1)%A][b],points[(a+1)%A][(b+1)%B],points[a][(b+1)%B]],n=normals[a][b];faces.push({q,n,z:q.reduce((s,v)=>s+v[2],0)/4});}faces.sort((a,b)=>b.z-a.z);
    c.save();c.globalAlpha*=alpha;c.lineJoin='round';
    for(const f of faces){const n=f.n,diff=Math.max(0,-n[0]*.42-n[1]*.65-n[2]*.64),rim=(1-Math.abs(n[2]))**3,spec=Math.max(0,-n[0]*.28-n[1]*.5-n[2]*.82)**34;
      const base=chrome?[122,137,119]:[112,153,39],value=.15+.7*diff;
      const rgb=base.map((v,i)=>Math.min(255,Math.round(v*value+(chrome?140:85)*rim+(chrome?240:210)*spec+(i===1?8:0))));
      c.beginPath();f.q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=`rgb(${rgb.join(',')})`;c.fill();c.strokeStyle=c.fillStyle;c.lineWidth=.65;c.stroke();
    }c.restore();
  }
  function bar3d(x,base,w,height,depth,col,side,top){c.save();c.beginPath();c.moveTo(x+w,base);c.lineTo(x+w+depth,base-depth*.6);c.lineTo(x+w+depth,base-height-depth*.6);c.lineTo(x+w,base-height);c.closePath();c.fillStyle=side;c.fill();c.beginPath();c.moveTo(x,base-height);c.lineTo(x+depth,base-height-depth*.6);c.lineTo(x+w+depth,base-height-depth*.6);c.lineTo(x+w,base-height);c.closePath();c.fillStyle=top;c.fill();const g=c.createLinearGradient(x,base-height,x+w,base);g.addColorStop(0,col);g.addColorStop(1,side);rr(x,base-height,w,height,2,g);c.restore();}
  window.Studio={canvas,c,L,W,INK,G,clamp,ease,smooth,mix,spring,rr,line,circle,txt,fit,mono,fade,headline,glow,shadow,arrow,check,search,mark,wordmark,brand,label,pill,background,footer,cursor,panel,tinyBrowser,appTile,logo3d,torus,bar3d};
})();
