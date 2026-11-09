import{CONFIG,U,State,UI}from'./core.js'
import{L}from'./i18n.js'
import{World}from'./world.js'
const CAR_SP={sedan:[.034,.016,.007],suv:[.038,.018,.01],taxi:[.034,.016,.007],van:[.042,.019,.011],truck:[.075,.02,.014],bus:[.085,.021,.014],moto:[.02,.006,.006],emg:[.04,.018,.011]};
const CAR_MG=.014;
export const R={cv:null,ctx:null,bl:null,blx:null,img:null,buf:null,PW:0,PH:0,DPR:1,S:1,ox:0,oy:0,cy:1,sy:0,cx:1,sx:0,pingT:-1,pcx:0,pcz:0,scr:[],
 init(cv){this.cv=cv;this.ctx=cv.getContext('2d');if(!this.bl){this.bl=document.createElement('canvas');this.blx=this.bl.getContext('2d')}},
 fit(){const w=this.cv.clientWidth,h=this.cv.clientHeight;if(!w||!h)return false;this.DPR=Math.min(devicePixelRatio||1,1.5);
  const pw=Math.round(w*this.DPR),ph=Math.round(h*this.DPR);
  if(this.cv.width!==pw||this.cv.height!==ph){this.cv.width=pw;this.cv.height=ph;this.img=this.ctx.createImageData(pw,ph);this.buf=new Uint32Array(this.img.data.buffer);this.bl.width=Math.ceil(pw/4);this.bl.height=Math.ceil(ph/4)}
  this.PW=pw;this.PH=ph;return true},
 P(x,y,z){const x1=x*this.cy-z*this.sy,z1=x*this.sy+z*this.cy,yy=y-.2,y1=yy*this.cx-z1*this.sx,d=yy*this.sx+z1*this.cx,pp=1/(1-d*.18);return[this.ox+x1*this.S*pp,this.oy-y1*this.S*pp,d]},
 add(i,r,g,b){const o=this.buf[i],rr=(o&255)+r,gg=((o>>8)&255)+g,bb=((o>>16)&255)+b;this.buf[i]=(255<<24)|((bb>255?255:bb)<<16)|((gg>255?255:gg)<<8)|(rr>255?255:rr)},
 splat(px,py,r,g,b,big){if(px<0||py<0||px>=this.PW-1||py>=this.PH-1)return;const i=py*this.PW+px;this.add(i,r,g,b);if(big){this.add(i+1,r*.6,g*.6,b*.6);this.add(i+this.PW,r*.6,g*.6,b*.6)}},
 render(dt){
  const T=State.time,PW=this.PW,PH=this.PH;this.buf.fill(0);
  const rx=State.rotX+Math.sin(T*.2)*.03;
  this.S=Math.min(PW,PH*1.25)*.44*State.zoom;this.ox=PW/2;this.oy=PH*.64;
  this.cy=Math.cos(State.rotY);this.sy=Math.sin(State.rotY);this.cx=Math.cos(rx);this.sx=Math.sin(rx);
  if(State.fw>.001){const fy=State.fy-.2,x1=State.fx*this.cy-State.fz*this.sy,z1=State.fx*this.sy+State.fz*this.cy,y1=fy*this.cx-z1*this.sx,d=fy*this.sx+z1*this.cx,pp=1/(1-d*.18),w=State.fw;
   this.ox=PW/2-w*x1*this.S*pp;this.oy=PH*.64*(1-w)+w*(PH*.52+y1*this.S*pp)}
  const gcy=this.cy,gsy=this.sy,gcx=this.cx,gsx=this.sx,gS=this.S,gOx=this.ox,gOy=this.oy;
  const fT=Math.floor(T*2.2),scan=(T*.16)%1.2-.05;
  if(this.pingT<0||T-this.pingT>4.5){this.pingT=T;this.pcx=U.rn(-.8,.8);this.pcz=U.rn(-.8,.8)}
  const pingR=(T-this.pingT)/4.5*2.2;
  if(State.pm!==World.mode){State.pm=World.mode;State.flights.length=0;State.done.clear();State.fi=false}
  if(World.mode==='airport'||World.mode==='metro'){for(const b of World.buildings){if(b.complete){if(!State.done.has(b.id)){State.done.add(b.id);if(State.fi){State.flights.push({id:b.id,t:T,x:b.cx,z:b.cz,n:b.p.name,nc:b.n});UI.log(L('take off · ')+b.p.name,'',b.p.id)}}}else State.done.delete(b.id)}State.fi=true}else{State.fi=false;State.done.clear();State.flights.length=0}
  const pos=World.cur,attr=World.attr,pid=World.pid,tid=World.tid,bri=World.bri,pal=CONFIG.palette,Bs=World.buildings,N=CONFIG.points;
  const selI=World.idx(State.selected),hovI=World.idx(State.hover),wav=World.mode==='ship',cty=World.mode==='city'||World.mode==='airport'||World.mode==='metro';
  for(let i=0,p=0;i<N;i++,p+=3){
   const x=pos[p],z=pos[p+2],a=attr[i];let y=pos[p+1];
   if(wav&&a===6)y+=Math.sin(x*9+T*1.6+z*6)*.006;
   const x1=x*gcy-z*gsy,z1=x*gsy+z*gcy,yy=y-.2,y1=yy*gcx-z1*gsx,d=yy*gsx+z1*gcx,pp=1/(1-d*.18);
   const px=(gOx+x1*gS*pp)|0,py=(gOy-y1*gS*pp)|0;
   if(px<0||px>=PW-1||py<0||py>=PH-1)continue;
   let b=bri[i]*(1.14-U.cl((.9-d)*.4,0,.8))*(1+y*.5),r,g,bl,hot=false;
   if(cty&&a===0)b*=.5;
   if(a===2)b*=(((i*13+fT)%9)<7?1:.25);else if(a===7)b*=Math.sin(T*3+i%7)>0?1.4:.1;
   const id=pid[i];
   if(id>=0&&Bs[id]){
    const bb=Bs[id],c=bb.col[tid[i]+3]||bb.col[2],m=(.42+b*.8)*(a===3?1.25:a===0?.7:1);r=c[0]*m;g=c[1]*m;bl=c[2]*m;
    if(id===selI){r=r*1.25+60;g=g*1.25+60;bl=bl*1.25+60;hot=true}
    else if(id===hovI){r=r*1.3+30;g=g*1.3+30;bl=bl*1.3+30;hot=true}
   }else{const pc=pal[a]||pal[0];r=pc[0]*b;g=pc[1]*b;bl=pc[2]*b}
   if(!hot){
    if(Math.abs(y-scan)<.013){r=0;g=255;bl=110;hot=true}
    else{const dx=x-this.pcx,dz=z-this.pcz,dd=Math.sqrt(dx*dx+dz*dz)-pingR;if(dd<.035&&dd>-.035){g+=150;r+=70;bl+=70;hot=true}}
   }
   const idx=py*PW+px;this.add(idx,r,g,bl);
   if(hot||b>(cty?.5:.75)||(cty&&id>=0)){this.add(idx+1,r*.5,g*.5,bl*.5);this.add(idx+PW,r*.5,g*.5,bl*.5)}
  }
  if(State.showTraffic){
   for(const v of World.movers){
    v.s=(((v.s+v.sp*dt/v.len)%1)+1)%1;const hd=v.sp>0?1:-1,st=.011/v.len,tr=v.tr||5;
    for(let j=0;j<tr;j++){const w=v.f((((v.s-hd*j*st)%1)+1)%1),q=this.P(w[0],w[1],w[2]),f=1-j/tr;
     if(j===0)this.splat(q[0]|0,q[1]|0,255,255,255,true);else this.splat(q[0]|0,q[1]|0,v.col[0]*f,v.col[1]*f,v.col[2]*f,false)}
   }
  }
  this.scr=Bs.map(b=>this.P(b.cx,b.y0+b.h*.5,b.cz));
  const c=this.ctx;c.putImageData(this.img,0,0);
  this.blx.clearRect(0,0,this.bl.width,this.bl.height);this.blx.drawImage(this.cv,0,0,this.bl.width,this.bl.height);
  c.globalCompositeOperation='lighter';c.imageSmoothingQuality='high';
  c.globalAlpha=cty?.3:.7;c.drawImage(this.bl,0,0,PW,PH);c.globalAlpha=cty?.1:.35;c.drawImage(this.bl,-10,-10,PW+20,PH+20);
  c.globalAlpha=1;c.globalCompositeOperation='source-over';if(cty)this.ground(c);this.hud();
 },
 ground(c){const S=World.S,RW=S*.15,E=1.3;
  const quad=(x0,x1,z0,z1,f)=>{const q=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(v=>this.P(v[0],.001,v[1]));c.fillStyle=f;c.beginPath();q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill()};
  c.globalCompositeOperation='destination-over';
  if(World.mode==='city'){for(let k=0;k<10;k++){const cc=(k-4.5)*S;quad(cc-RW,cc+RW,-E,E,'rgba(14,84,48,.96)');quad(-E,E,cc-RW,cc+RW,'rgba(14,84,48,.96)')}}
  else if(World.mode==='metro'){const g=World.mgrid(),LC=World.LC;
   for(let r=0;r<g;r++){const z=World.mz(r,g),cl=LC[r%LC.length];quad(-1.15,1.15,z-.046,z+.012,'rgba('+cl[0]+','+cl[1]+','+cl[2]+',.3)');quad(-1.15,1.15,z+.056,z+.084,'rgba(10,40,28,.9)')}
   const lf='rgba(235,240,245,.24)';quad(-1.19,1.19,-1,-.96,lf);quad(-1.19,1.19,.96,1,lf);quad(-1.19,-1.11,-1,1,lf);quad(1.11,1.19,-1,1,lf)}
  else{quad(-E,E,-.795,-.645,'rgba(16,90,52,.96)');quad(-1.05,1.05,-.41,-.35,'rgba(14,80,46,.96)');quad(-1.03,-.97,-.72,-.38,'rgba(14,80,46,.96)');quad(.97,1.03,-.72,-.38,'rgba(14,80,46,.96)');quad(-1,1,-.2,.98,'rgba(8,52,30,.92)')}
  quad(-1.4,1.4,-1.4,1.4,'rgba(0,26,12,.95)');c.globalCompositeOperation='source-over'},
 drawCars(c,T){const W=World,S=W.S,E=1.25,m=this.DPR,dt=Math.min(.1,Math.max(0,T-(this.ct||T))),list=[],ph=T%10,IC=[];this.ct=T;
  for(let i=0;i<10;i++)IC.push((i-4.5)*S);
  const st=ax=>{const q=ax?ph:(ph+5)%10;return q<4.5?0:q<5?1:2},SC=['rgba(0,255,110,','rgba(255,215,60,','rgba(255,55,70,'];
  for(let i=0;i<10;i++)for(let j=0;j<10;j++){const xi=IC[i],zj=IC[j],o=S*.2,rw=S*.17;
   [[xi+rw,zj-o,true],[xi-rw,zj+o,true],[xi-o,zj+rw,false],[xi+o,zj-rw,false]].forEach(v=>{const a=this.P(v[0],0,v[1]),b=this.P(v[0],.035,v[1]);
    if(a[0]<-20||a[0]>this.PW+20||a[1]<-20||a[1]>this.PH+20)return;
    c.strokeStyle='rgba(110,170,145,.55)';c.lineWidth=m;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
    const col=SC[st(v[2])];c.fillStyle=col+'.28)';c.beginPath();c.arc(b[0],b[1],4.5*m,0,6.2832);c.fill();c.fillStyle=col+'1)';c.beginPath();c.arc(b[0],b[1],1.8*m,0,6.2832);c.fill()})}
  const SP=CAR_SP,cars=W.cars||[];
  if(this.csd!==cars){this.settleCars(cars);this.csd=cars}
  const lanes=new Map(),lim=new Map(),bk=new Map(),ldr=new Map(),occ=new Map();
  for(const q of cars){const k=(q.ax?1:0)+'|'+q.k+'|'+q.lane;let a=lanes.get(k);if(!a)lanes.set(k,a=[]);a.push(q)}
  for(const a of lanes.values()){const n=a.length;if(n<2)continue;a.sort((p,r)=>p.s-r.s);for(let i=0;i<n;i++){const q=a[i],l=a[(i+1)%n],ds=((l.s-q.s)%1+1)%1*2*E;const bg=ds-(SP[q.ty][0]+SP[l.ty][0])/2;lim.set(q,Math.max(0,(bg-CAR_MG)/.35));bk.set(l,bg);ldr.set(q,[l,ds])}}
  const sg=ty=>Math.max(S*.2,S*.15+SP[ty][0]/2+.004);
  for(const q of cars){const dr=q.lane>0?1:-1,tt=dr>0?-E+q.s*2*E:E-q.s*2*E,j=Math.round(tt/S+4.5);if(j<0||j>9)continue;const u=(tt-IC[j])*dr;if(u>-(sg(q.ty)-.012)&&u<S*.15+SP[q.ty][0]/2){const key=(q.ax?q.k:j)*10+(q.ax?j:q.k),o=occ.get(key)||[0,0];o[q.ax?0:1]++;occ.set(key,o)}}
  for(const q of cars){
   let dir=q.lane>0?1:-1,t=dir>0?-E+q.s*2*E:E-q.s*2*E,v=q.v,gap=9,mi=-1;
   for(let m=0;m<10;m++){const gp=(IC[m]-t)*dir;if(gp>.001&&gp<gap){gap=gp;mi=m}}
   const lv=lim.get(q);if(lv!==undefined&&lv<v)v=lv;
   const sq=sg(q.ty);
   if(gap>sq-.012&&gap<sq+.16){
    const o=mi>=0?occ.get((q.ax?q.k:mi)*10+(q.ax?mi:q.k)):null,ld=ldr.get(q);
    const ob=!!(o&&o[q.ax?1:0]>0),xb=!!ld&&ld[1]>gap&&ld[1]-gap<S*.15+SP[q.ty][0]+CAR_MG+SP[ld[0].ty][0]/2&&(ld[0].vc??1)<.08;
    q.w=(ob||xb)?(q.w||0)+dt:0;
    if(st(q.ax)!==0||((ob||xb)&&q.w<10))v*=Math.max(0,Math.min(1,(gap-sq)/.12))
   }else q.w=0;
   q.vc=v;
   q.s=(q.s+v*dt/(2*E))%1;t=dir>0?-E+q.s*2*E:E-q.s*2*E;
   if(q.pt!=null&&Math.abs(t-q.pt)<.2)for(const ic of IC){if((q.pt-ic)*(t-ic)<0&&SP[q.ty][0]<=.042&&Math.random()<.25){
    const bo=occ.get((q.ax?q.k:IC.indexOf(ic))*10+(q.ax?IC.indexOf(ic):q.k));if((bo?bo[0]+bo[1]:0)>1||(bk.get(q)??9)<.05)break;
    const oc=(q.k-4.5)*S+q.lane*S*.075,nk=IC.indexOf(ic),nl=Math.random()<.5?-1:1;
    if(!this.laneFree(lanes,!q.ax,nk,nl,oc,SP[q.ty][0],E))break;
    const ox=q.ax?oc:t,oz=q.ax?t:oc;q.k=nk;q.ax=!q.ax;q.lane=nl;dir=q.lane;t=oc;
    q.s=Math.max(0,Math.min(.999,dir>0?(t+E)/(2*E):(E-t)/(2*E)));const nc=(q.k-4.5)*S+q.lane*S*.075;q.rx=ox-(q.ax?nc:t);q.rz=oz-(q.ax?t:nc);break}}
   q.pt=t;dir=q.lane>0?1:-1;const c0=(q.k-4.5)*S+q.lane*S*.075;q.rx=(q.rx||0)*Math.exp(-dt*5);q.rz=(q.rz||0)*Math.exp(-dt*5);
   const x=(q.ax?c0:t)+q.rx,z=(q.ax?t:c0)+q.rz,h0=q.ax?dir*Math.PI/2:(dir>0?0:Math.PI);
   if(q.hd==null)q.hd=h0;else{let d=h0-q.hd;d=Math.atan2(Math.sin(d),Math.cos(d));q.hd+=d*Math.min(1,dt*8)}
   const y=W.river(x,z)?.016:.006,p=this.P(x,y,z);list.push({q,x,y,z,h:q.hd,al:Math.min(1,(E-Math.abs(t))/.12),d:p[2]})}
  list.sort((a,b)=>a.d-b.d);for(const o of list)if(o.al>0)this.car(c,o.q,o.x,o.y,o.z,o.h,o.al,T,SP[o.q.ty])},
 settleCars(cars){
  const E=1.25,S=World.S,L=new Map(),IC=[];
  for(let i=0;i<10;i++)IC.push((i-4.5)*S);
  for(const q of cars){const k=(q.ax?1:0)+'|'+q.k+'|'+q.lane;let a=L.get(k);if(!a)L.set(k,a=[]);a.push(q)}
  const drop=q=>{const i=cars.indexOf(q);if(i>=0)cars.splice(i,1)};
  for(const a of L.values()){
   a.sort((p,r)=>p.s-r.s);
   const dir=a[0].lane>0?1:-1,zones=IC.map(c=>dir>0?c+E:E-c),keep=[];
   let prev=null;
   for(const q of a){
    const len=CAR_SP[q.ty][0],r=S*.15+len/2+.012;let p=q.s*2*E;
    if(prev){const need=(len+CAR_SP[prev.q.ty][0])/2+CAR_MG;if(p<prev.p+need)p=prev.p+need}
    for(let it=0;it<24;it++){let mv=false;for(const z of zones)if(Math.abs(p-z)<r){p=z+r;mv=true}if(!mv)break}
    if(p>2*E-.05){drop(q);continue}
    q.s=p/(2*E);prev={q,p};keep.push({q,p})
   }
   while(keep.length>1){
    const f=keep[0],l=keep[keep.length-1];
    if(f.p+2*E-l.p>=(CAR_SP[f.q.ty][0]+CAR_SP[l.q.ty][0])/2+CAR_MG)break;
    drop(keep.pop().q)
   }
  }
 },
 laneFree(lanes,ax,k,lane,pos,len,E){
  const a=lanes.get((ax?1:0)+'|'+k+'|'+lane);if(!a)return true;const d=lane>0?1:-1;
  for(const r of a){const tt=d>0?-E+r.s*2*E:E-r.s*2*E;if(Math.abs(tt-pos)<(len+CAR_SP[r.ty][0])/2+CAR_MG+.012)return false}
  return true
 },
 car(c,q,x,y,z,h,al,T,sp){const m=this.DPR,ch=Math.cos(h),sh=Math.sin(h),L=sp[0],W=sp[1],H=sp[2],r=q.col[0],g=q.col[1],b=q.col[2],ty=q.ty;
  const pt=(u,v,dy)=>this.P(x+ch*u-sh*v,y+dy,z+sh*u+ch*v);
  const poly=(a,dy,f)=>{c.beginPath();a.forEach((p,i)=>{const o=pt(p[0],p[1],dy);i?c.lineTo(o[0],o[1]):c.moveTo(o[0],o[1])});c.closePath();c.fillStyle=f;c.fill()};
  const rg=k=>'rgba('+(r*k|0)+','+(g*k|0)+','+(b*k|0)+','+al+')',dk='rgba(14,24,34,'+.92*al+')',lt=(u,v,dy,col,rr)=>{const o=pt(u,v,dy);c.fillStyle=col;c.beginPath();c.arc(o[0],o[1],rr*m,0,6.2832);c.fill()};
  const body=[[L/2,W*.34],[L*.4,W/2],[-L/2,W/2],[-L/2,-W/2],[L*.4,-W/2],[L/2,-W*.34]];
  poly([[L/2,W*.3],[L/2+L*1.3,W*.75],[L/2+L*1.3,-W*.75],[L/2,-W*.3]],0,'rgba(255,240,170,'+.07*al+')');
  if(ty==='truck'){const cg=[[-L/2,W/2],[L*.08,W/2],[L*.08,-W/2],[-L/2,-W/2]],cb=[[L/2,W*.38],[L*.38,W*.48],[L*.14,W*.48],[L*.14,-W*.48],[L*.38,-W*.48],[L/2,-W*.38]];
   poly(cg,0,'rgba(90,96,106,'+al+')');poly(cg,H*.55,'rgba(205,210,216,'+al+')');poly(cg,H*1.05,'rgba(238,242,246,'+al+')');
   poly(cb,0,rg(.5));poly(cb,H*.5,rg(1));poly([[L*.4,W*.36],[L*.32,W*.4],[L*.32,-W*.4],[L*.4,-W*.36]],H*.6,dk)}
  else if(ty==='bus'){poly(body,0,rg(.5));poly(body,H*.55,rg(1));poly(body.map(v=>[v[0]*.94,v[1]*.8]),H*1.05,'rgba(232,246,250,'+al+')');
   c.strokeStyle='rgba(170,235,255,'+al+')';c.lineWidth=1.3*m;[1,-1].forEach(s=>{const a=pt(L*.4,s*W/2,H*.62),d=pt(-L*.4,s*W/2,H*.62);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.stroke()})}
  else if(ty==='moto'){poly([[L/2,W*.4],[-L/2,W*.4],[-L/2,-W*.4],[L/2,-W*.4]],H*.4,rg(1));lt(-L*.05,0,H*1.5,dk,1.7*m);lt(-L*.05,0,H*1.7,rg(1.1),1.2*m)}
  else{poly(body,0,rg(.45));poly(body,H*.5,rg(1));const vn=ty==='van',cab=vn?[[L*.3,W*.42],[-L*.42,W*.42],[-L*.42,-W*.42],[L*.3,-W*.42]]:[[L*.18,W*.4],[-L*.3,W*.4],[-L*.3,-W*.4],[L*.18,-W*.4]];
   poly(cab,H*(ty==='suv'?1.2:1),rg(1.25));const fx=vn?L*.3:L*.18;poly([[fx+L*.1,W*.37],[fx,W*.4],[fx,-W*.4],[fx+L*.1,-W*.37]],H*.75,dk);
   if(ty==='taxi')lt(0,0,H*1.5,'rgba(255,255,200,'+al+')',1.5*m);
   if(ty==='emg'){const f=Math.floor(T*6)%2;lt(0,W*.2,H*1.4,f?'rgba(255,40,50,'+al+')':'rgba(60,120,255,'+al+')',2*m);lt(0,-W*.2,H*1.4,f?'rgba(60,120,255,'+al+')':'rgba(255,40,50,'+al+')',2*m)}}
  if(ty==='moto'){lt(L/2,0,H*.4,'rgba(255,248,210,'+al+')',1.3*m);return}
  [1,-1].forEach(s=>{lt(L/2-.001,s*W*.3,H*.3,'rgba(255,248,210,'+al+')',1.3*m);lt(-L/2,s*W*.3,H*.3,'rgba(255,40,50,'+al+')',1.1*m)})},
 drawTrains(c,T){const W=World,m=this.DPR,dt=Math.min(.1,Math.max(0,T-(this.ct2||T))),list=[],DS=.078,P=8.52;this.ct2=T;
  const loop=s=>{let d=((s%1)+1)%1*P;if(d<2.3)return[-1.15+d,-.98,0];d-=2.3;if(d<1.96)return[1.15,-.98+d,Math.PI/2];d-=1.96;if(d<2.3)return[1.15-d,.98,Math.PI];d-=2.3;return[-1.15,.98-d,-Math.PI/2]};
  const push=(p,col,al,hd,tl)=>list.push({x:p[0],z:p[1],h:p[2],col,al,head:hd,tail:tl,d:this.P(p[0],.012,p[1])[2]});
  for(const t of W.trains||[]){
   if(t.k==='row'){t.s+=t.v*dt/2.3;if(t.s>1.25+t.n*DS/2.3)t.s=-.25;
    for(let i=0;i<t.n;i++){const si=t.s-i*DS/2.3;if(si<0||si>1)continue;push([-1.15+(t.dr>0?si:1-si)*2.3,t.zt,t.dr>0?0:Math.PI],t.col,Math.min(1,si*12,(1-si)*12),i===0,i===t.n-1)}}
   else{t.s=(t.s+t.v*dt/P)%1;for(let i=0;i<t.n;i++)push(loop(t.s-i*DS/P),t.col,1,i===0,i===t.n-1)}}
  State.flights=State.flights.filter(f=>T-f.t<7.2);
  const hx=(f,a)=>f.x+Math.max(3,f.nc||5)*DS/2+.09*a*a,fa=a=>a>5.5?(7.2-a)/1.7:1;
  for(const f of State.flights){const a=T-f.t,n=Math.max(3,f.nc||5);for(let i=0;i<n;i++)push([hx(f,a)-i*DS,f.z+.07,0],[235,255,245],fa(a),i===0,i===n-1)}
  list.sort((a,b)=>a.d-b.d);for(const o of list)if(o.al>0)this.railcar(c,o);
  for(const f of State.flights){const a=T-f.t,q=this.P(hx(f,a),.07,f.z+.07);c.fillStyle='rgba(0,255,102,'+fa(a)+')';c.font=(10*m)+'px JetBrains Mono,monospace';c.fillText('\u25B6 '+f.n+' \u00b7 '+L('DEPARTS'),q[0]+8*m,q[1]-6*m)}},
 railcar(c,o){const m=this.DPR,L=.07,W=.026,H=.02,al=o.al,ch=Math.cos(o.h),sh=Math.sin(o.h),r=o.col[0],g=o.col[1],b=o.col[2];
  const pt=(u,v,dy)=>this.P(o.x+ch*u-sh*v,.012+dy,o.z+sh*u+ch*v);
  const poly=(a,dy,f)=>{c.beginPath();a.forEach((p,i)=>{const q=pt(p[0],p[1],dy);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.closePath();c.fillStyle=f;c.fill()};
  const rg=k=>'rgba('+(r*k|0)+','+(g*k|0)+','+(b*k|0)+','+al+')',dot=(u,v,dy,col,rr)=>{const q=pt(u,v,dy);c.fillStyle=col;c.beginPath();c.arc(q[0],q[1],rr*m,0,6.2832);c.fill()};
  const body=[[L/2,W*.4],[L*.46,W/2],[-L*.46,W/2],[-L/2,W*.4],[-L/2,-W*.4],[-L*.46,-W/2],[L*.46,-W/2],[L/2,-W*.4]];
  poly(body,0,rg(.4));poly(body,H*.5,rg(.9));poly(body.map(v=>[v[0]*.92,v[1]*.8]),H,'rgba(225,235,240,'+al+')');
  c.strokeStyle='rgba(150,225,255,'+al+')';c.lineWidth=1.4*m;[1,-1].forEach(s=>{const a=pt(L*.4,s*W/2,H*.62),d=pt(-L*.4,s*W/2,H*.62);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.stroke()});
  [.2,-.2].forEach(u=>poly([[L*u+.006,W*.2],[L*u-.006,W*.2],[L*u-.006,-W*.2],[L*u+.006,-W*.2]],H*1.15,'rgba(150,160,170,'+al+')'));
  if(o.head){poly([[L/2,W*.34],[L*.4,W*.38],[L*.4,-W*.38],[L/2,-W*.34]],H*.7,'rgba(14,24,34,'+.92*al+')');[1,-1].forEach(s=>dot(L/2,s*W*.3,H*.3,'rgba(255,250,215,'+al+')',1.6))}
  if(o.tail)[1,-1].forEach(s=>dot(-L/2,s*W*.3,H*.3,'rgba(255,50,60,'+al+')',1.4))},
 jet(c,p,h,pi,al,T){const m=this.DPR,ch=Math.cos(h),sh=Math.sin(h),cp=Math.cos(pi),sp=Math.sin(pi),L=.17;
  const pt=(u,v,dy)=>this.P(p[0]+ch*u*cp-sh*v,p[1]+dy+u*sp,p[2]+sh*u*cp+ch*v);
  const poly=(a,dy,fill,st)=>{c.beginPath();a.forEach((v,i)=>{const r=pt(v[0],v[1],v[2]!=null?v[2]:dy);i?c.lineTo(r[0],r[1]):c.moveTo(r[0],r[1])});c.closePath();c.fillStyle=fill;c.fill();if(st){c.strokeStyle=st;c.stroke()}};
  const W=[[.06,.02],[-.04,.02],[-.115,.2],[-.075,.2]],mi=a=>a.map(v=>[v[0],-v[1]]),TP=[[-.14,.012],[-.165,.012],[-.185,.075],[-.165,.075]];
  const FU=[[L,0],[L*.82,.024],[-L*.7,.022],[-L,.008],[-L,-.008],[-L*.7,-.022],[L*.82,-.024]],st='rgba(0,255,102,'+.85*al+')',wc='rgba(125,195,165,'+al+')';
  c.lineWidth=1.1*m;
  if(p[1]<.06){const g=c.createLinearGradient(...pt(L,0,0),...pt(L+.5,0,0));g.addColorStop(0,'rgba(255,240,170,'+.35*al+')');g.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=g;c.beginPath();[[L,0],[L+.5,.16],[L+.5,-.16]].forEach((v,i)=>{const r=pt(v[0],v[1],0);i?c.lineTo(r[0],r[1]):c.moveTo(r[0],r[1])});c.fill()}
  if(p[1]>.04){c.fillStyle='rgba(0,0,0,'+.35*al+')';poly(FU,-p[1],'rgba(0,0,0,'+.3*al+')');poly(W,-p[1],'rgba(0,0,0,'+.25*al+')');poly(mi(W),-p[1],'rgba(0,0,0,'+.25*al+')')}
  c.shadowColor='#00ff66';c.shadowBlur=8*m;
  poly(FU,0,'rgba(35,100,72,'+al+')');poly(W,.012,wc,st);poly(mi(W),.012,wc,st);poly(TP,.03,wc,st);poly(mi(TP),.03,wc,st);
  [1,-1].forEach(s=>poly([[.04,s*.058],[-.025,s*.058],[-.025,s*.09],[.04,s*.09]],.004,'rgba(80,140,115,'+al+')',st));
  poly(FU,.028,'rgba(236,255,246,'+al+')',st);
  poly([[L*.92,.012],[L*.7,.02],[L*.7,-.02],[L*.92,-.012]],.031,'rgba(0,205,255,'+al+')');
  poly([[-.11,0,.03],[-.165,0,.03],[-.175,0,.105],[-.15,0,.105]],0,'rgba(0,255,102,'+al+')');
  c.shadowBlur=0;
  const lt=(u,v,dy,col,r)=>{const q=pt(u,v,dy);c.fillStyle=col;c.beginPath();c.arc(q[0],q[1],r*m,0,6.2832);c.fill()};
  lt(-.095,.2,.012,'rgba(255,50,70,'+al+')',2.4);lt(-.095,-.2,.012,'rgba(0,255,110,'+al+')',2.4);if(Math.sin(T*9)>.5)lt(-L,0,.04,'rgba(255,255,255,'+al+')',3)},
 hud(){
  const c=this.ctx,m=this.DPR,T=State.time,B=1.3;
  c.lineWidth=m;c.strokeStyle='rgba(0,255,102,.75)';
  [[-B,-B],[B,-B],[B,B],[-B,B]].forEach(([cx,cz])=>{const sx=cx<0?1:-1,sz=cz<0?1:-1,a=this.P(cx,0,cz),b=this.P(cx+sx*.22,0,cz),d=this.P(cx,0,cz+sz*.22);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.stroke()});
  c.setLineDash([6*m,10*m]);c.lineDashOffset=-T*14*m;c.strokeStyle='rgba(0,255,102,.28)';c.beginPath();
  for(let k=0;k<=100;k++){const a=k/100*6.2832,q=this.P(Math.cos(a)*1.78,0,Math.sin(a)*1.78);k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}
  c.stroke();c.setLineDash([]);
  if(World.mode==='city'&&State.showTraffic)this.drawCars(c,T);
  if(World.mode==='metro'&&State.showTraffic)this.drawTrains(c,T);
  if(World.mode==='airport'){State.flights=State.flights.filter(f=>T-f.t<12.6);
   for(const f of State.flights){const a=T-f.t,K=[[0,f.x,.02,f.z],[1.8,f.x,.02,-.38],[3,-1,.02,-.72],[6.5,.5,.02,-.72],[9.5,1.6,.55,-.72],[12.5,2.5,1.5,-.9]];
    const pos=t=>{t=Math.max(0,Math.min(12.5,t));let i=0;while(i<4&&K[i+1][0]<t)i++;const A=K[i],B=K[i+1];let u=(t-A[0])/(B[0]-A[0]);if(i===2)u=u*u;return[A[1]+(B[1]-A[1])*u,A[2]+(B[2]-A[2])*u,A[3]+(B[3]-A[3])*u]};
    const p=pos(a),q=pos(a+.4),r0=pos(a-.4);State.fp=p;const h=Math.atan2(q[2]-r0[2],q[0]-r0[0]),al=a>10.5?(12.5-a)/2:1,pi=a<6.3?0:Math.min(.32,(a-6.3)*.12);
    for(let k=16;k>=1;k--){const w=pos(a-k*.1);if(w[1]<.12)continue;const s=this.P(w[0],w[1],w[2]);c.fillStyle='rgba(220,245,255,'+(.3*(1-k/17)*al)+')';c.beginPath();c.arc(s[0],s[1],(2+k*.6)*m,0,6.2832);c.fill()}
    this.jet(c,p,h,pi,al,T);
    const hd=this.P(p[0],p[1]+.12,p[2]);c.fillStyle='rgba(0,255,102,'+al+')';c.font=(10*m)+'px JetBrains Mono,monospace';c.fillText('\u2708 '+f.n+' \u00b7 '+L('TAKE OFF'),hd[0]+8*m,hd[1])}}
  const b=World.byId.get(State.selected);
  if(b){
   const x0=b.cx-b.bw,x1=b.cx+b.bw,z0=b.cz-b.bd,z1=b.cz+b.bd,ya=b.y0,h=(b.top-b.y0)*1.02,co=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
   c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=1.4*m;
   const lo=co.map(p=>this.P(p[0],ya,p[1])),hi=co.map(p=>this.P(p[0],ya+h,p[1]));
   c.beginPath();for(let i=0;i<4;i++){const j=(i+1)%4;c.moveTo(lo[i][0],lo[i][1]);c.lineTo(lo[j][0],lo[j][1]);c.moveTo(hi[i][0],hi[i][1]);c.lineTo(hi[j][0],hi[j][1]);c.moveTo(lo[i][0],lo[i][1]);c.lineTo(hi[i][0],hi[i][1])}c.stroke();
  }
  for(const p of State.pulses){const pb=World.byId.get(p.id);if(!pb)continue;const q=this.P(pb.cx,pb.y0+.02,pb.cz),age=T-p.t;if(age>=0&&age<1){c.strokeStyle='rgba(255,255,255,'+(1-age)+')';c.lineWidth=1.4*m;c.beginPath();c.arc(q[0],q[1],8*m+age*50*m,0,Math.PI*2);c.stroke()}}
  World.buildings.forEach(bb=>{if(!bb.alert)return;const q=this.P(bb.cx,bb.top+.08,bb.cz),on=Math.sin(T*7)>0;c.fillStyle=on?'#ff3a5c':'rgba(255,58,92,.15)';c.beginPath();c.arc(q[0],q[1],3*m,0,Math.PI*2);c.fill()});
 }
};
