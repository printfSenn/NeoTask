import{useEffect,useRef,useState}from'react'
import{CONFIG,State,Viz}from'../engine/core.js'
import{I18}from'../engine/i18n.js'
import{startEngine}from'../engine/runtime.js'
import{t,useBridge,vizOut,Picker}from'./bridge.js'

const HINT='drag putar \u00b7 scroll zoom \u00b7 klik pilih \u00b7 \u2190\u2192 proyek \u00b7 / cari \u00b7 1-5 layer \u00b7 space orbit \u00b7 t traffic \u00b7 c cinema \u00b7 n baru \u00b7 r reset'

function Clock(){
 useBridge('lang')
 const[now,setNow]=useState(()=>new Date())
 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),500);return()=>clearInterval(id)},[])
 return(<div id="clock"><div className="lab">{t('LOCAL TIME')}</div><b id="ck">{now.toLocaleTimeString('en-GB',{hour12:false})}</b><div id="cd">{now.toLocaleDateString(I18.cur==='id'?'id-ID':'en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase()}</div></div>)
}

function Legend(){
 useBridge('legend','lang')
 const k=CONFIG.layers.find(x=>x[0]===State.layer),labels=State.layer==='progress'?['DONE','MID','BEHIND']:State.layer==='true'?['OPEN','DUE','OVERDUE']:['LOW','MID','HIGH']
 return(<div id="legend"><div className="lab" id="lgT">{t(k?k[1]:'TRUE COLOR')}</div><div className="bar"></div><div className="t">{labels.map((x,i)=><span key={i}>{t(x)}</span>)}</div></div>)
}

function Hist({cv}){
 useBridge('viz','lang')
 const o=vizOut.hR
 return(<div id="hist"><div className="lab" id="hT">{vizOut.hT||t('DISTRIBUTION')}</div><canvas id="hc" ref={cv}></canvas><div id="hR">{o&&<>{t('PEAK')}{' '}<b>{o.peak+'%'}</b><br/>{t('AVG')}{' '}<b>{o.avg+'%'}</b><br/>{t('ALERTS')}{' '}<b>{o.alerts}</b>{' / '+o.n}</>}</div></div>)
}

function Heat({cv}){
 useBridge('viz','lang')
 const o=vizOut.mR
 return(<div id="hm"><div className="lab" id="mT">{t('DEADLINES / 40D')}</div><canvas id="mc" ref={cv}></canvas><div id="mR">{o&&<><span>{t('NEXT')}{' '}<b>{o.next}</b></span><span>{t('OVERDUE')}{' '}<b>{o.over}</b></span></>}</div></div>)
}

export default function Stage(){
 useBridge('lang')
 const cv=useRef(null),tip=useRef(null),hc=useRef(null),mc=useRef(null)
 useEffect(()=>{
  const offPicker=Picker.init(cv.current,tip.current)
  Viz.init(hc.current,mc.current)
  Viz.draw()
  const stop=startEngine(cv.current)
  return()=>{stop();offPicker();hc.current.onclick=null;mc.current.onclick=null;Viz.hc=null;Viz.mc=null}
 },[])
 return(<div id="stage"><canvas id="cv" ref={cv}></canvas><div id="tip" ref={tip}></div>
  <Clock/>
  <Legend/>
  <Hist cv={hc}/>
  <Heat cv={mc}/>
  <div id="hint">{t(HINT)}</div>
 </div>)
}
