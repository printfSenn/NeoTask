import fs from 'node:fs'
import vm from 'node:vm'
import crypto from 'node:crypto'
import path from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const htmlPath=process.env.PARITY_HTML||path.join(here,'reference/neotask.html')
const engineDir=process.env.PARITY_ENGINE||path.join(here,'../src/engine')

const mulberry=seed=>{let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const sha=(...parts)=>{const h=crypto.createHash('sha1');for(const p of parts){if(ArrayBuffer.isView(p))h.update(Buffer.from(p.buffer,p.byteOffset,p.byteLength));else h.update(typeof p==='string'?p:JSON.stringify(p))}return h.digest('hex').slice(0,10)}

const arg=v=>typeof v==='number'||typeof v==='string'||typeof v==='boolean'?v:typeof v
const ctxStub=calls=>{
 const own={createImageData:(pw,ph)=>({data:new Uint8ClampedArray(pw*ph*4)})}
 const fn=function(){return p}
 const p=new Proxy(fn,{
  get:(t,k)=>{if(k in own)return own[k];if(k===Symbol.toPrimitive)return()=>0;if(typeof k==='symbol')return undefined;return(...a)=>{calls.push([k,...a.map(arg)]);return p}},
  set:(t,k,v)=>{calls.push(['=',k,arg(v)]);return true},
  apply:()=>p
 })
 return p
}
const canvasStub=(w,h,calls)=>({width:300,height:150,clientWidth:w,clientHeight:h,getContext:()=>ctxStub(calls)})
const makeEnvGlobals=()=>{
 const mem=new Map(),calls=[],cv=canvasStub(960,600,calls)
 return{cv,calls,globals:{
  localStorage:{getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))},
  document:{getElementById:id=>id==='cv'?cv:null,createElement:()=>canvasStub(0,0,calls),documentElement:{},body:{}},
  devicePixelRatio:1,
  window:{},
  performance:{now:()=>100000}
 }}
}

const loadOld=async()=>{
 const html=fs.readFileSync(htmlPath,'utf8').split('\n')
 const a=html.findIndex(l=>l.includes("'use strict';")),b=html.findIndex(l=>l.includes('---------- BOOT ----------'))
 const code=html.slice(a,b).join('\n')+'\n;({CONFIG,State,Store,World,Data,U,I18,L,R,UI})'
 const {cv,calls,globals}=makeEnvGlobals()
 const ctx=vm.createContext({...globals,console,Intl,__rand:null})
 const env=vm.runInContext(code,ctx)
 vm.runInContext('Math.random=()=>__rand()',ctx)
 env.UI.log=()=>{}
 env.setRandom=fn=>{ctx.__rand=fn}
 env.initCanvas=()=>env.R.init()
 env.calls=calls
 return env
}

const loadNew=async()=>{
 const {cv,calls,globals}=makeEnvGlobals()
 for(const k of Object.keys(globals))Object.defineProperty(globalThis,k,{value:globals[k],configurable:true,writable:true})
 const u=f=>import(pathToFileURL(path.join(engineDir,f)).href)
 const [core,i18n,store,world,rend]=await Promise.all(['core.js','i18n.js','store.js','world.js','renderer.js'].map(u))
 const env={CONFIG:core.CONFIG,State:core.State,U:core.U,Store:store.Store,Data:store.Data,World:world.World,I18:i18n.I18,L:i18n.L,R:rend.R}
 env.setRandom=fn=>{Math.random=fn}
 env.initCanvas=()=>env.R.init(cv)
 env.calls=calls
 return env
}

const SCENES=['city','satellite','ship','factory','airport','metro']
const LAYERS=['true','progress','urgency','load','risk']

const fixtures=env=>{
 const D=n=>{const d=env.Store.today();d.setDate(d.getDate()+n);return env.Store.fmt(d)}
 const rnd=mulberry(20260711)
 const mk=(count,tag)=>Array.from({length:count},(_,i)=>{
  const nt=Math.floor(rnd()*10),allDone=rnd()<.2
  return{id:tag+i,name:'Proyek '+tag+i,group:['Work','School','Personal','Ops','Lab','Misc','Extra'][Math.floor(rnd()*7)],deadline:rnd()<.85?D(Math.floor(rnd()*50)-8):'',
   tasks:Array.from({length:nt},(_,k)=>({title:'t'+k,due:rnd()<.8?D(Math.floor(rnd()*45)-10):'',done:allDone||rnd()<.4}))}})
 return{
  sample:null,
  empty:[],
  mid:mk(14,'m'),
  big:mk(40,'b')
 }
}

const snap=(env,label)=>{
 const{World,Data,Store,CONFIG}=env
 const B=World.buildings
 return{
  label,
  points:CONFIG.points,
  prims:World.prims.length,
  pos:sha(World.pos),cur:sha(World.cur),attr:sha(World.attr),pid:sha(World.pid),tid:sha(World.tid),bri:sha(World.bri),
  blds:sha(B.map(b=>[b.cx,b.cz,b.y0,b.h,b.top,b.bw,b.bd,b.n,b.type,b.ix,b.iz,b.w,b.d,b.alert,b.complete])),
  data:sha(B.map(b=>[b.open,b.done,b.total,b.next,b.over,b.progress,b.urgency,b.risk,b.load,b.col,b.order.map(t=>t._i)])),
  slots:sha(Store.projects.map(p=>[p.id,p.seed,p.slots])),
  sites:sha(World.sites)
 }
}

