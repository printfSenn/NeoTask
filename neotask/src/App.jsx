import{useEffect,useRef}from'react'
import{CONFIG,State}from'./engine/core.js'
import{I18}from'./engine/i18n.js'
import{Store}from'./engine/store.js'
import{API}from'./engine/api.js'
import{t,useTick,Search,toggleAuto,toggleTraffic,toggleCine}from'./ui/bridge.js'
import Header from'./ui/Header.jsx'
import Stage from'./ui/Stage.jsx'
import Sidebar from'./ui/Sidebar.jsx'
import TerminalDialog from'./ui/TerminalDialog.jsx'
import StatusOverlay from'./ui/StatusOverlay.jsx'
import{NotFound}from'./ui/SystemPage.jsx'
import{setBootReady}from'./ui/status.js'

function useHotkeys(){
 useEffect(()=>{
  const h=e=>{
   if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return
   if(document.querySelector('.termveil'))return
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?API.redo():API.undo();return}
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();API.redo();return}
   if(e.key==='/'&&!e.ctrlKey){e.preventDefault();Search.focus();return}
   if(e.key===' '){e.preventDefault();toggleAuto()}
   else if(e.key==='t')toggleTraffic();else if(e.key==='c')toggleCine()
   else if(e.key.toLowerCase()==='n'){e.preventDefault();API.newProject()}
   else if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key.toLowerCase()==='x'){e.preventDefault();const p=API.store.projects.find(x=>x.id===API.state.selected);if(p)API.deleteProject(p)}
   else if(e.key==='r')API.resetView();else if(e.key==='Escape'||e.key==='Backspace')API.select('')
   else if(e.key==='ArrowRight')API.selectNext(1);else if(e.key==='ArrowLeft')API.selectNext(-1)
   else if(/^[1-5]$/.test(e.key))API.setLayer(CONFIG.layers[+e.key-1][0])
  }
  document.addEventListener('keydown',h)
  return()=>document.removeEventListener('keydown',h)
 },[])
}

function Boot(){
 useTick('lang')
 const el=useRef(null),pre=useRef(null)
 useEffect(()=>{
  const n=Store.projects.length,
   lines=['> mounting NeoTask engine','> scenes: city satellite ship factory airport metro','> loading '+n+' project'+(n===1?'':'s')+' from local store','> calibrating alert threshold '+State.threshold.toFixed(2),'> render core online']
  let li=0,ci=0,out='',done=false,tm=0
  const finish=()=>{
   if(done)return
   done=true
   setBootReady()
   document.removeEventListener('keydown',kd,true)
   el.current.classList.add('off')
   tm=setTimeout(()=>{el.current.style.display='none'},700)
  }
  const kd=e=>{e.stopPropagation();e.preventDefault();finish()}
  document.addEventListener('keydown',kd,true)
  el.current.addEventListener('pointerdown',finish)
  const paint=()=>{pre.current.textContent=out;const c=document.createElement('span');c.className='cur';pre.current.appendChild(c)}
  const step=()=>{
   if(done)return
   if(li>=lines.length){tm=setTimeout(finish,650);return}
   const s=lines[li]
   if(ci<s.length){out+=s[ci++];paint();tm=setTimeout(step,s[ci-1]===' '?45:16)}
   else{out+='\n';li++;ci=0;paint();tm=setTimeout(step,260)}
  }
  paint();step()
  return()=>{clearTimeout(tm);document.removeEventListener('keydown',kd,true);if(el.current)el.current.removeEventListener('pointerdown',finish)}
 },[])
 return(<div id="boot" ref={el}><pre id="bootTxt" ref={pre}></pre><small>{t('klik atau tekan tombol apa saja untuk skip')}</small></div>)
}

export default function App(){
 useTick('lang')
 useEffect(()=>{document.documentElement.lang=I18.cur})
 useHotkeys()
 const path=window.location.pathname.replace(/\/+$/,'')||'/'
 if(path!=='/'&&path!=='/index.html')return <NotFound/>
 return(<>
  <div id="app"><Header/><main><Stage/><Sidebar/></main></div>
  <TerminalDialog/>
  <StatusOverlay/>
  <Boot/>
 </>)
}
