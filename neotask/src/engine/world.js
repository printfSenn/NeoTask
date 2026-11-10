import{CONFIG,U,State}from'./core.js'
import{Store,Data}from'./store.js'
export const World={
 mode:'city',buildings:[],byId:new Map(),prims:[],pos:null,cur:null,from:null,delay:null,moving:false,t0:0,
 attr:null,pid:null,tid:null,bri:null,movers:[],moverKey:'',sites:[],S:2.5/9,
 idx(id){const b=this.byId.get(id);return b?b.index:-1},
 river(x,z){return Math.abs(x*.75+z*.66-.12+Math.sin(z*2.2)*.18)<.13},
 hullW(u){return(1-Math.pow(Math.abs(u),3))*.4},
 H0(x,z){return(Math.sin(x*2.6+Math.sin(z*1.7)*1.4)*.5+.5)*.22+(Math.sin(z*4.1-x*1.3)*.5+.5)*.1+Math.max(0,.6-Math.hypot(x-.3,z+.2))*.55},
 terrain(x,z){let h=this.H0(x,z);for(const s of this.sites){const d=Math.hypot(x-s.x,z-s.z);if(d<.22){const t=d<.1?1:1-(d-.1)/.12,e=t*t*(3-2*t);h+=(s.y0-h)*e}}return h},
 nearSite(x,z,r){return this.buildings.some(b=>Math.hypot(b.cx-x,b.cz-z)<r)},
 box(a,x,z,y0,y1,w,d,pid,ti,ra){a.push({k:0,x,z,y0,y1,w,d,pid,ti,ra:ra==null?3:ra,blink:false})},
 crate(a,x,z,y0,y1,w,d,pid,ti,fa){a.push({k:0,x,z,y0,y1,w,d,pid,ti,ra:3,blink:false,rib:true,fa})},
 cyl(a,x,z,y0,y1,r,pid,ti,blink,ra){a.push({k:1,x,z,y0,y1,w:r,d:r,pid,ti,ra:ra==null?3:ra,blink:!!blink})},
 wgt(q){const h=Math.max(.001,q.y1-q.y0);return q.k?(2*Math.PI*q.w*h+Math.PI*q.w*q.w):(4*(q.w+q.d)*h+4*q.w*q.d)},
 primPt(q,rnd){
  const h=Math.max(.001,q.y1-q.y0);
  if(q.k===0){
   const sa=4*(q.w+q.d)*h,ra=4*q.w*q.d;
   if(rnd()*(sa+ra)<ra)return[q.x+(rnd()*2-1)*q.w,q.y1,q.z+(rnd()*2-1)*q.d,q.ra];
   const zf=rnd()*(q.w+q.d)<q.w,half=zf?q.w:q.d,nc=Math.max(1,Math.floor(2*half/(q.rib?.016:CONFIG.windowPitch))),u=-half+(Math.floor(rnd()*nc)+.5)*(2*half/nc);
   const nr=Math.max(1,Math.round(h/CONFIG.rowPitch)),v=q.rib?q.y0+rnd()*h:q.y0+(Math.floor(rnd()*nr)+.5)*(h/nr),at=q.rib?(rnd()<.1?3:(q.fa||1)):(rnd()<.72?2:1),sg=rnd()<.5?1:-1;
   return zf?[q.x+u,v,q.z+sg*q.d,at]:[q.x+sg*q.w,v,q.z+u,at];
  }
  const r=q.w,sa=2*Math.PI*r*h,ra=Math.PI*r*r;
  if(rnd()*(sa+ra)<ra){const a=rnd()*6.2832,rr=r*Math.sqrt(rnd());return[q.x+Math.cos(a)*rr,q.y1,q.z+Math.sin(a)*rr,q.ra]}
  const nc=Math.max(6,Math.floor(2*Math.PI*r/CONFIG.windowPitch)),a=(Math.floor(rnd()*nc)+.5)/nc*6.2832,nr=Math.max(1,Math.round(h/CONFIG.rowPitch)),v=q.y0+(Math.floor(rnd()*nr)+.5)*(h/nr);
  return[q.x+Math.cos(a)*r,v,q.z+Math.sin(a)*r,rnd()<.72?2:1];
 },
 mix(list,rnd){let t=0;const c=list.map(x=>t+=x[0]);return()=>{const r=rnd()*t;let i=0;while(i<c.length-1&&c[i]<r)i++;return list[i][1]()}},
 cumPick(items,rnd){let tot=0;const cum=items.map(q=>tot+=this.wgt(q));return()=>{const t=rnd()*tot;let lo=0,hi=cum.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<t)lo=m+1;else hi=m}return items[lo]}},

 layout(mode){
  const B=this.buildings,cfg=CONFIG.sceneCfg[mode],S=this.S,used=new Set();this.sites=[];
  B.forEach(b=>{
   const p=b.p,r=U.rand(p.seed>>>0),n=p.tasks.length;
   b.n=n;b.pid=b.index;b.h=n?U.cl(n*cfg.taskH,cfg.hMin,cfg.hMax):.12;
   b.type=cfg.types[Math.floor(r()*cfg.types.length)];
   const ratio=.78+r()*.34,s=p.slots[mode]||{x:0,y:0,g:3},g=s.g||3,fx=(s.x+.5)/g,fz=(s.y+.5)/g;
   let w=.105*ratio,d=.105*(2-ratio);
   if(mode==='city'){
    const gx=(s.x-(g-1)/2)*2.25/g,gz=(s.y-(g-1)/2)*2.25/g;
    let ix=U.cl(Math.round(gx/S),-4,4),iz=U.cl(Math.round(gz/S),-4,4);
    if(used.has(ix+'|'+iz)){let found=false;
     for(let rr=1;rr<9&&!found;rr++)for(let dx=-rr;dx<=rr&&!found;dx++)for(let dz=-rr;dz<=rr&&!found;dz++){
      if(Math.max(Math.abs(dx),Math.abs(dz))!==rr)continue;const jx=ix+dx,jz=iz+dz;
      if(Math.abs(jx)>4||Math.abs(jz)>4||used.has(jx+'|'+jz))continue;ix=jx;iz=jz;found=true}}
    used.add(ix+'|'+iz);b.ix=ix;b.iz=iz;b.cx=ix*S;b.cz=iz*S;b.y0=0;w=Math.min(w,S*.44);d=Math.min(d,S*.44);
   }else if(mode==='ship'){
    const x=-.65+fx*1.65,mz=Math.min(.24,this.hullW(x/1.25)-.07);
    b.cx=x;b.cz=(fz*2-1)*mz;b.y0=.2;w=Math.min(.12*ratio,1.65/g*.42);d=Math.max(.02,Math.min(.06*(2-ratio),2*mz/g*.42));
   }else if(mode==='satellite'){
    b.cx=(fx*2-1)*.95;b.cz=(fz*2-1)*.95;b.y0=this.H0(b.cx,b.cz);const c=1.9/g;w=Math.min(.09*ratio,c*.4);d=Math.min(.09*(2-ratio),c*.4);
   }else if(mode==='metro'){
    const style=(p.seed>>>4)%3,jx=((p.seed>>>8)%1000/999-.5)*.035,jz=((p.seed>>>19)%1000/999-.5)*.022;
    b.metroStyle=style;b.cx=(fx*2-1)*.8+jx;b.cz=(fz*2-1)*.75+jz;b.y0=0;b.h=.08+[0,.012,.022][style];w=Math.min(.26,1.6/g*.42)*(style===1?1.12:style===2?.9:1);d=.06*(style===2?1.18:1);
   }else if(mode==='airport'){
    b.cx=(fx*2-1)*.72;b.cz=.05+fz*.8;b.y0=0;b.h=.08;w=.1;d=.06;
   }else{
    b.cx=(fx*2-1)*.85;b.cz=(fz*2-1)*.75;b.y0=0;w=Math.min(w,1.7/g*.4);d=Math.min(d,1.5/g*.4);
   }
   b.w=Math.max(.03,w);b.d=Math.max(.02,d);this.sites.push({x:b.cx,z:b.cz,y0:b.y0});
  });
 },

 projectPrims(mode,b,a){
  const x=b.cx,z=b.cz,y0=b.y0,n=b.n,o=b.order,id=b.pid,W0=b.w,D0=b.d;
  b.bw=W0*1.5;b.bd=D0*1.5;
  if(!n){if(mode==='ship'){b.bw=0;b.bd=0;b.top=y0;return}this.box(a,x,z,y0,y0+.05,W0*1.2,D0*1.2,id,-1);this.cyl(a,x,z,y0+.05,y0+.18,.014,id,-2,true);b.top=y0+.18;return}
  const bh=b.h/n;let top=y0+b.h,tw=1;
  if(mode==='city'){
   const t=b.type,ar={slab:[1.12,.74],tower:[.8,.8],setback:[1,1],podium:[.8,.8],crown:[1,1],spire:[.9,.9]}[t],W=W0*ar[0],D=D0*ar[1];
   this.box(a,x,z,y0,y0+.012,W0*1.5,D0*1.5,id,-1,0);
   if(t==='podium'){this.box(a,x,z,y0,y0+.07,W0*1.35,D0*1.35,id,-1);}
   o.forEach((tk,k)=>{const f=(k+.5)/n;let s=1;
    if(t==='setback')s=f<.5?1:f<.8?.78:.56;else if(t==='spire')s=1-f*.42;else if(t==='crown')s=f>.86?.72:1;
    tw=s;this.box(a,x,z,y0+k*bh,y0+(k+1)*bh,W*s,D*s,id,tk._i)});
   if(t==='crown'){this.box(a,x,z,top,top+.05,W*tw*.62,D*tw*.62,id,-1);this.box(a,x,z,top+.05,top+.09,W*tw*.3,D*tw*.3,id,-1);top+=.09}
   else{this.box(a,x,z,top,top+.03,W*tw*.55,D*tw*.55,id,-1);top+=.03}
   if(t==='spire'||t==='tower'){this.cyl(a,x,z,top,top+.16,.011,id,-2,true);top+=.16}
   if(b.alert){this.cyl(a,x+W*tw*.3,z,top-.02,top+.14,.016,id,-3,true);top+=.14}
   b.bw=Math.max(W0*1.5,W);b.bd=Math.max(D0*1.5,D);
  }else if(mode==='ship'){
   const W=W0,D=D0;this.box(a,x,z,y0,y0+.008,W*1.25,D*1.3,id,-1,0);
   o.forEach((tk,k)=>{const ya=y0+.008+k*bh,yb=ya+bh-.007;this.crate(a,x-W*.5,z,ya,yb,W*.46,D,id,tk._i);this.crate(a,x+W*.5,z,ya,yb,W*.46,D,id,tk._i)});
   top=y0+.008+n*bh;if(b.alert){this.cyl(a,x,z,top,top+.14,.014,id,-3,true);top+=.14}
   b.bw=W*1.25;b.bd=D*1.3;
  }else if(mode==='satellite'){
   const W=W0,D=D0,t=b.type;this.cyl(a,x,z,y0,y0+.012,W*1.7,id,-1,false,0);
   o.forEach((tk,k)=>{const f=(k+.5)/n,y1=y0+(k+1)*bh;
    if(t==='dish'){this.cyl(a,x,z,y0+k*bh,y1,W*(1-f*.28),id,tk._i)}
    else if(t==='array'){this.box(a,x,z,y0+k*bh,y1,W*.6,D*.6,id,tk._i)}
    else{const s=1-f*.5;this.box(a,x,z,y0+k*bh,y1,W*s,D*s,id,tk._i)}});
   if(t==='array'){this.box(a,x,z,top-.06,top-.052,W*2.4,D*.35,id,-1);this.box(a,x,z,top-.03,top-.022,W*1.6,D*.3,id,-1)}
   if(t==='dish'){this.cyl(a,x,z,top,top+.014,W*1.35,id,-1);this.cyl(a,x,z,top+.014,top+.05,W*.3,id,-1);top+=.05}
   this.cyl(a,x,z,top,top+.12,.01,id,-2,true);top+=.12;
   if(b.alert){this.cyl(a,x+W*.3,z,top-.1,top+.06,.015,id,-3,true);top+=.06}
   b.bw=W*1.7;b.bd=W*1.7;
  }else if(mode==='metro'){
   const sl=Math.min(.08,2*W0/Math.max(1,n)),hw=W0+.02,style=(b.p.seed>>>4)%3;
   this.box(a,x,z+.026,y0,y0+.012,hw,.018,id,-1,1);b.bw=hw+.06;b.bd=.13;b.top=y0+.13;
   this.box(a,x,z+.04,y0+.05,y0+.056,hw+.01,.03,id,-1);
   [-.9,0,.9].forEach(f=>this.cyl(a,x+f*hw,z+.052,y0+.012,y0+.05,.004,id,-1));
   if(style===0){
    this.box(a,x,z+.066,y0+.125,y0+.139,hw+.045,.042,id,-1);
    [-.88,.88].forEach(f=>this.box(a,x+f*hw,z+.066,y0+.056,y0+.125,.008,.008,id,-1));
   }else if(style===1){
    this.box(a,x,z+.066,y0+.116,y0+.129,hw*.72,.052,id,-1);
    this.box(a,x,z+.066,y0+.129,y0+.14,hw*.52,.035,id,-1);
    [-.72,0,.72].forEach(f=>this.cyl(a,x+f*hw,z+.066,y0+.056,y0+.116,.007,id,-1));
   }else{
    this.box(a,x,z+.066,y0+.115,y0+.13,hw+.04,.024,id,-1);
    this.box(a,x-hw*.72,z+.068,y0+.13,y0+.21,.018,.018,id,-1);
    this.box(a,x-hw*.72,z+.068,y0+.21,y0+.23,.045,.01,id,-1);
    this.cyl(a,x+hw*.72,z+.066,y0+.056,y0+.15,.009,id,-1);
   }
   this.box(a,x-hw-.05,z+.04,y0,y0+.05,.04,.04,id,-1);this.box(a,x-hw-.05,z+.04,y0+.05,y0+.056,.045,.045,id,-1);
   this.cyl(a,x,z+.1,y0,y0+.11,.005,id,-1);this.box(a,x,z+.1,y0+.11,y0+.13,.04,.006,id,-1);
   if(!b.complete)o.forEach((tk,k)=>{const xs=x-hw+(k+.5)*sl;this.box(a,xs,z+.07,y0+.01,y0+.042,sl/2-.004,.016,id,tk._i);this.box(a,xs,z+.07,y0+.042,y0+.048,sl/2-.008,.011,id,tk._i)});
   if(style===2){this.box(a,x+hw*.35,z+.075,y0+.057,y0+.085,.025,.008,id,-1);this.box(a,x+hw*.35,z+.075,y0+.085,y0+.101,.009,.003,id,-1)}
   if(b.alert){this.cyl(a,x,z+.1,y0+.13,y0+.2,.008,id,-3,true);b.top=y0+.2}
   return;
  }else if(mode==='airport'){
   const L=Math.min(.17,W0*1.5);this.box(a,x,z,y0,y0+.004,L*1.2,.14,id,-1,0);b.bw=L*1.2;b.bd=.14;b.top=y0+.02;
   if(b.complete)return;
   const yb=y0+.014;
   o.forEach((tk,k)=>{const sl=2*L/n,e=k===0||k===n-1,hh=e?.03:.04,dd=e?.022:.03,xc=x-L+(k+.5)*sl;
    this.box(a,xc,z,yb,yb+hh*.6,sl/2,dd,id,tk._i);this.box(a,xc,z,yb+hh*.6,yb+hh+.01,sl/2,dd*.78,id,tk._i)});
   this.box(a,x+L+.015,z,yb+.006,yb+.034,.02,.016,id,-1);
   for(let j=0;j<3;j++){const dz=.03+j*.045,w=.045-j*.009,xx=x+L*.05-j*.026;[1,-1].forEach(sg=>this.box(a,xx,z+sg*dz,y0+.03,y0+.036,w,.025,id,-1))}
   [1,-1].forEach(sg=>{this.box(a,x+L*.02,z+sg*.065,y0+.016,y0+.032,.024,.011,id,-1);this.box(a,x-L*.86,z+sg*.04,y0+.05,y0+.056,.018,.03,id,-1);this.box(a,x+L*.05-.052,z+sg*.145,y0+.034,y0+.066,.012,.003,id,-1)});
   this.box(a,x-L*.85,z,y0+.05,y0+.085,.03,.004,id,-1);this.box(a,x-L*.93,z,y0+.085,y0+.115,.02,.004,id,-1);
   this.cyl(a,x+L*.68,z,y0,y0+.014,.0025,id,-1);this.cyl(a,x+L*.68,z,y0,y0+.005,.006,id,-1);
   [1,-1].forEach(sg=>{this.cyl(a,x-L*.08,z+sg*.022,y0,y0+.015,.003,id,-1);this.cyl(a,x-L*.08,z+sg*.022,y0,y0+.007,.008,id,-1)});
   if(z>.6){const e=Math.min(z+.19,.9);this.box(a,x+L*.45,(z+.04+e)/2,y0+.034,y0+.052,.012,(e-z-.04)/2,id,-1);this.cyl(a,x+L*.45,e,y0,y0+.04,.004,id,-1);this.cyl(a,x+L*.45,z+.04,y0+.03,y0+.056,.016,id,-1)}
   else{this.box(a,x+L*.5,z+.05,y0,y0+.012,.014,.01,id,-1);this.box(a,x-L*.2,z+.07,y0,y0+.012,.02,.008,id,-1)}
   b.top=y0+.12;if(b.alert){this.cyl(a,x-L*.9,z,y0+.11,y0+.17,.008,id,-3,true);b.top=y0+.17}
   return;
  }else{
   const W=W0,D=D0,t=b.type,R=Math.min(W,D)*1.05;
   this.cyl(a,x,z,y0,y0+.006,Math.max(W,D)*1.6,id,-1,false,0);
   if(t==='hall'){
    o.forEach((tk,k)=>this.box(a,x,z,y0+k*bh,y0+(k+1)*bh,W*1.25,D*1.05,id,tk._i));
    for(let i=-1;i<=1;i++)this.box(a,x+i*W*.8,z,top,top+.035,W*.34,D*.98,id,-1);
    for(let i=-1;i<=1;i++)this.box(a,x+i*W*.8,z+D*1.05+.0015,y0,y0+.032,W*.16,.0015,id,-1);this.box(a,x-W*.55,z-D*.3,top,top+.02,W*.2,D*.22,id,-1);this.box(a,x+W*.1,z+D*.35,top,top+.016,W*.15,D*.18,id,-1);this.box(a,x-W*1.4,z,y0,y0+.02,.012,D*.6,id,-1);this.cyl(a,x-W*1.4,z-D*.3,y0+.02,y0+.05,.006,id,-1);this.cyl(a,x-W*1.4,z+D*.3,y0+.02,y0+.05,.006,id,-1);
    this.cyl(a,x+W*1.0,z+D*.7,top,top+.1,.016,id,-2,true);top+=.1;b.bw=W*1.4;b.bd=D*1.2;
   }else if(t==='tank'){
    o.forEach((tk,k)=>this.cyl(a,x,z,y0+k*bh,y0+(k+1)*bh,R,id,tk._i));
    [.3,.62,.88].forEach(f=>this.cyl(a,x,z,y0+(top-y0)*f,y0+(top-y0)*f+.004,R*1.06,id,-1));this.box(a,x+R*1.35,z,y0,y0+.022,.018,.014,id,-1);this.cyl(a,x+R*1.35,z,y0+.022,y0+.036,.008,id,-1);this.box(a,x+R*.7,z+R*.7,y0,top,.004,.004,id,-1);
    this.cyl(a,x,z,top,top+.018,R*.82,id,-1);this.cyl(a,x,z,top+.018,top+.035,R*.4,id,-1);top+=.035;b.bw=R*1.4;b.bd=R*1.4;
   }else{
    const r2=R*.72;o.forEach((tk,k)=>this.cyl(a,x,z,y0+k*bh,y0+(k+1)*bh,r2,id,tk._i));
    [.25,.5,.75].forEach(f=>this.cyl(a,x,z,y0+(top-y0)*f,y0+(top-y0)*f+.004,r2*1.06,id,-1));this.box(a,x+r2*1.04,z,y0,top,.004,.006,id,-1);this.box(a,x+r2*.5,z,top+.075,top+.085,r2*.7,.01,id,-1);
    this.cyl(a,x,z,top,top+.03,r2*.75,id,-1);this.cyl(a,x,z,top+.03,top+.055,r2*.5,id,-1);this.cyl(a,x,z,top+.055,top+.075,r2*.25,id,-1);top+=.075;b.bw=r2*1.5;b.bd=r2*1.5;
   }
   if(b.alert){this.cyl(a,x+W*.4,z,top-.04,top+.14,.015,id,-3,true);top+=.14}
  }
  b.top=top;
 },

 decor(mode,rnd){
  if(mode==='ship')return this.decorShip(rnd);
  if(mode==='satellite')return this.decorSat(rnd);
  if(mode==='factory')return this.decorFactory(rnd);
  if(mode==='airport')return this.decorAirport(rnd);
  if(mode==='metro')return this.decorMetro(rnd);
  return this.decorCity(rnd);
 },
 decorCity(rnd){
  const S=this.S,occ=new Set(this.buildings.map(b=>b.ix+'|'+b.iz)),boxes=[],parks=[],tall=[],ext=1.3;
  const addLot=(lx,lz,w,d,boost,rb)=>{
   if(this.river(lx,lz))return;
   const core=Math.max(0,.62-Math.hypot(lx,lz)*.42),h=Math.min(.62,.04+boost+Math.pow(rb(),2.15)*.2+core*rb()*.62+(rb()<.045?.28:0)),tiers=h>.44?4:h>.32?3:h>.16?2:1;let y0=0;
   for(let t=0;t<tiers;t++){const f=[.5,.28,.14,.08][t],y1=y0+h*f,s=1-t*.18;boxes.push({k:0,x:lx,z:lz,y0,y1,w:w*s,d:d*s,ra:3});y0=y1;
    if(t===tiers-1){boxes.push({k:0,x:lx+w*s*.3,z:lz-d*s*.2,y0:y1,y1:y1+.012,w:w*s*.28,d:d*s*.28,ra:3});boxes.push({k:0,x:lx-w*s*.35,z:lz+d*s*.3,y0:y1,y1:y1+.008,w:w*s*.2,d:d*s*.2,ra:3});
     if(h>.2)boxes.push({k:1,x:lx,z:lz,y0:y1,y1:y1+.03+rb()*.04,w:.003,d:.003,ra:3})}}
   tall.push({x:lx,z:lz,h})
  };
  for(let i=0;i<9;i++)for(let j=0;j<9;j++){
   const ix=i-4,iz=j-4,cx=ix*S,cz=iz*S;if(occ.has(ix+'|'+iz))continue;
   const rb=U.rand(U.hash('blk'+i+'_'+j));
   if(Math.floor(rb()*5)===0&&rb()<.62){parks.push([cx,cz]);continue}
   const lot=(ox,oz,sx,sz,boost=0)=>addLot(cx+ox*S,cz+oz*S,S*.11*sx*(.8+rb()*.35),S*.11*sz*(.8+rb()*.35),boost,rb);
   const pattern=Math.floor(rb()*4);
   if(pattern===0){lot(0,0,1.5,1.35,.08);lot(-.31,.27,.55,.55);lot(.3,-.25,.6,.6)}
   else if(pattern===1){for(const ox of [-.29,.29])for(const oz of [-.28,.28])lot(ox,oz,.72,.72,rb()<.35?.06:0)}
   else if(pattern===2){for(const ox of [-.34,0,.34]){lot(ox,-.3,.62,.55,ox===0?.07:0);if(rb()>.12)lot(ox,.3,.62,.55)}}
   else{for(const ox of [-.32,0,.32])for(const oz of [-.3,.3])if(rb()>.1)lot(ox,oz,.58,.56,0);lot(0,0,.72,.72,.14)}
  }
  tall.sort((p,q)=>q.h-p.h);const tp=tall.slice(0,10),pick=boxes.length?this.cumPick(boxes,rnd):null;
  const gp=()=>[(rnd()*2-1)*ext,rnd()<.9?rnd()*.004:rnd()*.02,(rnd()*2-1)*ext,0];
  const bld=()=>pick?this.primPt(pick(),rnd):gp();
  const RW=S*.15,ST=.07,NT=Math.floor(2*ext/ST),rk=()=>(Math.floor(rnd()*10)-4.5)*S,
   rd=(ax,c,t,w,y,at)=>{const x=ax?c+w:t,z=ax?t:c+w;return[x,y+(this.river(x,z)?.012:0),z,at]};
  const asph=()=>rd(rnd()<.5,rk(),(rnd()*2-1)*ext,(rnd()*2-1)*RW,.001,1);
  const elight=()=>rd(rnd()<.5,rk(),-ext+Math.floor(rnd()*NT)*ST,(rnd()<.5?-1:1)*RW,.005,4);
  const dash=()=>rd(rnd()<.5,rk(),-ext+Math.floor(rnd()*NT)*ST+(rnd()-.5)*.03,(rnd()-.5)*.006,.003,3);
  const zebra=()=>rd(rnd()<.5,rk(),rk()+(rnd()<.5?-1:1)*S*.2+(rnd()-.5)*.022,(Math.floor(rnd()*8)-3.5)*.0095+(rnd()-.5)*.003,.003,3);
  const water=()=>{for(let k=0;k<8;k++){const x=(rnd()*2-1)*ext,z=(rnd()*2-1)*ext;if(this.river(x,z)&&!this.nearSite(x,z,.2))return[x,Math.sin(x*18+z*7)*.003,z,6]}return gp()};
  const park=()=>{if(!parks.length)return gp();const p=parks[Math.floor(rnd()*parks.length)];return[p[0]+(rnd()-.5)*S*.85,Math.pow(rnd(),1.6)*.045,p[1]+(rnd()-.5)*S*.85,5]};
  const lamp=()=>{const ax=rnd()<.5,k=Math.floor(rnd()*10),c=(k-4.5)*S,t=-ext+Math.floor(rnd()*26)*2*(ext/25.5),sd=rnd()<.5?-1:1,x=ax?c+sd*S*.17:t,z=ax?t:c+sd*S*.17;
   if(this.river(x,z)||this.nearSite(x,z,.08))return gp();return[x,rnd()*.028,z,3]};
  const beacon=()=>{if(!tp.length)return gp();const t=tp[Math.floor(Math.pow(rnd(),2)*tp.length)];return rnd()<.12?[t.x,t.h*1.22,t.z,7]:[t.x,t.h+rnd()*t.h*.22,t.z,3]};
  if(this.moverKey!=='city'){this.moverKey='city';this.movers=[];
   const TY=[['sedan',.3],['suv',.17],['taxi',.12],['van',.08],['truck',.09],['bus',.07],['moto',.13],['emg',.04]],PAL=[[220,45,60],[45,125,235],[238,240,240],[35,36,42],[235,200,50],[45,185,105],[150,152,162],[255,130,35],[150,70,220]];
   const carCount=96;
   this.cars=[];for(let i=0;i<170;i++){let r=Math.random(),ty='sedan';for(const q of TY){if(r<q[1]){ty=q[0];break}r-=q[1]}
    const slow=ty==='bus'||ty==='truck';
    const car={ax:Math.random()<.5,k:Math.floor(Math.random()*10),lane:Math.random()<.5?-1:1,s:Math.random(),v:(slow?.1:ty==='moto'?.3:.16)+Math.random()*.14,ty,col:ty==='taxi'?[250,205,40]:ty==='bus'?[40,160,200]:ty==='emg'?[240,240,245]:PAL[Math.floor(Math.random()*PAL.length)]};if(i<carCount)this.cars.push(car)}}
  return this.mix([[.61,bld],[.04,asph],[.04,elight],[.05,dash],[.05,zebra],[.04,water],[.05,park],[.02,beacon],[.03,lamp],[.07,gp]],rnd);
 },
 decorShip(rnd){
  const L=1.25,DY=.2,hw=u=>this.hullW(u);
  const hull=()=>{const u=rnd()*2-1,w=hw(u),v=rnd()*Math.PI;return[u*L,DY-Math.sin(v)*.17*(1-u*u*.3),Math.cos(v)*w,(Math.floor((u+1)*22)%4===0&&rnd()<.6)?4:1]};
  const deck=()=>{const u=rnd()*2-1,w=hw(u)*.96;return[u*L,DY+.002,(rnd()*2-1)*w,rnd()<.1?4:0]};
  const water=()=>{for(let k=0;k<4;k++){const x=(rnd()*2-1)*1.45,z=(rnd()*2-1)*1.45;if(Math.abs(x)>L+.02||Math.abs(z)>hw(x/L)+.03)return[x,0,z,6]}return[1.4,0,1.4,6]};
  const rings=()=>{const k=Math.floor(rnd()*4),a=rnd()*6.2832;return[Math.cos(a)*(L+.12+k*.14),.004,Math.sin(a)*(.5+k*.13),(Math.floor(a*18)%2)?6:4]};
  const sup=[{k:0,x:-1.0,z:0,y0:DY,y1:DY+.2,w:.09,d:.17,ra:3},{k:0,x:-1.0,z:0,y0:DY+.2,y1:DY+.33,w:.07,d:.13,ra:3},{k:0,x:-1.0,z:0,y0:DY+.33,y1:DY+.37,w:.05,d:.19,ra:3},{k:1,x:-.88,z:0,y0:DY+.2,y1:DY+.44,w:.035,d:.035,ra:3}];
  const sp=()=>this.primPt(sup[Math.floor(rnd()*sup.length)],rnd);
  const mast=()=>{const m=rnd()<.5;if(m)return rnd()<.08?[1.12,DY+.34,0,7]:[1.12,DY+rnd()*.32,0,3];return rnd()<.08?[-1.0,DY+.57,0,7]:[-1.0,DY+.37+rnd()*.2,0,3]};
  const rail=()=>{const u=rnd()*2-1,w=hw(u);return[u*L,DY+.015,(rnd()<.5?1:-1)*w*.98,4]};
  const buoy=()=>{const k=Math.floor(rnd()*4),bx=[-1.3,1.35,-1.1,1.2][k],bz=[1.1,-1.15,-1.25,1.2][k];return[bx+(rnd()-.5)*.01,.01+rnd()*.03,bz+(rnd()-.5)*.01,7]};
  if(this.moverKey!=='ship'){
   this.moverKey='ship';const m=[];
   for(let k=0;k<5;k++){const A=L+.3+k*.17,Bz=.65+k*.13;m.push({s:Math.random(),len:2*Math.PI*(A+Bz)/2,sp:(k%2?1:-1)*(.16+Math.random()*.1),tr:7,col:[0,220,255],f:s=>{const a=s*6.2832;return[Math.cos(a)*A,.008,Math.sin(a)*Bz]}})}
   this.movers=m}
  const crate=()=>deck();
  return this.mix([[.26,hull],[.08,deck],[.2,crate],[.2,water],[.06,rings],[.1,sp],[.03,mast],[.05,rail],[.01,buoy]],rnd);
 },
 orbit(k,a){const R=1.45+k*.13;return[Math.cos(a)*R,.75+k*.1+Math.sin(a+k*1.7)*.2,Math.sin(a)*R*.8]},
 decorSat(rnd){
  const E=1.3,towns=[],tr=U.rand(4242);
  for(let k=0;k<80&&towns.length<8;k++){const x=(tr()*2-1)*1.1,z=(tr()*2-1)*1.1,h=this.terrain(x,z);if(h>.08&&h<.2&&!this.nearSite(x,z,.3))towns.push([x,z])}
  const ter=()=>{const x=(rnd()*2-1)*E,z=(rnd()*2-1)*E,h=this.terrain(x,z),f=(h*14)%1;return[x,h,z,f<.08?4:h>.34?3:h>.2?5:h<.07?6:0]};
  const grid=()=>{const ax=rnd()<.5,c=-E+Math.floor(rnd()*7)*(2*E/6),t=(rnd()*2-1)*E,x=ax?c:t,z=ax?t:c;return[x,this.terrain(x,z)+.003,z,1]};
  const town=()=>{if(!towns.length)return ter();const tw=towns[Math.floor(rnd()*towns.length)],x=tw[0]+(rnd()-.5)*.14,z=tw[1]+(rnd()-.5)*.14;return[x,this.terrain(x,z)+.005,z,2]};
  const pad=()=>{const bs=this.buildings;if(!bs.length)return ter();const b=bs[Math.floor(rnd()*bs.length)],a=rnd()*6.2832,x=b.cx+Math.cos(a)*.17,z=b.cz+Math.sin(a)*.17;return[x,this.terrain(x,z)+.003,z,4]};
  const orb=()=>{const k=Math.floor(rnd()*3),a=rnd()*6.2832,p=this.orbit(k,a);return[p[0],p[1],p[2],(Math.floor(a*24)%2)?4:1]};
  if(this.moverKey!=='satellite'){
   this.moverKey='satellite';const m=[];
   for(let i=0;i<5;i++){const k=i%3,dir=i<3?1:-1;m.push({s:Math.random(),len:2*Math.PI*(1.45+k*.13),sp:dir*(.3+Math.random()*.15),tr:9,col:[150,220,255],f:s=>this.orbit(k,s*6.2832)})}
   this.movers=m}
  return this.mix([[.66,ter],[.09,grid],[.08,town],[.06,pad],[.08,orb]],rnd);
 },
 decorAirport(rnd){
  const RZ=-.72,bx=(x,z,y0,y1,w,d)=>({k:0,x,z,y0,y1,w,d,ra:3}),cy=(x,z,y0,y1,r)=>({k:1,x,z,y0,y1,w:r,d:r,ra:3});
  const bl=[bx(0,1.2,0,.07,1.0,.07),bx(0,1.2,.07,.11,.62,.06),bx(0,1.2,.11,.135,.3,.05),bx(-.7,1.02,0,.05,.05,.12),bx(0,1.02,0,.05,.05,.12),bx(.7,1.02,0,.05,.05,.12),
   cy(1.12,1.0,0,.34,.022),cy(1.12,1.0,.34,.38,.032),bx(1.12,1.0,.38,.44,.06,.06),bx(1.12,1.0,.44,.455,.07,.07),cy(1.12,1.0,.455,.52,.004),
   bx(-1.15,.55,0,.07,.11,.2),bx(-1.15,.55,.07,.105,.09,.18),bx(-1.15,.55,.105,.125,.06,.16),bx(-1.15,.1,0,.07,.11,.17),bx(-1.15,.1,.07,.105,.09,.15),bx(-1.15,.1,.105,.125,.06,.13),
   cy(1.25,.2,0,.05,.045),cy(1.25,.35,0,.05,.045),cy(1.25,.5,0,.05,.045),cy(-1.2,1.1,0,.1,.012),cy(-1.2,1.1,.1,.115,.05),bx(1.2,.75,0,.04,.07,.05),
   cy(-1.15,-.58,0,.08,.003),bx(-1.12,-.58,.07,.08,.03,.008)],pk=this.cumPick(bl,rnd);
  const cars=()=>[-.9+Math.floor(rnd()*19)*.1+(rnd()-.5)*.035,.006+rnd()*.008,1.31+Math.floor(rnd()*3)*.06+(rnd()-.5)*.02,rnd()<.4?3:1];
  const bld=()=>rnd()<.012?[1.12,.45,1.0,7]:this.primPt(pk(),rnd);
  const floor=()=>[(rnd()*2-1)*1.4,rnd()<.9?rnd()*.004:rnd()*.02,(rnd()*2-1)*1.4,0];
  const rwy=()=>[(rnd()*2-1)*1.3,.002,RZ+(rnd()-.5)*.15,1];
  const edge=()=>[-1.3+Math.floor(rnd()*27)*.1,.004,RZ+(rnd()<.5?-.08:.08),4];
  const dash=()=>[-1.25+Math.floor(rnd()*26)*.1+rnd()*.05,.003,RZ+(rnd()-.5)*.006,3];
  const appr=()=>[-1.35-Math.floor(rnd()*6)*.09,.01,RZ+(Math.floor(rnd()*3)-1)*.04,7];
  const taxi=()=>[(rnd()*2-1)*1.05,.003,-.38+(rnd()-.5)*.005,rnd()<.5?4:1];
  const conn=()=>[(rnd()<.5?-1:1)+(rnd()-.5)*.005,.003,-.72+rnd()*.34,4];
  const aprn=()=>{if(rnd()<.5)return[(rnd()*2-1),.003,rnd()<.5?-.2:.98,1];return[rnd()<.5?-1:1,.003,-.2+rnd()*1.18,1]};
  const rect=s=>{const w=1.9,h=1.18,P=2*(w+h);let d=((s%1)+1)%1*P;if(d<w)return[-.95+d,.01,-.25];d-=w;if(d<h)return[.95,.01,-.25+d];d-=h;if(d<w)return[.95-d,.01,.93];d-=w;return[-.95,.01,.93-d]};
  if(this.moverKey!=='airport'){this.moverKey='airport';const m=[];
   for(let i=0;i<5;i++)m.push({s:Math.random(),len:6.2,sp:(i%2?1:-1)*(.3+Math.random()*.2),tr:5,col:[255,216,74],f:rect});
   for(let i=0;i<3;i++)m.push({s:Math.random(),len:2.1,sp:(i%2?1:-1)*(.25+Math.random()*.1),tr:4,col:[0,220,255],f:s=>[-1.05+s*2.1,.012,-.38]});
   this.movers=m}
  return this.mix([[.28,floor],[.12,rwy],[.1,edge],[.06,dash],[.05,appr],[.08,taxi],[.04,conn],[.07,aprn],[.03,cars],[.3,bld]],rnd);
 },
 LC:[[255,140,40],[40,200,255],[230,70,200],[255,215,60],[120,230,80],[255,70,80]],
 mgrid(){return Math.max(3,...this.buildings.map(b=>(b.p.slots.metro||{g:3}).g))},
 mz(r,g){return((r+.5)/g*2-1)*.75},
 decorMetro(rnd){
  const g=this.mgrid(),Z=[],TR=[],X0=1.15;for(let r=0;r<g;r++){const z=this.mz(r,g);Z.push(z);TR.push(z-.028,z-.006,z+.07)}
  const floor=()=>[(rnd()*2-1)*1.4,rnd()<.9?rnd()*.004:rnd()*.02,(rnd()*2-1)*1.4,0];
  const rail=()=>[(rnd()*2-1)*X0,.004,TR[Math.floor(rnd()*TR.length)]+(rnd()<.5?-.006:.006),3];
  const slp=()=>[-X0+Math.floor(rnd()*93)*.025+(rnd()-.5)*.004,.002,TR[Math.floor(rnd()*TR.length)]+(rnd()-.5)*.022,1];
  const lr=()=>{const o=(rnd()<.5?-1:1)*.007,u=rnd()<.5?-1:1;return rnd()<.55?[(rnd()*2-1)*X0,.004,u*.98+o,3]:[u*X0+o,.004,(rnd()*2-1)*.98,3]};
  const sig=()=>[-1.05+Math.floor(rnd()*8)*.3,.012+rnd()*.02,TR[Math.floor(rnd()*TR.length)]-.016,7];
  const cb=[],cr=U.rand(777);
  for(let i=-7;i<=7;i++)for(let j=-6;j<=6;j++){const x=i*.15,zq=j*.15;if(Z.some(z=>Math.abs(zq-(z+.02))<.17)||Math.abs(x)>1.05||Math.abs(zq)>.88||cr()<.25)continue;
   cb.push({k:0,x:x+(cr()-.5)*.03,z:zq+(cr()-.5)*.03,y0:0,y1:.02+Math.pow(cr(),2)*.1,w:.03+cr()*.025,d:.03+cr()*.025,ra:3})}
  const stationPrims=[];
  this.buildings.forEach(b=>{
   const w=b.bw||.16,style=b.metroStyle||0;
   stationPrims.push({k:0,x:b.cx,z:b.cz+.095,y0:.13,y1:.145,w:w*(style===1?.9:1.1),d:.026,ra:4});
   stationPrims.push({k:0,x:b.cx,z:b.cz+.074,y0:.145,y1:.151,w:w*(style===2?.54:.8),d:.008,ra:3});
   if(style===2)stationPrims.push({k:0,x:b.cx-w*.7,z:b.cz+.078,y0:.13,y1:.22,w:.009,d:.009,ra:7});
  });
  const pk=cb.length?this.cumPick(cb,rnd):null,spk=stationPrims.length?this.cumPick(stationPrims,rnd):null,blk=()=>pk?this.primPt(pk(),rnd):floor(),station=()=>spk?this.primPt(spk(),rnd):floor();
  const key='metro'+g;
  if(this.moverKey!==key){this.moverKey=key;this.movers=[];this.trains=[];
   Z.forEach((z,r)=>[[1,z-.028],[-1,z-.006]].forEach(([dr,zt])=>{for(let i=0;i<2;i++)this.trains.push({k:'row',dr,zt,s:Math.random(),v:.25+Math.random()*.15,n:4+Math.floor(Math.random()*3),col:this.LC[r%this.LC.length]})}));
   for(let i=0;i<3;i++)this.trains.push({k:'loop',s:i/3,v:.3,n:6,col:[235,240,245]})}
  return this.mix([[.18,floor],[.12,rail],[.08,slp],[.05,lr],[.025,sig],[.06,station],[.37,blk]],rnd);
 },
 decorFactory(rnd){
  const B=this.buildings,g=Math.max(3,...B.map(b=>(b.p.slots.factory||{g:3}).g)),PI2=Math.PI*2;
  const bx=(x,z,y0,y1,w,d,ra)=>({k:0,x,z,y0,y1,w,d,ra:ra==null?3:ra}),cy=(x,z,y0,y1,r,ra)=>({k:1,x,z,y0,y1,w:r,d:r,ra:ra==null?3:ra}),cr=(x,z,y0,y1,w,d,fa)=>({k:0,x,z,y0,y1,w,d,ra:3,rib:true,fa});
  const pool=a=>{const p=this.cumPick(a,rnd);return()=>this.primPt(p(),rnd)},ln=(p,q,at)=>{const t=rnd();return[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t,at]},pk=a=>a[Math.floor(rnd()*a.length)];
  const halls=[[-.75,-1.22,.26,.1,.15],[-.1,-1.22,.26,.1,.2],[.6,-1.22,.26,.1,.17]].map(h=>({k:0,x:h[0],z:h[1],y0:0,y1:h[4],w:h[2],d:h[3],ra:3}));
  const tanks=[[1.25,-.55,.1,.26],[1.25,-.05,.11,.3],[1.25,.5,.1,.22]].map(c=>({k:1,x:c[0],z:c[1],y0:0,y1:c[3],w:c[2],d:c[2],ra:3}));
  const stacks=[[-1.25,-1.0,.04,.75],[-1.25,-.7,.035,.55]].map(c=>({k:1,x:c[0],z:c[1],y0:0,y1:c[3],w:c[2],d:c[2],ra:3}));
  const pipes=[[[1.25,-.55],[.6,-1.22]],[[1.25,-.05],[1.25,-.55]],[[-1.25,-1.0],[-.75,-1.22]],[[-1.25,-.7],[-.1,-1.22]]];
  const roofs=[],units=[],docks=[],trailers=[];
  halls.forEach(h=>{
   for(let i=0;i<6;i++){const xw=h.w/6;roofs.push(bx(h.x-h.w+(i*2+1)*xw,h.z,h.y1,h.y1+.018,xw*.55,h.d*.94))}
   for(let i=0;i<3;i++)units.push(bx(h.x-h.w*.6+i*h.w*.6,h.z+(i%2?.04:-.04),h.y1,h.y1+.014,.018,.014),cy(h.x-h.w*.8+i*h.w*.8,h.z,h.y1,h.y1+.03,.006));
   for(let i=0;i<4;i++){const dx=h.x-h.w*.75+i*h.w*.5;docks.push({x:dx,z:h.z+h.d});if(i%2===0)trailers.push(bx(dx,h.z+h.d+.062,.006,.04,.021,.06))}
  });
  const dock=()=>{const d=pk(docks),w=.022,H=.05,z=d.z+.001,P=[[d.x-w,0],[d.x+w,0],[d.x+w,H],[d.x-w,H]];
   if(rnd()<.55){const e=Math.floor(rnd()*4),p=P[e],q=P[(e+1)%4];return ln([p[0],p[1]+.002,z],[q[0],q[1]+.002,z],4)}
   return[d.x-w+rnd()*2*w,rnd()*H,z,rnd()<.4?2:1]};
  const tankTops=[],bund=[];
  tanks.forEach(t=>{tankTops.push(cy(t.x,t.z,t.y1,t.y1+.018,t.w*.82),cy(t.x,t.z,t.y1+.018,t.y1+.034,t.w*.4));const e=t.w+.07;[[e,0,.004,e],[-e,0,.004,e],[0,e,e,.004],[0,-e,e,.004]].forEach(s=>bund.push(bx(t.x+s[0],t.z+s[1],0,.022,s[2],s[3],1)))});
  const stair=()=>{const i=Math.floor(rnd()*tanks.length),t=tanks[i],u=rnd(),a=u*PI2*2.4+i*2,r=t.w+.008;return[t.x+Math.cos(a)*r,u*t.y1,t.z+Math.sin(a)*r,3]};
  const rim=()=>{const t=pk(tanks),a=rnd()*PI2,r=t.w*.82;return[t.x+Math.cos(a)*r,t.y1+.018,t.z+Math.sin(a)*r,4]};
  const manifold=()=>{if(rnd()<.45)return ln([1.12,.05,-.55],[1.12,.05,.5],4);const t=pk(tanks);return ln([1.12,.05,t.z],[t.x-t.w,.05,t.z],6)};
  const spheres=[[-1.2,.13,.62],[-1.2,.13,.9]],legs=[];
  spheres.forEach(s=>{for(let i=0;i<6;i++){const a=i/6*PI2;legs.push(cy(s[0]+Math.cos(a)*.052,s[2]+Math.sin(a)*.052,0,.075,.003))}});
  const sph=()=>{const s=pk(spheres),u=rnd()*2-1,a=rnd()*PI2,q=Math.sqrt(1-u*u),r=.065;return[s[0]+q*Math.cos(a)*r,s[1]+u*r,s[2]+q*Math.sin(a)*r,Math.floor((u+1)*5)%2?2:1]};
  const furn=[bx(-1.1,-1.0,0,.09,.04,.05),bx(-1.1,-.7,0,.07,.035,.045)];
  const duct=()=>rnd()<.5?ln([-1.1,.09,-1.0],[-1.25,.16,-1.0],4):ln([-1.1,.07,-.7],[-1.25,.14,-.7],4);
  const RX0=-1.02,RX1=.45,RZ=-.9,RY=.11,rk=[];
  for(let i=0;i<8;i++){const x=RX0+i*(RX1-RX0)/7;rk.push(cy(x,RZ+.014,0,RY,.004),cy(x,RZ-.014,0,RY,.004),bx(x,RZ,RY,RY+.005,.004,.02))}
  const rack=()=>{const k=Math.floor(rnd()*3);return[RX0+(RX1-RX0)*rnd(),RY+.009,RZ+(k-1)*.011,[4,6,3][k]]};
  const drop=()=>{const h=pk(halls.slice(0,2));return ln([h.x,RY+.009,RZ],[h.x,.12,h.z+h.d],6)};
  const ph=pool(halls),pt=()=>this.primPt(tanks[Math.floor(rnd()*tanks.length)],rnd);
  const ps=()=>{const s=stacks[Math.floor(rnd()*stacks.length)];if(rnd()<.07)return[s.x,s.y1+.01,s.z,7];const q=this.primPt(s,rnd);if(q[1]>s.y1*.55&&Math.floor(q[1]/(s.y1*.09))%2===0&&q[1]<s.y1)q[3]=7;return q};
  const plume=()=>{const s=stacks[Math.floor(rnd()*stacks.length)],t=rnd(),y=s.y1+t*.4;return[s.x+t*.18+(rnd()-.5)*.05*t,y,s.z+t*.08+(rnd()-.5)*.05*t,1]};
  const pipe=()=>{const p=pipes[Math.floor(rnd()*pipes.length)],t=rnd();return[p[0][0]+(p[1][0]-p[0][0])*t,.1+Math.sin(t*Math.PI)*.07,p[0][1]+(p[1][1]-p[0][1])*t,4]};
  const zbs=[];for(let k=0;k<=g;k++)zbs.push(-.75+k*1.5/g);
  const belt=()=>{const k=Math.floor(rnd()*(g+1)),zb=-.75+k*1.5/g;return[(rnd()*2-1)*.95,.006,zb+(rnd()-.5)*.012,rnd()<.3?4:1]};
  const rail=()=>[(rnd()*2-1)*.95,.016,pk(zbs)+(rnd()<.5?-.011:.011),1];
  const roll=()=>[-.95+Math.floor(rnd()*64)*1.9/63,.0095,pk(zbs)+(rnd()-.5)*.016,3];
  const bl=[],gan=[];
  zbs.forEach(zb=>{for(let i=0;i<17;i++)bl.push(cy(-.95+i*.11875,zb,0,.014,.003,1));[-.6,0,.6].forEach(x=>gan.push(cy(x,zb-.025,0,.07,.0035),cy(x,zb+.025,0,.07,.0035),bx(x,zb,.07,.076,.004,.028)))});
  const per=()=>{if(rnd()<.5){const zz=rnd()<.5?-.98:.96;return[(rnd()*2-1)*1.08,.003,zz,rnd()<.25?4:1]}const xx=rnd()<.5?-1.08:1.08;return[xx,.003,-.98+rnd()*1.94,rnd()<.25?4:1]};
  const floor=()=>[(rnd()*2-1)*1.4,rnd()<.9?rnd()*.004:rnd()*.02,(rnd()*2-1)*1.4,0];
  const rect=s=>{const w=2.16,h=1.94,P=2*(w+h);let d=((s%1)+1)%1*P;if(d<w)return[-1.08+d,.01,-.98];d-=w;if(d<h)return[1.08,.01,-.98+d];d-=h;if(d<w)return[1.08-d,.01,.96];d-=w;return[-1.08,.01,.96-d]};
  const post=()=>{const p=rect(Math.floor(rnd()*54)/54),y=rnd()*.03;return[p[0],y,p[2],y>.027?3:1]};
  const wire=()=>{const p=rect(rnd());return[p[0],.032,p[2],1]};
  const lamp=()=>{const p=rect((Math.floor(rnd()*14)+.5)/14),u=rnd();if(u<.55)return[p[0],rnd()*.09,p[2],1];if(u<.75)return[p[0],.092,p[2],3];const a=rnd()*PI2;return[p[0]+Math.cos(a)*.05,.002,p[2]+Math.sin(a)*.05,1]};
  const gateS=[cy(-.12,.96,0,.05,.006),cy(.12,.96,0,.05,.006),bx(.3,.99,0,.04,.04,.025)];
  const gate=()=>rnd()<.25?ln([-.12,.03,.96],[.12,.03,.96],7):this.primPt(pk(gateS),rnd);
  const cont=[];
  for(let r=0;r<2;r++)for(let i=0;i<14;i++){if(rnd()<.14)continue;const x=-.93+i*.143,z=1.12+r*.075,hN=1+Math.floor(rnd()*3),fa=pk([1,1,4,6,7,2]);for(let l=0;l<hN;l++)cont.push(cr(x,z,l*.021,(l+1)*.021,.06,.024,fa))}
  if(!cont.length)cont.push(cr(0,1.12,0,.021,.06,.024,1));
  const yg=[];[-.3,.45].forEach(x=>yg.push(cy(x,1.065,0,.1,.005),cy(x,1.21,0,.1,.005),bx(x,1.1375,.1,.106,.005,.0725)));
  const yrail=()=>[-1+rnd()*2,.003,rnd()<.5?1.065:1.21,3];
  const road=()=>{const u=rnd();if(u<.5)return[-1.25+Math.floor(rnd()*40)*.0625+rnd()*.03,.002,1.03,3];return[(rnd()*2-1)*1.25,.002,u<.75?1.0:1.06,1]};
  const sub=[];
  for(let i=0;i<4;i++){const z=-.3+i*.2;sub.push(bx(-1.2,z,0,.04,.03,.025),bx(-1.2,z-.03,.004,.032,.02,.004));for(let j=-1;j<=1;j++)sub.push(cy(-1.2+j*.015,z,.04,.065,.003))}
  [-.5,.5].forEach(z=>sub.push(cy(-1.335,z,0,.15,.005),cy(-1.305,z,0,.15,.005),bx(-1.32,z,.12,.126,.04,.004),bx(-1.32,z,.14,.145,.03,.004)));
  const cat=()=>{const k=Math.floor(rnd()*3)-1,t=rnd();return[-1.32+k*.02,.12-.03*4*t*(1-t),-.5+t,3]};
  const cools=[{x:.98,z:-1.12,r:.085,h:.2},{x:1.2,z:-1.15,r:.085,h:.2}];
  const cool=()=>{const c=pk(cools),a=rnd()*PI2;if(rnd()<.06)return[c.x+Math.cos(a)*c.r*.74,c.h,c.z+Math.sin(a)*c.r*.74,4];const y=rnd()*c.h,u=y/c.h,r=c.r*(1-.3*Math.sin(Math.PI*Math.pow(u,.75))),aq=Math.floor(a/PI2*56)/56*PI2;return[c.x+Math.cos(aq)*r,y,c.z+Math.sin(aq)*r,Math.floor(y/.02)%3===0?3:(rnd()<.6?2:1)]};
  const steam=()=>{const c=pk(cools),t=rnd(),w=.03+t*.05;return[c.x+t*.06+(rnd()-.5)*w,c.h+t*.3,c.z+(rnd()-.5)*w,1]};
  const roofP=pool(roofs),unitP=pool(units),trailP=pool(trailers),topP=pool(tankTops),bundP=pool(bund),legP=pool(legs),furnP=pool(furn),rackP=pool(rk),blP=pool(bl),ganP=pool(gan),contP=pool(cont),ygP=pool(yg),subP=pool(sub);
  const key='factory'+g;
  if(this.moverKey!==key){
   this.moverKey=key;const m=[];
   for(let k=0;k<=g;k++){const zb=-.75+k*1.5/g;for(let i=0;i<3;i++)m.push({s:Math.random(),len:1.9,sp:(k%2?1:-1)*(.14+Math.random()*.08),tr:4,col:[255,216,74],f:s=>[-.95+s*1.9,.014,zb]})}
   for(let i=0;i<5;i++)m.push({s:Math.random(),len:8.2,sp:(i%2?1:-1)*(.35+Math.random()*.2),tr:8,col:[0,220,255],f:rect});
   for(let i=0;i<3;i++){const zl=1.03+(i%2?.012:-.012);m.push({s:Math.random(),len:2.4,sp:(i%2?1:-1)*(.22+Math.random()*.1),tr:7,col:[255,170,60],f:s=>[-1.2+s*2.4,.012,zl]})}
   [-.3,.45].forEach((xg,i)=>m.push({s:Math.random(),len:.15,sp:(i?1:-1)*.07,tr:3,col:[255,235,140],f:s=>[xg,.107,1.065+s*.145]}));
   this.movers=m}
  return this.mix([[.075,ph],[.03,roofP],[.012,unitP],[.02,dock],[.012,trailP],[.075,pt],[.012,topP],[.012,bundP],[.015,stair],[.008,rim],[.01,manifold],[.04,sph],[.01,legP],[.04,ps],[.04,plume],[.012,furnP],[.006,duct],[.04,pipe],[.05,rack],[.012,rackP],[.01,drop],[.07,belt],[.02,rail],[.012,blP],[.02,roll],[.015,ganP],[.03,per],[.015,post],[.01,wire],[.015,lamp],[.02,gate],[.06,contP],[.012,ygP],[.006,yrail],[.012,road],[.035,subP],[.012,cat],[.05,cool],[.025,steam],[.17,floor]],rnd);
 },


 build(mode){
  const prims=[],B=this.buildings;
  B.forEach(b=>this.projectPrims(mode,b,prims));
  const N=CONFIG.points,projN=prims.length?Math.min(Math.floor(N*.5),B.length*4500):0;
  const rnd=U.rand(U.hash(mode+'|'+B.map(b=>b.id+':'+b.p.seed+':'+b.n).join(',')));
  const pick=prims.length?this.cumPick(prims,rnd):null,dec=this.decor(mode,rnd);
  const pos=new Float32Array(N*3),attr=new Uint8Array(N),pid=new Int16Array(N),tid=new Int16Array(N),bri=new Float32Array(N);
  for(let i=0,k=0;i<N;i++){
   let pt,id=-1,ti=-1;
   if(i<projN){const q=pick();pt=this.primPt(q,rnd);id=q.pid;ti=q.ti;if(q.blink)pt[3]=7}else pt=dec();
   pos[k++]=pt[0]+(rnd()-.5)*.0012;pos[k++]=pt[1];pos[k++]=pt[2]+(rnd()-.5)*.0012;
   attr[i]=pt[3];pid[i]=id;tid[i]=ti;bri[i]=.55+rnd()*.45;
  }
  return{prims,pos,attr,pid,tid,bri};
 },
 rebuild(instant){
  const mode=State.scene,P=Store.projects;this.mode=mode;
  const pn=(mode==='city'||mode==='airport'||mode==='metro'||mode==='factory')?85000:50000;const old=this.cur,oN=old?old.length/3:0;CONFIG.points=pn;
  this.buildings=P.map((p,i)=>({p,id:p.id,index:i,name:p.name,group:p.group,cx:0,cz:0,y0:0,h:.12,n:0}));
  this.byId=new Map(this.buildings.map(b=>[b.id,b]));
  if(State.selected&&!this.byId.has(State.selected))State.selected='';
  this.layout(mode);Data.refresh();
  const sc=this.build(mode);
  this.prims=sc.prims;this.pos=sc.pos;this.attr=sc.attr;this.pid=sc.pid;this.tid=sc.tid;this.bri=sc.bri;
  if(instant||!this.cur){this.cur=new Float32Array(sc.pos);this.moving=false}
  else{const N=CONFIG.points,fr=new Float32Array(N*3);for(let i=0;i<N;i++){const j=(i<oN?i:i%oN)*3;fr[i*3]=old[j];fr[i*3+1]=old[j+1];fr[i*3+2]=old[j+2]}this.from=fr;this.cur=new Float32Array(fr);this.delay=new Float32Array(CONFIG.points);for(let i=0;i<CONFIG.points;i++)this.delay[i]=Math.random()*.5;this.t0=performance.now();this.moving=true}
 },
 stepMorph(now){
  if(!this.moving)return;const t=(now-this.t0)/1000,N=CONFIG.points,cur=this.cur,from=this.from,to=this.pos;let done=true;
  for(let i=0,p=0;i<N;i++,p+=3){const k=U.cl((t-this.delay[i])/1.2,0,1);if(k<1)done=false;const e=k*k*(3-2*k),s=Math.sin(k*3.14)*.22;
   cur[p]=from[p]+(to[p]-from[p])*e+s*(Math.random()-.5);cur[p+1]=from[p+1]+(to[p+1]-from[p+1])*e+s*Math.random()*.6;cur[p+2]=from[p+2]+(to[p+2]-from[p+2])*e+s*(Math.random()-.5)}
  if(done){this.moving=false;cur.set(to)}
 }
};
