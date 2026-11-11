import{useSyncExternalStore}from'react'
import{CONFIG,U,State,UI,Viz}from'../engine/core.js'
import{I18,L}from'../engine/i18n.js'
import{Data}from'../engine/store.js'
import{World}from'../engine/world.js'
import{R}from'../engine/renderer.js'
import{API}from'../engine/api.js'
import{Cine}from'../engine/runtime.js'
import{notify}from'./status.js'

export const t=L

const subs=new Set()
let cur={stats:0,list:0,card:0,legend:0,sync:0,log:0,viz:0,lang:0}
const subscribe=f=>{subs.add(f);return()=>subs.delete(f)}
export const bump=(...keys)=>{cur={...cur};for(const k of keys)cur[k]++;subs.forEach(f=>f())}
export const useTick=k=>useSyncExternalStore(subscribe,()=>cur[k])
export const useBridge=(...keys)=>{keys.forEach(useTick)}

export const logs={items:[],n:0}
export const pushLog=(msg,cls,id)=>{logs.n++;logs.items=[...logs.items,{k:logs.n,ts:new Date().toTimeString().slice(0,8),msg:String(msg),cls:cls||'',id}].slice(-80);bump('log');if(logs.n>1||cls)notify(msg,cls==='c'?'error':cls==='w'?'warning':'success')}

export const Search={value:'',focus(){}}
export const setSearch=v=>{Search.value=v;bump('list')}

export const listItems=()=>{
 const q=(Search.value||'').trim().toLowerCase(),key=State.layer==='true'?null:State.layer
 let arr=World.buildings.slice().sort((a,b)=>key?(key==='progress'?a.metric[key]-b.metric[key]:b.metric[key]-a.metric[key]):(a.next??1e9)-(b.next??1e9))
 if(q)arr=arr.filter(b=>(b.p.name+' '+b.p.group).toLowerCase().includes(q))
 return{arr:arr.slice(0,q?60:14),key}
}

export const toggleAuto=()=>{State.auto=!State.auto;bump('sync')}
export const toggleTraffic=()=>{State.showTraffic=!State.showTraffic;bump('sync')}
export const toggleCine=()=>Cine.toggle()
export const setLang=v=>{I18.setLang(v);document.documentElement.lang=I18.cur;bump('lang');UI.refreshAll();Viz.draw()}

export const installBridge=()=>{
 UI.log=pushLog
 UI.refreshAll=(card=true)=>{bump('stats','list','legend','sync');if(card)bump('card');Viz.draw()}
 UI.card=()=>bump('card')
 UI.list=()=>bump('list')
 UI.stats=()=>bump('stats')
 UI.sync=()=>bump('sync')
}

export const vizOut={hT:'',hR:null,mR:null}
const out={hT:'',hR:null,mR:null}
let outKey=''
const commitViz=()=>{const k=JSON.stringify(out);if(k!==outKey){outKey=k;Object.assign(vizOut,out);bump('viz')}}

