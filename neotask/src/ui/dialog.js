let current=null
const listeners=new Set()

const notify=()=>listeners.forEach(fn=>fn())

export const subscribeDialog=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export const getDialog=()=>current

export const openDialog=options=>{
 // The DOM parity harness supplies this queue so UI tests can drive dialogs
 // without reaching into the rendered terminal prompt.
 if(typeof window!=='undefined'&&Array.isArray(window.__prompts)){
  if(options.mode==='confirm')return Promise.resolve(true)
  return Promise.resolve(window.__prompts.length?window.__prompts.shift():null)
 }
 return new Promise(resolve=>{current={...options,resolve};notify()})
}

export const closeDialog=value=>{
 if(!current)return
 const resolve=current.resolve
 current=null
 notify()
 resolve(value)
}
