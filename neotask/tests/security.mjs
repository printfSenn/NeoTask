globalThis.window={}
globalThis.document={createElement:()=>({click(){}})}
globalThis.URL={createObjectURL:blob=>(globalThis.downloaded=blob,'blob:test'),revokeObjectURL(){}}
globalThis.Blob=class{constructor(parts){this.text=parts.join('')}}

const {API}=await import('../src/engine/api.js')
const {Store}=await import('../src/engine/store.js')
const {CONFIG}=await import('../src/engine/core.js')
const assert=(condition,message)=>{if(!condition)throw new Error(message)}

Store.projects=[{name:'=1+1',group:'@team',deadline:'',tasks:[{title:'-cmd',due:'',done:false}]}]
API.exportCSV()
assert(downloaded.text.includes("'=1+1"),'CSV formula guard failed for project name')
assert(downloaded.text.includes("'@team"),'CSV formula guard failed for group')
assert(downloaded.text.includes("'-cmd"),'CSV formula guard failed for task title')

assert(Store.norm({projects:Array.from({length:CONFIG.limits.maxProjects+1},()=>({name:'x',tasks:[]}))})===null,'project limit failed')
assert(Store.norm({projects:[{tasks:[{title:'x'.repeat(CONFIG.limits.maxTaskTitleLength+1)}]}]})===null,'task title limit failed')
assert(Store.norm({projects:Array.from({length:11},()=>({name:'x',tasks:Array.from({length:1000},()=>({title:'x'}))}))})===null,'total task limit failed')
assert(Store.norm({projects:[{name:'ok',tasks:[{title:'ok'}]}]})!==null,'normal import failed')
assert(API.importJSON('x'.repeat(CONFIG.limits.importBytes+1))===false,'import size limit failed')
assert(!('CityAPI' in globalThis.window),'global API is still exposed')

console.log('PASS: security guards')
