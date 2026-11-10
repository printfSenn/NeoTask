import{useEffect,useRef,useSyncExternalStore}from'react'
import{closeDialog,getDialog,subscribeDialog}from'./dialog.js'

export default function TerminalDialog(){
 const dialog=useSyncExternalStore(subscribeDialog,getDialog,getDialog)
 const input=useRef(null)
 useEffect(()=>{if(dialog&&input.current){input.current.focus();input.current.select()}},[dialog])
 useEffect(()=>{
  if(!dialog)return
  const onKey=e=>{if(e.key==='Escape'){e.preventDefault();closeDialog(null)}else if(e.key==='Enter'&&dialog.mode==='confirm'){e.preventDefault();closeDialog(true)}}
  document.addEventListener('keydown',onKey)
  return()=>document.removeEventListener('keydown',onKey)
 },[dialog])
 if(!dialog)return null
 const isConfirm=dialog.mode==='confirm'
 const submit=e=>{e.preventDefault();closeDialog(isConfirm?true:input.current.value)}
 return(<div className={'termveil '+(isConfirm?'danger':'')} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeDialog(null)}}>
  <form className="termbox" role="dialog" aria-modal="true" aria-labelledby="termTitle" onSubmit={submit}>
   <div className="termhead"><span id="termTitle">NEOTASK // {isConfirm?'CONFIRM':'INPUT'}</span><span className="termstatus">● ONLINE</span></div>
   <div className="termline"><span className="promptmark">neo@task:~$</span> <span>{dialog.command||'dialog'}</span></div>
   {dialog.details&&<div className="termdetails">{dialog.details}</div>}
   <label className="termlabel" htmlFor="termInput">{dialog.label}</label>
   {isConfirm?<div className="termchoices"><span className="choicekey">[ENTER]</span> execute <span className="choicekey">[ESC]</span> abort</div>:<input id="termInput" ref={input} className="terminput" type="text" defaultValue={dialog.value||''} placeholder={dialog.placeholder||''} autoComplete="off"/>}
   <div className="termactions"><button type="button" onClick={()=>closeDialog(null)}>{dialog.cancelLabel||'ESC / CANCEL'}</button><button type="submit" className={isConfirm?'critical':''}>{dialog.confirmLabel||(isConfirm?'ENTER / CONFIRM':'ENTER / APPLY')}</button></div>
   {!isConfirm&&<div className="termhint">press ENTER to apply · ESC to cancel</div>}
  </form>
 </div>)
}
