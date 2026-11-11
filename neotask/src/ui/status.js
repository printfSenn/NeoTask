let snapshot={busy:false,busyLabel:'',toast:null,importError:null,offline:typeof navigator!=='undefined'&&navigator.onLine===false,booting:true}
const listeners=new Set()
let toastId=0
let toastTimer=0

const emit=()=>listeners.forEach(fn=>fn())
export const subscribeStatus=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export const getStatus=()=>snapshot

export const setBusy=(busy,label='PROCESSING')=>{snapshot={...snapshot,busy:!!busy,busyLabel:label};emit()}
export const notify=(message,type='success',duration=3600)=>{
 if(snapshot.booting)return
 clearTimeout(toastTimer)
 const id=++toastId
 snapshot={...snapshot,toast:{id,message:String(message),type}}
 emit()
 toastTimer=setTimeout(()=>{if(snapshot.toast&&snapshot.toast.id===id){snapshot={...snapshot,toast:null};emit()}},duration)
}
export const setImportError=(message,details='Check the file format and try again.')=>{snapshot={...snapshot,importError:{message:String(message),details:String(details)}};emit()}
export const clearImportError=()=>{if(snapshot.importError){snapshot={...snapshot,importError:null};emit()}}
export const setOffline=offline=>{snapshot={...snapshot,offline:!!offline};emit()}
export const setBootReady=()=>{snapshot={...snapshot,booting:false,toast:null};emit()}