Object.assign(Viz,{rows:[],DAYS:40,LW:62,
 init(hc,mc){this.hc=hc;this.mc=mc;const dpr=Math.min(devicePixelRatio||1,2);
  this.hc.width=200*dpr;this.hc.height=50*dpr;this.mc.width=244*dpr;this.mc.height=96*dpr;this.hc.getContext('2d').scale(dpr,dpr);this.mc.getContext('2d').scale(dpr,dpr);
  this.hc.onclick=e=>{const r=this.hc.getBoundingClientRect(),bin=Math.min(39,Math.max(0,Math.floor((e.clientX-r.left)/r.width*40))),key=State.layer==='true'?'urgency':State.layer,
   hit=World.buildings.filter(b=>Math.min(39,Math.floor(b.metric[key]*40))===bin).sort((a,z)=>z.open-a.open)[0];if(hit)API.select(hit.p.id)};
  this.mc.onclick=e=>{const r=this.mc.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,row=Math.floor(y/12),g=this.rows[row];if(!g)return;
   if(x<this.LW){setSearch(Search.value.toLowerCase()===g.toLowerCase()?'':g);return}
   const day=Math.floor((x-this.LW)/((244-this.LW)/this.DAYS)),hit=World.buildings.find(b=>b.p.group===g&&b.order.some(t=>!t.done&&t.due&&Math.max(0,Data.days(t.due))===day));if(hit)API.select(hit.p.id)}},
 draw(){if(!this.hc)return;
  const key=State.layer==='true'?'urgency':State.layer,B=World.buildings,sel=World.byId.get(State.selected),bins=new Array(40).fill(0);let sum=0,peak=0;
  B.forEach(b=>{const v=b.metric?b.metric[key]||0:0;bins[Math.min(39,Math.floor(v*40))]++;sum+=v;peak=Math.max(peak,v)});
  const h=this.hc.getContext('2d');h.clearRect(0,0,200,50);const top=Math.max(1,...bins),sb=sel&&sel.metric?Math.min(39,Math.floor(sel.metric[key]*40)):-1,warn=key==='urgency'||key==='risk';
  bins.forEach((n,i)=>{const bh=n?Math.max(2,n/top*48):0;h.fillStyle=i===sb?'#fff':warn&&(i+.5)/40>=State.threshold?'#ff3a5c':'rgba(0,220,100,.85)';h.fillRect(i*5,50-bh,4,bh)});
  const kl=CONFIG.layers.find(x=>x[0]===State.layer);out.hT=L('DISTRIBUTION')+' · '+L(State.layer==='true'?'URGENCY':kl[1]);
  out.hR={peak:Math.round(peak*100),avg:Math.round((B.length?sum/B.length:0)*100),alerts:Data.count(),n:B.length};
  const m=this.mc.getContext('2d'),cw=(244-this.LW)/this.DAYS,rows=this.rows=[...new Set(B.map(b=>b.p.group))].sort().slice(0,6),cnt={},tot=new Array(this.DAYS).fill(0),over={};
  rows.forEach(g=>cnt[g]=new Array(this.DAYS).fill(0));
  B.forEach(b=>{if(!cnt[b.p.group])return;b.p.tasks.forEach(t=>{if(t.done||!t.due)return;const d=Data.days(t.due),c=Math.max(0,d);if(c<this.DAYS){cnt[b.p.group][c]++;tot[c]++;if(d<0)over[b.p.group+'|'+c]=1}})});
  m.clearRect(0,0,244,96);m.font='8px JetBrains Mono,monospace';m.textBaseline='middle';
  const sw=Math.floor((State.time*6)%this.DAYS),soon=Math.floor(CONFIG.urgencyWindowDays*(1-State.threshold));
  rows.forEach((g,r)=>{m.fillStyle=sel&&sel.p.group===g?'#fff':'#2f8a58';m.fillText(g.slice(0,9),0,r*12+6);
   for(let c=0;c<this.DAYS;c++){const n=cnt[g][c];m.fillStyle=!n?'rgba(0,255,102,.05)':over[g+'|'+c]?'#ff3a5c':c<=soon?'#ffd84a':'rgba(0,220,100,.58)';m.fillRect(this.LW+c*cw,r*12+1,cw-1,10)}});
  m.fillStyle='rgba(0,255,102,.16)';m.fillRect(this.LW+sw*cw,0,cw-1,rows.length*12);
  const mx=Math.max(1,...tot);tot.forEach((n,c)=>{m.fillStyle=n?(c<=soon?'#ffd84a':'rgba(0,220,100,.8)'):'rgba(0,255,102,.2)';m.fillRect(this.LW+c*cw,96-(n?Math.max(2,n/mx*18):1),cw-1,n?Math.max(2,n/mx*18):1)});
  m.fillStyle='#2f8a58';m.fillText('TASK/DAY',0,88);
  const nb=B.slice().sort((a,z)=>(a.next??1e9)-(z.next??1e9))[0];
  out.mR={next:nb?nb.p.name.slice(0,12)+' '+Data.when(nb.next):'-',over:B.reduce((s,b)=>s+(b.over||0),0)};commitViz()}
});

export const Picker={down:[0,0],moved:false,
 nearest(x,y){if(World.mode==='globe'){let sat='',sd=1e9;for(const q of R.satScr){const d=Math.hypot(q.x-x,q.y-y);if(d<sd&&d<28*R.DPR){sd=d;sat=q.id}}if(sat)return sat}let best='',score=1e9;World.buildings.forEach(b=>{const q=R.scr[b.index];if(!q)return;const dist=Math.hypot(q[0]-x,q[1]-y),reach=(14+b.h*40)*R.DPR;if(dist<reach){const s=dist-q[2]*10;if(s<score){score=s;best=b.p.id}}});return best},
 init(c,tip){const off=[],on=(n,f,o)=>{c.addEventListener(n,f,o);off.push(()=>c.removeEventListener(n,f,o))};
  on('pointerdown',e=>{Cine.stop();this.down=[e.clientX,e.clientY];this.moved=false;State.dragging=true;State.lx=e.clientX;State.ly=e.clientY;c.setPointerCapture(e.pointerId)});
  on('pointerup',e=>{State.dragging=false;if(!this.moved){const r=c.getBoundingClientRect();API.select(this.nearest((e.clientX-r.left)*R.DPR,(e.clientY-r.top)*R.DPR))}});
  on('pointermove',e=>{const r=c.getBoundingClientRect();
   if(State.dragging){if(Math.abs(e.clientX-this.down[0])+Math.abs(e.clientY-this.down[1])>4)this.moved=true;
    State.rotY+=(e.clientX-State.lx)*.008;State.rotX=U.cl(State.rotX+(e.clientY-State.ly)*.0045,.1,1.45);State.vy=(e.clientX-State.lx)*.0006;State.lx=e.clientX;State.ly=e.clientY;State.hover='';tip.style.display='none';return}
   const id=this.nearest((e.clientX-r.left)*R.DPR,(e.clientY-r.top)*R.DPR);State.hover=id;const b=World.byId.get(id);
   if(b){tip.style.display='block';tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top-8)+'px';tip.textContent=b.p.name+' · '+b.p.group+' · '+b.p.tasks.length+' task · '+Data.when(b.next)}else tip.style.display='none'});
  on('pointerleave',()=>{State.hover='';tip.style.display='none'});
  on('wheel',e=>{e.preventDefault();Cine.stop();State.zoom=U.cl(State.zoom-e.deltaY*.001,.5,2.4)},{passive:false});return()=>off.forEach(f=>f())}
};
