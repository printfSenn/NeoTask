import path from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const engine=process.env.PARITY_ENGINE||path.join(here,'../src/engine')
const mem=new Map()
Object.assign(globalThis,{localStorage:{getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)}})
let sd=4242;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296}
const u=f=>import(pathToFileURL(path.join(engine,f)).href)
const [{CONFIG,State},{Store,Data},{World}]=await Promise.all([u('core.js'),u('store.js'),u('world.js')])

const D=n=>{const d=Store.today();d.setDate(d.getDate()+n);return Store.fmt(d)}
const mk=n=>Array.from({length:n},(_,i)=>({id:'f'+i,name:'F'+i,group:'G',deadline:D(i-3),tasks:Array.from({length:1+i%6},(_,k)=>({title:'t'+k,due:D(k),done:k%3===0}))}))

const zones={
 yard:(x,y,z)=>z>1.05,
 coolingTowers:(x,y,z)=>x>.88&&z<-1.0&&y<.45,
 leftStrip:(x,y,z)=>x<-1.1,
 tankFarm:(x,y,z)=>x>1.12&&z>-.8,
 rack:(x,y,z)=>Math.abs(z+.9)<.02&&y>.1&&y<.13&&x>-1.05&&x<.5,
 roofs:(x,y,z)=>z<-1.1&&y>.14,
 gate:(x,y,z)=>Math.abs(z-.96)<.02&&Math.abs(x)<.35&&y<.06
}
const MIN={yard:.03,coolingTowers:.02,leftStrip:.04,tankFarm:.03,rack:.003,roofs:.03,gate:.002}

let bad=0
const fail=m=>{bad++;console.log('FAIL',m)}
for(const [name,n] of [['sample',0],['mid',14],['big',40]]){
 if(n){Store.projects=Store.norm(mk(n));Store.ensureSlots()}else Store.load()
 State.scene='factory';State.layer='true';State.threshold=.7
 World.rebuild(true);Data.syncAlerts()
 const p=World.pos,a=World.attr,N=p.length/3,cnt={}
 for(const k of Object.keys(zones))cnt[k]=0
 let nan=0,oob=0,badAttr=0
 for(let i=0;i<N;i++){
  const x=p[i*3],y=p[i*3+1],z=p[i*3+2]
  if(!Number.isFinite(x+y+z)){nan++;continue}
  if(Math.abs(x)>1.6||Math.abs(z)>1.6||y<-.001||y>1.6)oob++
  if(a[i]>7)badAttr++
  for(const k in zones)if(zones[k](x,y,z))cnt[k]++
 }
 const row=Object.entries(cnt).map(([k,v])=>k+'='+(v/N*100).toFixed(1)+'%').join(' ')
 console.log(name.padEnd(7),'points',N,'prims',World.prims.length,'movers',World.movers.length,'|',row)
 if(N!==85000)fail(name+' points '+N)
 if(nan)fail(name+' NaN '+nan)
 if(oob)fail(name+' out of bounds '+oob)
 if(badAttr)fail(name+' attr>7 '+badAttr)
 for(const k in MIN)if(cnt[k]/N<MIN[k])fail(name+' zona '+k+' terlalu sedikit '+(cnt[k]/N*100).toFixed(2)+'% < '+MIN[k]*100+'%')
 if(World.movers.length<20)fail(name+' movers '+World.movers.length)
}
console.log(bad?'FAIL: '+bad+' masalah':'PASS: detail pabrik lengkap, semua titik valid')
process.exit(bad?1:0)
