import{useEffect,useSyncExternalStore}from'react'
import{clearImportError,getStatus,setOffline,subscribeStatus}from'./status.js'

export default function StatusOverlay(){
 const status=useSyncExternalStore(subscribeStatus,getStatus,getStatus)
 useEffect(()=>{
  const online=()=>setOffline(false),offline=()=>setOffline(true)
  window.addEventListener('online',online);window.addEventListener('offline',offline)
  return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offline)}
 },[])
 return(<>
  {status.busy&&<div className="busyveil" role="status" aria-live="polite"><div className="busybox"><span className="spinner" aria-hidden="true"></span><span>{status.busyLabel}</span><small>PLEASE WAIT · LOCAL DATA IS BEING PROCESSED</small></div></div>}
  {status.toast&&<div className={'toast '+status.toast.type} role={status.toast.type==='error'?'alert':'status'} key={status.toast.id}><span className="toastmark">{status.toast.type==='error'?'!':'>'}</span><span>{status.toast.message}</span></div>}
  {status.importError&&<div className="importveil"><section className="importstatus" role="alert" aria-labelledby="importStatusTitle"><div className="systemhead"><span>NEOTASK // IMPORT</span><span className="errortext">● FAILED</span></div><div className="systemprompt"><span>neo@task:~$</span> import json</div><div className="importstatuscode">422</div><h2 id="importStatusTitle">IMPORT FAILED</h2><p>{status.importError.message}</p><pre>{status.importError.details}</pre><button onClick={clearImportError}>ESC / CLOSE</button></section></div>}
  {status.offline&&<div className="offlinebar" role="status"><span>● OFFLINE MODE</span><span>local workspace remains available</span></div>}
 </>)
}
