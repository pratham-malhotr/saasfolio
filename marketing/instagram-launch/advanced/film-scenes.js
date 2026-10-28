/* Eight art-directed shots. UI illustrations reflect existing SaaSFolio functions. */
(() => {
  const S=window.Studio,{c,L,W,INK,G,clamp,ease,mix,spring,rr,line,circle,txt,fit,mono,fade,headline,glow,shadow,arrow,check,search,mark,wordmark,brand,label,pill,cursor,panel,tinyBrowser,appTile,logo3d,torus,bar3d}=S;
  const scenes=[];
  scenes.push((u,t)=>{
    brand();label('GOOD SOFTWARE SHOULD MAKE SENSE.',u);
    headline([['GREAT TOOLS.',W],['SMALLER BILLS.',L]],80,446,112,u);
    fade(u,.4,()=>txt('Make every subscription count.',82,649,31,'#B8C5AD',400,'Body','left',-.5));
    const gather=ease((u-2.44)/.7),radius=310*(1-gather);
    c.save();c.globalAlpha=1-gather*.85;torus(537,1023,300,53,1.05+u*.08,.2,u*.18,.95,true);c.restore();
    const cards=[['N','Notion','#EAE8DD',-2.55,126],['F','Figma','#C7B5EF',-.75,114],['C','ClickUp','#B5DDF1',.66,108],['AI','AI tools',L,2.21,112]];
    cards.forEach(([letter,name,col,a,s],i)=>{
      const p=spring((u-.3-i*.08)/.8),angle=a+u*.06;
      appTile(537+Math.cos(angle)*radius*p,1023+Math.sin(angle)*radius*.78*p,s*(1-.7*gather),letter,gather>.5?'':name,col,Math.sin(t*.8+i)*.09,clamp(p)*(1-gather*.75));
    });
    fade(u,.55,()=>{
      panel(530,1044,500,250,{angle:-.045+Math.sin(t*.6)*.018,scale:1-gather*.42,alpha:1-gather},()=>{
        mono('YOUR SOFTWARE STACK',32,48,17,L);txt('Choose better.',32,113,48,W,600);txt('Spend smarter.',32,170,48,L,600);arrow(437,186,24,L,-Math.PI/4);
      });
    });
    if(gather>0){c.save();c.globalAlpha=gather;logo3d(537,1023,mix(100,305,gather),.14,-.14,t);c.restore();}
    fade(u,.85,()=>{line(82,1389,934,1389,'#3D5032',1);mono('DISCOVER THE RIGHT SOFTWARE FOR YOU.',82,1430,17,'#9DB18D');});
  });
  scenes.push((u,t)=>{
    brand();label('MEET YOUR SOFTWARE ADVANTAGE',u);
    fade(u,.05,()=>{txt('Meet',80,425,66,'#AEBFA0',500);wordmark(80,563,126);});
    const p=spring(u/.85);
    glow(540,1000,430,'#B7EF3D15');torus(540,985,332,52,.78+u*.08,-.23,u*.25,.95,true);
    logo3d(540,978,324*p,.16*Math.cos(t*.5),-.28+u*.09,t);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+u*.22;circle(540+Math.cos(a)*399,985+Math.sin(a)*228,4.5,L);}
    fade(u,.65,()=>{txt('Discover more.',540,1290,46,W,500,'Display','center',-1.4);txt('Spend smarter.',540,1350,46,L,600,'Display','center',-1.4);});
  });
  scenes.push((u,t)=>{
    brand();label('01 / DISCOVER YOUR NEXT TOOL',u);
    headline([['FIND YOUR',W],['NEXT ADVANTAGE.',L]],80,435,111,u);
    fade(u,.3,()=>txt('Search brands. Explore categories.',80,637,30,'#B6C4AC',400,'Body','left',-.4));
    const p=spring((u-.28)/.9),angle=mix(-.07,-.012,ease(u/2.6));
    panel(521,1028,865,672,{angle,scale:.82+.18*p,light:true},w=>{
      tinyBrowser(w,'/brands',true);mark(28,82,35,true);wordmark(74,110,28,true);mono('FIND YOUR SOFTWARE',w-29,106,12,'#748466','right');
      rr(28,143,w-56,82,15,'#FBFCF7',u>1?'#829E54':'#CCD6C0',u>1?2.3:1.5);search(58,181,'#485D34',.85);
      const query=u<1.1?'Search your next tool…':'Notion'.slice(0,Math.floor((u-1.1)*7));
      txt(query,90,195,29,u<1.1?'#8E9C81':INK,500,'Body','left',-.5);
      if(u>1.1&&u<2.1&&Math.sin(u*18)>0){c.font='500 29px Body';line(92+c.measureText(query).width,165,92+c.measureText(query).width,202,'#5E7D31',2);}
      rr(w-107,158,62,51,11,L);arrow(w-76,184,22,INK);
      pill('All brands',28,250,150,true,true);pill('AI tools',191,250,132,false,true);pill('Design',336,250,122,false,true);pill('Productivity',471,250,188,false,true);
      [['N','Notion','Docs, databases & workspaces','#E9E6DB'],['F','Figma','Collaborative design','#C9B3ED'],['C','ClickUp','Project management','#B5DDF1']].forEach(([a,b,d,col],i)=>{
        const y=317+i*104,selected=i===0&&u>2.25;
        c.save();if(i>0)c.globalAlpha=1-.57*ease((u-2.25)/.7);
        rr(28,y,w-56,90,15,selected?'#DDECBE':'#F2F5EC',selected?'#7D9E45':'#D2DBC7',selected?2:1);
        rr(43,y+15,59,59,12,col);txt(a,72,y+57,35,INK,700,'Display','center',-1);
        txt(b,122,y+35,28,INK,600);txt(d,122,y+65,20,'#6C7E5D',400,'Body','left',-.4);arrow(w-60,y+46,22,'#5B772E');c.restore();
      });
      if(u>2.7){const q=ease((u-2.7)/.55);c.save();c.globalAlpha=q;rr(246,555,w-278,76,16,INK);txt('Explore savings guide',274,602,28,L,500);arrow(w-70,592,23,L);c.restore();}
    });
    if(u>.8){const q=ease((u-.8)/.95),r=ease((u-2.9)/.6);const click=u>1.8&&u<2.13?clamp((u-1.8)/.33):u>3.55&&u<3.88?clamp((u-3.55)/.33):0;cursor(mix(mix(999,882,q),740,r),mix(mix(1380,876,q),1283,r),t,click);}
    fade(u,.85,()=>{pill('AI',80,1406,93);pill('Design',187,1406,140);pill('Marketing',341,1406,187);pill('Productivity',542,1406,223);});
  });
  scenes.push((u,t)=>{
    brand();label('02 / DISCOVER WAYS TO SAVE',u);
    headline([['THE DEAL.',W],['THE DETAILS.',L]],80,436,128,u);
    fade(u,.4,()=>txt('Clear terms before you click.',80,663,33,'#BAC7B0',400,'Body','left',-.5));
    const data=[['01','Coupons','Check code','availability.',L],['02','Trials','Try before','you commit.','#EDF1E4'],['03','Annual','Compare the','full cost.','#BDD9CD']];
    data.forEach(([n,title,a,b,col],i)=>{
      const p=spring((u-.45-i*.13)/.8),focus=Math.exp(-(((u-(1.35+i*.9))/.64)**2)),x=225+i*299;
      panel(x,956+Math.sin(t*.9+i)*14-(i===1?16:0),278,348,{angle:(i-1)*.075+Math.sin(t*.6+i)*.012,scale:(.78+.22*p)*(1+.035*focus)},()=>{
        rr(0,0,278,348,28,col);mono(n,26,47,19,INK);circle(230,38,12,null,'#596A3B');check(230,38,INK,.6);
        if(i===0){rr(28,87,65,49,8,INK);line(39,111,82,111,col,3);line(59,94,59,128,col,2);}
        if(i===1){circle(60,112,26,null,INK,3);line(60,112,60,96,INK,3);line(60,112,75,119,INK,3);}
        if(i===2){for(let j=0;j<3;j++)rr(30+j*21,132-(j+1)*16,13,(j+1)*16,3,INK);}
        txt(title,25,195,43,INK,700,'Display','left',-1.8);txt(a,26,242,24,'#425137',500,'Body','left',-.4);txt(b,26,276,24,'#425137',500,'Body','left',-.4);
        line(26,304,250,304,'#667B4F77',1);arrow(236,325,19,INK,-Math.PI/4);
      });
    });
    fade(u,1.5,()=>{
      panel(522,1305,866,198,{angle:0},()=>{
        mono('KNOW WHAT YOU ARE GETTING',28,42,17,L);
        [['Source links',29],['Eligibility',315],['Check dates',581]].forEach(([str,x],i)=>{
          const q=ease((u-1.65-i*.42)/.45);circle(x+13,90,17,'#2B3B1E');c.save();c.globalAlpha=q;check(x+13,90,L,.8);c.restore();txt(str,x,146,26,W,500,'Display','left',-.5);
        });
      });
    });
  });
  scenes.push((u,t)=>{
    brand();label('03 / COMPARE YOUR OPTIONS',u);
    headline([['BEFORE YOU',W],['SUBSCRIBE.',L]],80,434,124,u);
    fade(u,.35,()=>txt('Compare the tools. Find the fit.',80,654,32,'#B8C6AD',400,'Body','left',-.4));
    const p=spring((u-.35)/.8),apart=(1-ease((u-.7)/.75))*140;
    panel(520,1045,866,662,{angle:mix(.035,-.012,ease(u/2)),scale:.85+.15*p},w=>{
      tinyBrowser(w,'/compare');mono('SIDE BY SIDE',29,102,17,L);
      c.save();c.translate(-apart,0);rr(29,135,351,153,18,'#EBF0E0');rr(49,155,53,53,10,'#D5DCCB');txt('N',76,194,34,INK,700,'Display','center',-1);txt('Notion',49,258,39,INK,600);c.restore();
      c.save();c.translate(apart,0);rr(486,135,351,153,18,L);rr(506,155,53,53,10,'#A7D62C');txt('C',532,194,34,INK,700,'Display','center',-1);txt('ClickUp',506,258,39,INK,600);c.restore();
      circle(w/2,214,35,'#26351F','#789F42');txt('vs',w/2,225,29,L,600,'Display','center',-1);
      [['Features','Match your workflow'],['Pricing','Check the full plan'],['Alternatives','Explore other options']].forEach(([a,b],i)=>{
        const y=346+i*89,q=ease((u-.95-i*.32)/.5),focus=Math.exp(-(((u-(1.45+i*.9))/.65)**2));
        c.save();c.globalAlpha=q;rr(27,y-37,w-54,71,12,`rgba(198,255,61,${.025+.085*focus})`);txt(a,48,y+8,29,W,600);txt(b,w-72,y+8,22,'#AABD9B',400,'Body','right',-.5);check(w-46,y,L,.75);c.restore();
      });
      rr(29,595,w-58,44,12,'#2A3A1F');txt('Choose with clarity.',w/2,625,23,L,500,'Display','center',-.3);
      const scan=(u*.28)%1;const g=c.createLinearGradient(30+scan*(w-80)-140,0,30+scan*(w-80),0);g.addColorStop(0,'#C6FF3D00');g.addColorStop(1,'#C6FF3D77');c.fillStyle=g;c.fillRect(29,575,w-58,2);
    });
    fade(u,1.2,()=>mono('FEATURES   /   PRICING   /   ALTERNATIVES',80,1439,18,'#9DB08D'));
  });
  scenes.push((u,t)=>{
    brand();label('04 / CALCULATE THE FULL COMMITMENT',u);
    headline([['KNOW THE',W],['REAL COST.',L]],80,432,127,u);
    fade(u,.3,()=>txt('Monthly vs annual. Fees included.',80,653,31,'#BAC9AF',400,'Body','left',-.4));
    fade(u,.45,()=>{
      panel(522,788,867,151,{angle:-.012},()=>{
        [['Monthly quote','$30 / month',28],['Annual quote','$300 / year',350],['Access fee','$0',682]].forEach(([a,b,x])=>{mono(a.toUpperCase(),x,44,14,'#9DAF8C');txt(b,x,105,34,W,600,'Display','left',-1);});
      });
    });
    c.save();const p=ease((u-.95)/1.2),base=1272;
    glow(556,1180,440,'#A4E93B13');
    // Perspective floor grid, with real projected bar depth and moving light.
    for(let i=0;i<7;i++)line(153+i*112,1288,295+i*90,928,'#314327',1);
    for(let i=0;i<7;i++)line(142+i*15,1288-i*48,918-i*15,1288-i*48,'#314327',1);
    const h1=302*p,h2=252*p;
    bar3d(251,base,173,h1,47,'#A5B88B','#3D5430','#C1D4A3');
    bar3d(596,base,173,h2,47,L,'#5D811B','#EAFF9D');
    if(p>.1){txt('$'+Math.round(360*p),337,base-h1-42,47,W,600,'Display','center',-2);txt('$'+Math.round(300*p),684,base-h2-42,47,L,600,'Display','center',-2);}
    txt('12 monthly payments',337,1320,24,'#C0CFB3',500,'Body','center',-.6);txt('Annual + access fee',684,1320,24,'#C0CFB3',500,'Body','center',-.6);c.restore();
    fade(u,2.4,()=>{
      const n=Math.round(60*ease((u-2.4)/.6));rr(80,1366,865,82,18,L);mono('ILLUSTRATIVE YEARLY SAVING',105,1415,17,INK);txt('$'+n,919,1428,56,INK,700,'Display','right',-2);
    });
    mono('EXAMPLE QUOTES. CHECK RENEWAL PRICES & TERMS.',80,1591,15,'#91A284');
  });
  scenes.push((u,t)=>{
    brand(true);label('SOFTWARE SAVINGS. CLEAR TERMS.',u,INK);
    // Large editorial type moves as one composition for the musical payoff.
    c.save();c.globalAlpha=.1;txt('SMARTER',-46,951,245,INK,700,'Display','left',-8);txt('SOFTWARE',-46,1180,239,INK,700,'Display','left',-8);c.restore();
    headline([['GOOD',INK],['SOFTWARE.',INK],['BETTER',INK],['PRICES.',INK]],80,545,159,u,.03,1.04);
    const p=ease((u-.45)/.8);c.save();c.globalAlpha=p;torus(825,1315,117,31,.8,.5,u*.4,.88,true);logo3d(824,1311,101,.08,-.2,t);c.restore();
    fade(u,.6,()=>txt('Built for a smarter software decision.',80,1374,30,INK,500,'Display','left',-.6));
  });
  scenes.push((u,t)=>{
    brand();label('YOUR NEXT TOOL STARTS HERE',u);
    headline([['DISCOVER.',W],['COMPARE.',W],['SAVE.',L]],80,435,133,u,.02,1.01);
    const p=spring((u-.25)/.8);
    c.save();c.globalAlpha=.9;torus(754,1035,224,41,1.1,-.25,u*.17,.85,true);c.restore();
    logo3d(751,1044,182*p,.2,-.23+u*.025,t);
    fade(u,.85,()=>{
      panel(522,1300,866,119,{angle:0},()=>{
        rr(0,0,866,119,25,L);txt('saasfolio.tech',35,77,53,INK,600,'Display','left',-2);arrow(795,60,40,INK,-Math.PI/4);
        const x=(u*.28)%1*1100-200,g=c.createLinearGradient(x,0,x+220,119);g.addColorStop(0,'#FFFFFF00');g.addColorStop(.5,'#FFFFFF66');g.addColorStop(1,'#FFFFFF00');c.fillStyle=g;c.fillRect(0,0,866,119);
      });
    });
    fade(u,1.05,()=>txt('Follow for smarter SaaS finds.',80,1429,34,'#D2DEC7',500,'Display','left',-.7));
  });
  S.scenes=scenes;
})();