const run=async env=>{
 const rows=[]
 const{Store,State,World,Data,R,CONFIG,L,I18}=env
 const fx=fixtures(env)
 env.setRandom(mulberry(1))
 Store.load()
 const sample=Store.capture()
 fx.sample=sample
 for(const name of Object.keys(fx)){
  for(const mode of SCENES){
   env.setRandom(mulberry(7))
   Store.projects=Store.norm(fx[name]);Store.ensureSlots()
   State.scene=mode;State.layer='true';State.threshold=.7
   World.rebuild(true);Data.syncAlerts()
   rows.push(snap(env,name+'/'+mode))
   const extra={}
   extra.cars=State.scene==='city'?sha(World.cars||null):null;extra.trains=sha(World.trains||null)
   extra.movers=sha((World.movers||[]).map(m=>[m.s,m.len,m.sp,m.tr,m.col]))
   rows[rows.length-1].extra=sha(extra)
  }
 }
 for(const layer of LAYERS){
  Store.projects=Store.norm(fx.mid);Store.ensureSlots();State.scene='city';State.layer=layer;World.rebuild(true)
  rows.push({...snap(env,''),label:'layer/'+layer})
 }
 for(const th of [0,.2,.45,1]){
  Store.projects=Store.norm(fx.mid);Store.ensureSlots();State.layer='true';State.threshold=th
  for(const mode of ['city','airport','ship']){State.scene=mode;World.rebuild(true);Data.syncAlerts();rows.push({...snap(env,''),label:'thr'+th+'/'+mode})}
 }
 State.threshold=.7
 {
  env.setRandom(mulberry(99))
  Store.projects=Store.norm(fx.mid);Store.ensureSlots();State.scene='city';World.rebuild(true)
  const order=['ship','metro','satellite','airport','factory','city']
  let T=100000
  for(const mode of order){
   State.scene=mode;World.rebuild(false)
   const h=[]
   for(const dt of [0,150,600,1300,2200]){World.stepMorph(T+dt);h.push(sha(World.cur))}
   T+=5000
   rows.push({label:'morph->'+mode,fin:sha(World.cur),steps:sha(h),moving:World.moving})
  }
 }
 env.initCanvas()
 for(const mode of SCENES){
  env.setRandom(mulberry(31))
  for(const name of ['mid','big']){
   Store.projects=Store.norm(fx[name]);Store.ensureSlots();State.scene=mode;State.layer='true'
   World.rebuild(true);Data.syncAlerts();State.selected=World.buildings.length?World.buildings[Math.floor(World.buildings.length/2)].p.id:''
   State.time=3.7;State.rotY=.65;State.rotX=.15;State.zoom=.95;State.fw=0;State.showTraffic=true
   R.fit()
   const hs=[],dh=[];let nc=0
   for(let f=0;f<3;f++){env.calls.length=0;State.time+=.016;R.render(.016);hs.push(sha(R.buf));dh.push(sha(env.calls));nc+=env.calls.length}
   rows.push({label:'render/'+name+'/'+mode,w:R.PW,h:R.PH,lit:R.buf.reduce((n,v)=>n+(v?1:0),0),frames:sha(hs),draw:sha(dh),ctxCalls:nc,scr:sha(R.scr),flights:State.flights.length})
  }
 }
 const lang=[]
 for(const cur of ['id','en']){I18.cur=cur;for(const k of [...Object.keys(I18.id),...Object.keys(I18.en)])lang.push(cur+'|'+k+'|'+L(k))}
 I18.cur='id'
 rows.push({label:'i18n',n:lang.length,h:sha(lang)})
 return rows
}

const oldEnv=await loadOld()
const oldRows=await run(oldEnv)
const newEnv=await loadNew()
const newRows=await run(newEnv)

let bad=0,expected=0
const EXPECTED=l=>/^(sample|empty|mid|big)\/(city|metro|factory)$/.test(l)||/^layer\//.test(l)||/^thr.*\/city$/.test(l)||/^morph->(factory|city|ship|metro)$/.test(l)||/^render\/(mid|big)\/(city|factory|metro)$/.test(l)
const fmt=r=>Object.entries(r).filter(([k])=>k!=='label').map(([k,v])=>k+'='+v).join(' ')
for(let i=0;i<oldRows.length;i++){
 const a=JSON.stringify(oldRows[i]),b=JSON.stringify(newRows[i]),ok=a===b
 const ex=!ok&&EXPECTED(oldRows[i].label)
 if(ex)expected++
 else if(!ok)bad++
 if(process.env.VERBOSE||(!ok&&!ex)||/^(sample|empty|mid|big)\//.test(oldRows[i].label)&&process.env.SHOW)console.log((ok?'OK  ':ex?'CHG ':'DIFF')+' '+oldRows[i].label.padEnd(22)+' '+(ok?fmt(oldRows[i]):'\n  old '+fmt(oldRows[i])+'\n  new '+fmt(newRows[i])))
}
const kind=l=>/^(sample|empty|mid|big)\//.test(l)?'build':l.startsWith('layer/')?'layer':l.startsWith('thr')?'threshold':l.startsWith('morph')?'morph':l.startsWith('render')?'render':'i18n'
const byKind={}
for(const r of oldRows){const k=kind(r.label);byKind[k]=(byKind[k]||0)+1}
console.log('checks:',oldRows.length,'| groups:',JSON.stringify(byKind))
const pts={};for(const r of oldRows)if(r.points&&kind(r.label)==='build')pts[r.label.split('/')[1]]=r.points
console.log('points per scene (engine lama):',JSON.stringify(pts))
console.log('perubahan yang diharapkan (city, metro, factory):',expected)
console.log(bad?('FAIL: '+bad+' mismatches'):'PASS: selain perubahan yang diharapkan, engine lama == engine baru')
process.exit(bad?1:0)
