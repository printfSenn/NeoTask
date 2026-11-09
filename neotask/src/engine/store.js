import{CONFIG,U,deep,State,UI}from'./core.js'
import{L}from'./i18n.js'
import{World}from'./world.js'
export const Store={key:'jev.projects.v3',projects:[],scene:'city',layer:'true',threshold:CONFIG.alertThreshold,undo:[],redo:[],
 fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
 validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return false;const[y,m,d]=s.split('-').map(Number),x=new Date(y,m-1,d);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d},
 today(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())},
 days(s){if(!this.validDate(s))return null;const[y,m,d]=s.split('-').map(Number);return Math.round((new Date(y,m-1,d)-this.today())/86400000)},
 norm(input){const a=Array.isArray(input)?input:input&&input.projects;if(!Array.isArray(a))return null;
  return a.map((p,i)=>{const id=String(p&&p.id||'p'+Date.now().toString(36)+i);
   return{id,name:String(p&&p.name||'Proyek '+(i+1)),group:String(p&&p.group||'Umum'),deadline:this.validDate(p&&p.deadline)?p.deadline:'',
    seed:Number.isFinite(+(p&&p.seed))?(+p.seed>>>0):U.hash(id),slots:deep(p&&p.slots||{}),
    tasks:(Array.isArray(p&&p.tasks)?p.tasks:[]).map(t=>typeof t==='string'?{title:t,due:'',done:false}:{title:String(t&&t.title||t&&t.name||'task'),due:this.validDate(t&&t.due)?t.due:'',done:!!(t&&t.done)})}})},
 capture(){return deep(this.projects)},
 save(){try{localStorage.setItem(this.key,JSON.stringify({projects:this.projects,scene:State.scene,layer:State.layer,threshold:State.threshold}))}catch(e){}},
 load(){let j=null;try{j=JSON.parse(localStorage.getItem(this.key)||'null')}catch(e){}
  if(j){this.projects=this.norm(j)||[];this.scene=CONFIG.scenes.includes(j.scene)?j.scene:'city';this.layer=CONFIG.layers.some(x=>x[0]===j.layer)?j.layer:'true';this.threshold=Number.isFinite(+j.threshold)?U.cl(+j.threshold,0,1):CONFIG.alertThreshold}
  else{const D=n=>{const d=this.today();d.setDate(d.getDate()+n);return this.fmt(d)},
   mk=(id,name,group,ds,ts)=>({id,name,group,deadline:D(ds),seed:U.hash(id),slots:{},tasks:ts.map(x=>({title:x[0],done:x[1],due:D(x[2])}))});
   this.projects=[mk('s1','Website','Work',5,[['Plan',true,-4],['Build',false,1],['Launch',false,5]]),mk('s2','Study Plan','School',12,[['Read notes',true,-2],['Practice',false,6],['Exam',false,12]]),mk('s3','Side Project','Personal',25,[['Idea',true,-6],['Prototype',false,10],['Share',false,25]])]}
  this.ensureSlots()},
 ensureSlots(){for(const p of this.projects){p.seed=Number.isFinite(+p.seed)?(+p.seed>>>0):U.hash(p.id);if(!p.slots||typeof p.slots!=='object')p.slots={};
   for(const mode of CONFIG.scenes){const v=p.slots[mode];if(v&&typeof v==='object'&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.g))continue;
    if(Number.isFinite(+v)&&v!==null&&typeof v!=='object'){const g=CONFIG.gridBase;p.slots[mode]={x:+v%g,y:Math.floor(+v/g),g}}else delete p.slots[mode]}}
  for(const mode of CONFIG.scenes)this.assignMissing(mode)},
 assignMissing(mode){const used=new Set(this.projects.map(p=>{const s=p.slots[mode];return s&&s.g+'|'+s.x+'|'+s.y}));
  let g=Math.max(CONFIG.gridBase,Math.ceil(Math.sqrt(this.projects.length+1))),candidates=[];
  const fill=()=>{for(let y=0;y<g;y++)for(let x=0;x<g;x++)if(!used.has(g+'|'+x+'|'+y))candidates.push({x,y,g,score:Math.hypot(x-(g-1)/2,y-(g-1)/2)});candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x)};
  fill();let expanded=false;
  for(const p of this.projects){if(p.slots[mode])continue;
   if(!candidates.length){g++;candidates=[];fill();expanded=true}
   const pick=Math.min(candidates.length-1,Math.floor(U.rand((p.seed||1)+mode.length)()*Math.min(4,candidates.length)));
   const c=candidates.splice(pick,1)[0];p.slots[mode]=c;used.add(c.g+'|'+c.x+'|'+c.y)}
  if(expanded&&UI.ready)UI.log(L('grid diperbesar · slot baru tersedia'),'w')},
 addUndo(before){this.undo.push(before);if(this.undo.length>50)this.undo.shift();this.redo=[]},
 applySnapshot(s){this.projects=this.norm(s)||[];this.ensureSlots();World.rebuild(false);UI.refreshAll(false);this.save()}
};
export const Data={
 days:s=>Store.days(s),
 when(n){return n==null?'-':n<0?L('OVERDUE')+' '+(-n)+'d':n===0?L('TODAY'):n+'d'},
 calc(b){const p=b.p,ts=p.tasks.map((t,i)=>({...t,_i:i})),open=ts.filter(t=>!t.done),done=ts.length-open.length;
  const ds=open.filter(t=>t.due).map(t=>this.days(t.due));if(open.length&&p.deadline)ds.push(this.days(p.deadline));
  const next=ds.length?Math.min(...ds):null,over=open.filter(t=>t.due&&this.days(t.due)<0).length;
  const urgency=next==null?0:U.cl(1-next/CONFIG.urgencyWindowDays,0,1),progress=ts.length?done/ts.length:0;
  b.open=open.length;b.done=done;b.total=ts.length;b.next=next;b.over=over;b.progress=progress;b.urgency=urgency;
  b.risk=U.cl(urgency*(1-.7*progress)+(over?0.15:0),0,1);b.complete=ts.length>0&&open.length===0;
  b.alert=urgency>=State.threshold&&!b.complete&&open.length>0;
  b.order=ts.sort((a,z)=>(a.done?0:1)-(z.done?0:1)||(a.due||'9999').localeCompare(z.due||'9999')||a._i-z._i);return b},
 refresh(){World.buildings.forEach(b=>this.calc(b));const max=Math.max(1,...World.buildings.map(b=>b.open));
  World.buildings.forEach(b=>{b.load=b.open/max;b.metric={progress:b.progress,urgency:b.urgency,load:b.load,risk:b.risk}});this.recolor()},
 recolor(){const L=State.layer;
  for(const b of World.buildings){const n=b.p.tasks.length,col=new Array(n+3),red=[255,60,80];
   if(L==='true'){
    col[0]=red;col[1]=b.alert?red:[110,235,160];col[2]=b.alert?red:[44,160,85];
    b.p.tasks.forEach((t,i)=>{if(t.done){col[i+3]=[235,255,245];return}const d=t.due?this.days(t.due):null;col[i+3]=d!=null&&d<0?[255,55,75]:d!=null&&d<=2?[255,216,74]:[40,170,88]});
   }else{let v=b.metric[L]||0;if(L==='progress')v=1-v;const c=U.ramp(v);for(let i=0;i<n+3;i++)col[i]=c}
   b.col=col}},
 count(){return World.buildings.filter(b=>b.alert).length},
 syncAlerts(){this.refresh();
  for(const b of World.buildings){const was=State.alerted.has(b.id);
   if(b.alert&&!was){UI.log(b.p.name+' · deadline '+this.when(b.next),b.over?'c':'w',b.p.id);State.alerted.add(b.id)}
   else if(!b.alert&&was)State.alerted.delete(b.id)}
  State.alerts=this.count()}
};
