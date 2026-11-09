import{useEffect,useLayoutEffect,useRef}from'react'
import{CONFIG,State,U}from'../engine/core.js'
import{L}from'../engine/i18n.js'
import{Data}from'../engine/store.js'
import{World}from'../engine/world.js'
import{API}from'../engine/api.js'
import{t,useBridge,useTick,logs,Search,setSearch,listItems}from'./bridge.js'

const status=b=>{
 if(!b||!b.total)return['ON TRACK','var(--g)']
 if(b.complete)return['DONE','var(--g)']
 if(b.over)return['OVERDUE','var(--r)']
 if(b.alert)return['DUE SOON','var(--y)']
 return['ON TRACK','var(--g)']
}

function Timeline({b}){
 const p=b.p,start=-7,span=40,xp=d=>((d-start)/span*100).toFixed(1)
 const marks=[]
 p.tasks.forEach((k,i)=>{
  if(!k.due)return
  const d=Data.days(k.due)
  if(d==null||d<start||d>=start+span)return
  const c=k.done?'#eafff2':d<0?'#ff3a5c':d<=2?'#ffd84a':'#00dc64'
  marks.push(<rect key={i} x={xp(d)-.5} y="3" width="1.1" height="10" fill={c}/>)
 })
 let diamond=null
 if(p.deadline){
  const d=Data.days(p.deadline)
  if(d!=null&&d>=start&&d<start+span)diamond=<path d={'M'+xp(d)+' 1.5 l2 6.5 l-2 6.5 l-2 -6.5z'} fill="none" stroke="#fff" strokeWidth=".7" vectorEffect="non-scaling-stroke"/>
 }
 return(<>
  <svg className="tl" viewBox="0 0 100 16" preserveAspectRatio="none"><rect x="0" y="7.5" width="100" height=".8" fill="rgba(0,255,102,.25)"/><rect x={xp(0)} y="1" width=".7" height="14" fill="#9dffc4" opacity=".7"/>{marks}{diamond}</svg>
  <div className="tlc"><span>-7d</span><span>{t('TODAY')}</span><span>+32d</span></div>
 </>)
}

function ProjectCard({b}){
 const p=b.p,st=status(b),tt=useRef(null),td=useRef(null)
 const dl=p.deadline?'deadline '+p.deadline+' ('+Data.when(Data.days(p.deadline))+')':L('tanpa deadline')
 const rows=[['progress','PROGRESS',Math.round(b.progress*100)+'%'],['urgency','URGENCY',Math.round(b.urgency*100)+'%'],['load','OPEN LOAD',b.open+L(' open')],['risk','RISK',Math.round(b.risk*100)+'%']]
 const add=()=>{const v=tt.current.value.trim();if(v)API.addTask(p,v,td.current.value)}
 return(<>
  <h4><span><button className="bk" id="bk" title={t('kembali (Esc / Backspace)')} onClick={()=>API.select('')}>{'\u2190 BACK'}</button>PROJECT</span><span>{p.id}</span></h4>
  <div className="nm">{p.name}</div>
  <div className="sub">{p.group+' · '+p.tasks.length+' task · '+dl}</div>
  <span className="st" style={{color:st[1]}}>{t(st[0])}</span>
  <Timeline b={b}/>
  {rows.map(x=>{
   const v=b.metric[x[0]],c=U.ramp(x[0]==='progress'?1-v:v)
   return(<div className="m" key={x[0]}><div className="r"><span>{t(x[1])}</span><b>{x[2]}</b></div><div className="bar"><i style={{width:(v*100)+'%',background:'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')'}}></i></div></div>)
  })}
  <div id="tasks">{b.order.length?b.order.map(k=>{
   const d=k.due?Data.days(k.due):null,cl=k.done?'':d!=null&&d<0?'o':d!=null&&d<=2?'s':''
   return(<div key={k._i} className={'tk '+(k.done?'d':'')} data-i={k._i} onDoubleClick={()=>API.editTask(p,k._i)} onClick={e=>{if(e.target.tagName==='U')API.deleteTask(p,k._i);else API.toggleTask(p,k._i)}}><span>{(k.done?'\u25A0':'\u25A1')+' '+k.title}</span><em className={cl}>{k.due?(k.done?k.due:Data.when(d)):''}</em><u>{'\u00D7'}</u></div>)
  }):<div style={{color:'var(--gd)'}}>{t('belum ada task')}</div>}</div>
  <div className="add"><input id="tt" ref={tt} type="text" placeholder={t('task baru...')} onKeyDown={e=>{if(e.key==='Enter')add()}}/><input id="td" ref={td} type="date"/><button id="ta" onClick={add}>+</button></div>
  <div className="act"><button id="pr" onClick={()=>API.rename(p)}>{t('RENAME')}</button><button id="pg" onClick={()=>API.group(p)}>{t('GROUP')}</button><button id="pd" onClick={()=>API.deadline(p)}>{t('DEADLINE')}</button><button id="all" onClick={()=>API.allDone(p)}>{t('ALL DONE')}</button><button id="px" onClick={()=>API.deleteProject(p)}>{t('HAPUS')}</button></div>
 </>)
}

function Empty(){
 return(<><h4><span>{t('SELECTED')}</span><span>-</span></h4><div style={{color:'var(--gd)'}}>{t('klik objek = proyek, band = task. Tombol + PROJECT untuk mulai.')}</div></>)
}

function Card(){
 const n=useTick('card')
 useBridge('lang')
 const b=World.byId.get(State.selected)
 return(<div className="panel" id="card">{b?<ProjectCard key={n} b={b}/>:<Empty key={n}/>}</div>)
}

function List(){
 useBridge('list','lang')
 const q=useRef(null),{arr,key}=listItems()
 useEffect(()=>{Search.focus=()=>q.current&&q.current.focus();return()=>{Search.focus=()=>{}}},[])
 return(<div className="panel" style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
  <h4><span id="lh">{key?'TOP BY '+CONFIG.layers.find(x=>x[0]===key)[1]:t('NEXT DEADLINES')}</span><span>{'\u2193'}</span></h4>
  <input id="q" ref={q} type="text" placeholder={t('cari nama / group  ( / )')} autoComplete="off" value={Search.value} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){const x=listItems().arr[0];if(x)API.select(x.p.id)}if(e.key==='Escape')e.target.blur()}}/>
  <div id="list">{arr.map(b=><div key={b.p.id} data-id={b.p.id} className={b.p.id===State.selected?'on':undefined} onClick={()=>API.select(b.p.id)}><span>{b.p.name+' · '+b.p.group}</span><b>{key?Math.round(b.metric[key]*100)+'%':b.complete?'DONE':Data.when(b.next)}</b></div>)}</div>
 </div>)
}

function Log(){
 useBridge('log','lang')
 const el=useRef(null)
 useLayoutEffect(()=>{el.current.scrollTop=el.current.scrollHeight},[logs.n])
 return(<div className="panel"><h4><span>{t('EVENT LOG')}</span><span>{'\u2022 LIVE'}</span></h4><div id="log" ref={el}>{logs.items.map(x=><div key={x.k} data-id={x.id} onClick={x.id?()=>API.select(x.id):undefined}><span className="ts">{x.ts}</span><span className={x.cls}>{x.msg}</span></div>)}</div></div>)
}

export default function Sidebar(){
 return(<aside><Card/><List/><Log/></aside>)
}
