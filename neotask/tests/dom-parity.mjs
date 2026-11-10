import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {JSDOM,VirtualConsole} from 'jsdom'

const here=path.dirname(fileURLToPath(import.meta.url))
const oldHtml=fs.readFileSync(process.env.PARITY_HTML||path.join(here,'reference/neotask.html'),'utf8')
const bundle=fs.readFileSync(process.env.PARITY_BUNDLE||path.join(here,'..','.tmp','nt-iife','app.js'),'utf8')
const wait=ms=>new Promise(r=>setTimeout(r,ms))

const mulberry=seed=>{let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

const prep=w=>{
 const ctx=new Proxy(function(){},{get:(t,k)=>k==='createImageData'?(a,b)=>({data:new w.Uint8ClampedArray(a*b*4)}):k===Symbol.toPrimitive?()=>0:typeof k==='symbol'?undefined:ctx,set:()=>true,apply:()=>ctx})
 w.HTMLCanvasElement.prototype.getContext=()=>ctx
 w.HTMLAnchorElement.prototype.click=()=>{}
 w.URL.createObjectURL=()=>'blob:x'
 w.URL.revokeObjectURL=()=>{}
 w.__prompts=[]
 w.prompt=()=>w.__prompts.length?w.__prompts.shift():null
 w.confirm=()=>true
 w.Math.random=mulberry(5)
}

const open=async kind=>{
 const vc=new VirtualConsole()
 const errors=[]
 vc.on('jsdomError',e=>errors.push(String(e.message).slice(0,160)))
 vc.on('error',e=>errors.push(String(e).slice(0,160)))
 const html=kind==='old'?oldHtml:'<!doctype html><html lang="id"><head><title>NeoTask</title></head><body><div id="root"></div></body></html>'
 const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse:prep})
 if(kind==='new')dom.window.eval(bundle)
 await wait(150)
 return{w:dom.window,errors,kind}
}

const norm=w=>{
 const d=w.document
 d.querySelectorAll('#app input,#app select').forEach(e=>e.setAttribute('data-v',e.value))
 const app=d.querySelector('#app').cloneNode(true)
 app.querySelector('#clock')&&app.querySelector('#clock').remove()
 app.querySelectorAll('.ts').forEach(e=>e.textContent='')
 const strip=n=>{for(const c of [...n.childNodes]){if(c.nodeType===3&&!c.textContent.trim())c.remove();else if(c.nodeType===1)strip(c)}}
 app.normalize()
 strip(app)
 app.querySelectorAll('*').forEach(e=>{
  if(e.hasAttribute('class')){const c=e.getAttribute('class').split(/\s+/).filter(Boolean).sort().join(' ');c?e.setAttribute('class',c):e.removeAttribute('class')}
  if(e.hasAttribute('style')){const s=e.style.cssText;s?e.setAttribute('style',s):e.removeAttribute('style')}
  if(e.tagName==='INPUT'||e.tagName==='OPTION'){e.removeAttribute('value');e.removeAttribute('selected')}
  for(const a of [...e.attributes])if(/^data-[ot]_/.test(a.name))e.removeAttribute(a.name)
  const at=[...e.attributes].map(x=>[x.name,x.value]).sort((x,y)=>x[0]<y[0]?-1:1)
  at.forEach(x=>e.removeAttribute(x[0]));at.forEach(x=>e.setAttribute(x[0],x[1]))
 })
 for(const id of ['hR','mR']){const e=app.querySelector('#'+id);if(e)e.innerHTML=e.innerHTML.replace(/\b(PEAK|PUNCAK|AVG|RATA2|ALERTS|PERINGATAN|NEXT|BERIKUT|OVERDUE|TERLAMBAT)\b/g,'LBL')}
 return app.outerHTML.replace(/\bp[a-z0-9]{8,}\b/g,'pX')
}

const ev=(w,el,type,init)=>{const E=type.startsWith('key')?w.KeyboardEvent:type.startsWith('pointer')?w.MouseEvent:w.MouseEvent;el.dispatchEvent(new E(type,{bubbles:true,cancelable:true,...init}))}
const click=(w,sel,i=0)=>{const el=w.document.querySelectorAll(sel)[i];if(!el)throw new Error('missing '+sel+'['+i+']');ev(w,el,'click')}
const dbl=(w,sel,i=0)=>{const el=w.document.querySelectorAll(sel)[i];if(!el)throw new Error('missing '+sel);ev(w,el,'click');ev(w,el,'click');ev(w,el,'dblclick')}
const type=(w,sel,v)=>{const el=w.document.querySelector(sel);if(!el)throw new Error('missing '+sel);const set=Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?w.HTMLSelectElement.prototype:w.HTMLInputElement.prototype,'value').set;set.call(el,v);ev(w,el,el.tagName==='SELECT'?'change':'input')}
const key=(w,k,init={},sel='body')=>ev(w,w.document.querySelector(sel),'keydown',{key:k,...init})

