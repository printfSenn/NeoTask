import{useRef}from'react'
import{CONFIG,State}from'../engine/core.js'
import{I18}from'../engine/i18n.js'
import{Store,Data}from'../engine/store.js'
import{API}from'../engine/api.js'
import{t,useBridge,setLang,toggleAuto,toggleTraffic,toggleCine}from'./bridge.js'

function Stats(){
 useBridge('stats','lang')
 const open=Store.projects.reduce((s,p)=>s+p.tasks.filter(k=>!k.done).length,0),all=Store.projects.reduce((s,p)=>s+p.tasks.length,0)
 return(<>
  <div className="stat"><span className="lab">{t('PROJECTS')}</span><b id="sB">{Store.projects.length}</b></div>
  <div className="stat"><span className="lab">{t('TASKS OPEN/ALL')}</span><b id="sP">{open+'/'+all}</b></div>
  <div className="stat"><span className="lab">{t('ALERTS')}</span><b id="sA">{Data.count()}</b></div>
 </>)
}

export default function Header(){
 useBridge('sync','lang')
 const file=useRef(null),thr=Math.round(State.threshold*100)
 return(<header>
  <div className="brand">Neo<b>Task</b></div>
  <div className="grp"><span className="lab">{t('LAYER')}</span><span id="layers" className="grp">{CONFIG.layers.map(([k,l])=><button key={k} className={State.layer===k?'on':undefined} onClick={()=>API.setLayer(k)}>{t(l)}</button>)}</span></div>
  <div className="grp"><span className="lab">{t('SCENE')}</span><span id="modes" className="grp">{CONFIG.scenes.map(s=><button key={s} className={State.scene===s?'on':undefined} onClick={()=>API.setScene(s)}>{t(s.toUpperCase())}</button>)}</span></div>
  <div className="grp"><button id="auto" className={State.auto?'on':undefined} onClick={toggleAuto}>{t('AUTO ORBIT')}</button><button id="traf" className={State.showTraffic?'on':undefined} onClick={toggleTraffic}>{t('TRAFFIC')}</button><button id="cine" className={State.cine?'on':undefined} onClick={toggleCine}>{t('CINEMA')}</button></div>
  <div className="grp"><span className="lab">{t('LANG')}</span><select id="lang" value={I18.cur} onChange={e=>setLang(e.target.value)}><option value="id">ID</option><option value="en">EN</option></select></div>
  <div className="grp"><span className="lab">{t('ALERT \u2265')}</span><input id="thr" type="range" min="0" max="100" value={thr} onChange={e=>API.setThreshold(+e.target.value/100)}/><b id="thv" style={{color:'var(--w)'}}>{thr+'%'}</b></div>
  <div className="grp"><button id="add" onClick={()=>API.newProject()}>{t('+ PROJECT')}</button><button id="imp" onClick={()=>file.current.click()}>{t('IMPORT')}</button><button id="expj" onClick={()=>API.exportJSON()}>{t('EXPORT JSON')}</button><button id="csv" onClick={()=>API.exportCSV()}>{t('EXPORT CSV')}</button><button id="snap" onClick={()=>API.snap()}>{t('SNAP PNG')}</button><button id="reset" onClick={()=>API.resetView()}>{t('RESET VIEW')}</button><button id="sample" onClick={()=>API.loadSample()}>{t('LOAD SAMPLE')}</button><input id="file" ref={file} type="file" accept=".json,application/json" hidden onChange={e=>{const f=e.target.files[0];if(f)f.text().then(x=>API.importJSON(x));e.target.value=''}}/></div>
  <div className="spacer"></div>
  <Stats/>
 </header>)
}
