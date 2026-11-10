import path from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const engine=process.env.PARITY_ENGINE||path.join(here,'../src/engine')
const SEC=+(process.env.SEC||60)

const mem=new Map()
const ctx=new Proxy(function(){},{get:(t,k)=>k==='createImageData'?(a,b)=>({data:new Uint8ClampedArray(a*b*4)}):k===Symbol.toPrimitive?()=>0:typeof k==='symbol'?undefined:ctx,set:()=>true,apply:()=>ctx})
const cv={width:300,height:150,clientWidth:960,clientHeight:600,getContext:()=>ctx}
Object.assign(globalThis,{localStorage:{getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)},document:{createElement:()=>cv,getElementById:()=>cv},devicePixelRatio:1})
let sd=1
Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296}
const u=f=>import(pathToFileURL(path.join(engine,f)).href)
const [{State},{Store,Data},{World},{R}]=await Promise.all([u('core.js'),u('store.js'),u('world.js'),u('renderer.js')])

const SP={sedan:[.034,.016],suv:[.038,.018],taxi:[.034,.016],van:[.042,.019],truck:[.075,.02],bus:[.085,.021],moto:[.02,.006],emg:[.04,.018]}
const E=1.25
const pose=q=>{const S=World.S,dir=q.lane>0?1:-1,t=dir>0?-E+q.s*2*E:E-q.s*2*E,c0=(q.k-4.5)*S+q.lane*S*.075;return{x:(q.ax?c0:t)+(q.rx||0),z:(q.ax?t:c0)+(q.rz||0),h:q.hd??0,L:SP[q.ty][0],W:SP[q.ty][1],al:Math.min(1,(E-Math.abs(t))/.12)}}
const corners=(x,z,h,L,W)=>{const c=Math.cos(h),s=Math.sin(h);return[[L,W],[L,-W],[-L,-W],[-L,W]].map(([a,b])=>[x+c*a*.5-s*b*.5,z+s*a*.5+c*b*.5])}
const axes=p=>[0,1].map(i=>{const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l]})
const proj=(p,a)=>{let mn=1e9,mx=-1e9;for(const q of p){const d=q[0]*a[0]+q[1]*a[1];mn=Math.min(mn,d);mx=Math.max(mx,d)}return[mn,mx]}
const overlap=(A,B)=>{for(const a of [...axes(A),...axes(B)]){const p=proj(A,a),q=proj(B,a);if(p[1]<=q[0]||q[1]<=p[0])return false}return true}
const rectPoly=(x,z,w,d)=>[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]]

const D=n=>{const d=Store.today();d.setDate(d.getDate()+n);return Store.fmt(d)}
const mk=n=>Array.from({length:n},(_,i)=>({id:'q'+i,name:'P'+i,group:'G',deadline:D(i-3),tasks:Array.from({length:1+i%7},(_,k)=>({title:'t'+k,due:D(k),done:k%3===0}))}))

const orig=World.cumPick
let boxes=null
World.cumPick=function(b,r){if(State.scene==='city')boxes=b;return orig.call(this,b,r)}

let bad=0
const fail=m=>{bad++;console.log('FAIL',m)}
for(const [seed,np] of [[11,3],[22,24]]){
 sd=seed;World.moverKey=''
 Store.load()
 Store.projects=Store.norm(mk(np));Store.ensureSlots()
 State.scene='city';State.showTraffic=true;World.rebuild(true);Data.syncAlerts()
 R.init(cv);R.fit();R.csd=null
 const bl=[]
 for(const b of World.buildings)bl.push({n:'proj',p:rectPoly(b.cx,b.cz,b.bw,b.bd)})
 for(const b of boxes||[])if(b.k===0&&b.y0<.02)bl.push({n:'decor',p:rectPoly(b.x,b.z,b.w,b.d)})
 const dt=.016,frames=Math.round(SEC/dt)
 const m={same:0,cross:0,proj:0,decor:0}
 for(let f=0;f<frames;f++){
  R.drawCars(ctx,f*dt)
  const P=World.cars.map(q=>({q,...pose(q)})).filter(o=>o.al>.15),cp=P.map(o=>corners(o.x,o.z,o.h,o.L,o.W))
  for(let i=0;i<P.length;i++){
   for(let j=i+1;j<P.length;j++){
    if(Math.abs(P[i].x-P[j].x)>.1||Math.abs(P[i].z-P[j].z)>.1)continue
    if(overlap(cp[i],cp[j])){const a=P[i].q,b=P[j].q;m[a.ax===b.ax&&a.k===b.k&&a.lane===b.lane?'same':'cross']++}
   }
   for(const B of bl){if(Math.abs(P[i].x-B.p[0][0])>.4)continue;if(overlap(cp[i],B.p))m[B.n]++}
  }
 }
 console.log('seed',seed,'projects',np,'cars',World.cars.length,JSON.stringify(m),'dalam',SEC,'detik')
 if(World.cars.length<80)fail('mobil terlalu sedikit '+World.cars.length)
 if(m.same)fail('mobil menumpuk di lajur yang sama '+m.same)
 if(m.proj)fail('mobil tembus gedung proyek '+m.proj)
 if(m.decor)fail('mobil tembus gedung dekor '+m.decor)
 if(m.cross>60)fail('tabrakan di persimpangan '+m.cross+' > 60')
}
console.log(bad?'FAIL: '+bad+' masalah':'PASS: mobil city tidak menumpuk dan tidak tembus gedung')
process.exit(bad?1:0)