const steps=[
 ['initial',()=>{}],
 ['skip boot',w=>{ev(w,w.document.querySelector('#boot'),'pointerdown')}],
 ...[0,1,2,3,4].map(i=>['layer '+i,w=>click(w,'#layers button',i)]),
 ...[0,1,2,3,4,5].map(i=>['scene '+i,w=>click(w,'#modes button',i)]),
 ['auto',w=>click(w,'#auto')],['traffic',w=>click(w,'#traf')],['cinema on',w=>click(w,'#cine')],['cinema off',w=>click(w,'#cine')],
 ['threshold 30',w=>type(w,'#thr','30')],
 ['select first',w=>click(w,'#list > div',0)],
 ['lang en',w=>type(w,'#lang','en')],
 ['lang en list',w=>click(w,'#list > div',1)],
 ['lang id',w=>type(w,'#lang','id')],
 ['toggle task',w=>click(w,'#tasks .tk',0)],
 ['toggle task again',w=>click(w,'#tasks .tk',0)],
 ['add task',w=>{type(w,'#tt','demo task');type(w,'#td','2026-12-01');click(w,'#ta')}],
 ['add task enter',w=>{type(w,'#tt','enter task');key(w,'Enter',{},'#tt')}],
 ['edit task',w=>{w.__prompts.push('edited task');dbl(w,'#tasks .tk',0)}],
 ['delete task',w=>click(w,'#tasks .tk u',0)],
 ['rename',w=>{w.__prompts.push('Renamed Proj');click(w,'#pr')}],
 ['group',w=>{w.__prompts.push('Ops');click(w,'#pg')}],
 ['deadline',w=>{w.__prompts.push('2026-12-24');click(w,'#pd')}],
 ['all done',w=>click(w,'#all')],
 ['undo',w=>key(w,'z',{ctrlKey:true})],
 ['redo',w=>key(w,'y',{ctrlKey:true})],
 ['back',w=>click(w,'#bk')],
 ['search',w=>type(w,'#q','a')],
 ['search enter',w=>key(w,'Enter',{},'#q')],
 ['search clear',w=>{key(w,'Escape',{},'#q');type(w,'#q','')}],
 ['hotkey 3',w=>key(w,'3')],['hotkey space',w=>key(w,' ')],['hotkey t',w=>key(w,'t')],['hotkey c',w=>key(w,'c')],['hotkey c off',w=>key(w,'c')],
 ['arrow right',w=>key(w,'ArrowRight')],['arrow left',w=>key(w,'ArrowLeft')],['hotkey r',w=>key(w,'r')],['escape',w=>key(w,'Escape')],
 ['new project',w=>{w.__prompts.push('Alpha');w.__prompts.push('Work');click(w,'#add')}],
 ['hotkey n',w=>{w.__prompts.push('Beta');w.__prompts.push('Lab');key(w,'n')}],
 ['delete project',w=>click(w,'#px')],
 ['load sample',w=>click(w,'#sample')],
 ['reset view',w=>click(w,'#reset')],
 ['export json',w=>click(w,'#expj')],['export csv',w=>click(w,'#csv')],
 ['lang en final',w=>type(w,'#lang','en')],
 ['select en',w=>click(w,'#list > div',0)],
 ['hotkey 1',w=>key(w,'1')],
 ['wait tick',async()=>wait(1300)]
]

const A=await open('old'),B=await open('new')
const stateOf=w=>{const s=w.localStorage.getItem('jev.projects.v3')||'';return s.replace(/\bp[a-z0-9]{8,}\b/g,'pX').replace(/"seed":\d+/g,'"seed":0')}
let bad=0
const run=process.env.STEPS?steps.slice(0,+process.env.STEPS):steps
for(const[name,fn]of run){
 const errs=[]
 try{await fn(A.w);await fn(B.w)}catch(e){errs.push(e.message)}
 await wait(Number(process.env.SETTLE||1100))
 const a=norm(A.w),b=norm(B.w)
 let ok=a===b&&!errs.length
 if(!ok){
  bad++
  if(bad>8)continue
  let i=0;while(i<a.length&&a[i]===b[i])i++
  console.log('DIFF  '+name+(errs.length?'  ERR '+errs[0]:''))
  console.log('  old …'+a.slice(Math.max(0,i-80),i+160))
  console.log('  new …'+b.slice(Math.max(0,i-80),i+160))
 }
 else if(process.env.VERBOSE)console.log('OK    '+name)
}
await wait(1200)
const sa=stateOf(A.w),sb=stateOf(B.w)
console.log('steps:',steps.length,'| html bytes:',norm(A.w).length)
console.log('localStorage identik:',sa===sb,'| errors old:',A.errors.length,'new:',B.errors.length)
if(A.errors.length||B.errors.length)console.log(JSON.stringify({old:A.errors.slice(0,3),new:B.errors.slice(0,3)}))
console.log(bad||sa!==sb?'FAIL: '+bad+' langkah beda':'PASS: DOM React == DOM HTML di semua langkah')
process.exit(bad||sa!==sb?1:0)
