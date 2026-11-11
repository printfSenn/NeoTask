import{U,State,UI,Viz,deep,CONFIG}from'./core.js'
import{L}from'./i18n.js'
import{Store,Data}from'./store.js'
import{World}from'./world.js'
import{R}from'./renderer.js'
import{openDialog}from'../ui/dialog.js'
import{clearImportError,setBusy,setImportError}from'../ui/status.js'

const input=options=>openDialog({mode:'input',...options})
const confirmAction=options=>openDialog({mode:'confirm',...options})
export const API={world:World,state:State,config:CONFIG,store:Store,
 select(id){State.selected=id&&World.byId.has(id)?id:'';UI.card();UI.list();Viz.draw();State.listeners.select.forEach(f=>f(World.byId.get(State.selected)||null))},
 setLayer(k){if(!CONFIG.layers.some(x=>x[0]===k))return;State.layer=k;Store.layer=k;Data.refresh();Store.save();UI.refreshAll()},
 setScene(s){if(!CONFIG.scenes.includes(s))return;State.scene=s;Store.scene=s;World.rebuild(false);UI.refreshAll();Store.save();UI.log('scene '+s)},
 setThreshold(v){State.threshold=U.cl(+v,0,1);Store.threshold=State.threshold;Data.syncAlerts();Store.save();UI.refreshAll()},
 resetView(){State.rotY=.65;State.rotX=.15;State.zoom=.95;State.vy=0},
 mutate(fn,msg,id){const before=Store.capture();fn();Store.ensureSlots();Store.addUndo(before);Data.syncAlerts();World.rebuild(false);UI.refreshAll();Store.save();if(msg)UI.log(msg,'',id)},
 async newProject(name,group,deadline){
  if(name===undefined){name=(await input({command:'project init --name',label:L('Nama proyek?'),placeholder:'project-name'})||'').trim();if(!name)return;group=(await input({command:'project init --group',label:'Group',value:'Umum',placeholder:'group'})||'Umum').trim();deadline=(await input({command:'project init --deadline',label:L('Deadline YYYY-MM-DD, kosongkan jika tidak ada'),placeholder:'YYYY-MM-DD'})||'').trim()}
  name=String(name||'').trim();group=String(group||'Umum').trim()||'Umum';if(!name)return;
  if(Store.projects.length>=CONFIG.limits.maxProjects){UI.log('proyek baru gagal · batas jumlah tercapai','c');return}
  if(name.length>CONFIG.limits.maxNameLength||group.length>CONFIG.limits.maxGroupLength){UI.log('proyek baru gagal · teks terlalu panjang','c');return}
  if(deadline&&!Store.validDate(deadline)){UI.log(L('proyek baru gagal · tanggal tidak valid'),'c');return}
  const p={id:'p'+Date.now().toString(36)+Math.floor(Math.random()*999),name,group,deadline:deadline||'',seed:U.hash(name+Date.now()),slots:{},tasks:[]};
  this.mutate(()=>Store.projects.push(p),L('proyek baru: ')+name,p.id);this.select(p.id)},
 addTask(p,title,due){title=String(title||'').trim();if(!p||!title)return;if(p.tasks.length>=CONFIG.limits.maxTasksPerProject||Store.projects.reduce((n,x)=>n+x.tasks.length,0)>=CONFIG.limits.maxTotalTasks){UI.log('task gagal · batas jumlah tercapai','c',p&&p.id);return}if(title.length>CONFIG.limits.maxTaskTitleLength){UI.log('task gagal · teks terlalu panjang','c',p.id);return}if(due&&!Store.validDate(due)){UI.log(L('task gagal · tanggal tidak valid'),'c',p.id);return}this.mutate(()=>p.tasks.push({title,due:due||'',done:false}),'task ditambah: '+title,p.id);this.select(p.id)},
 toggleTask(p,i){if(!p||!p.tasks[i])return;const t=p.tasks[i],next=!t.done;this.mutate(()=>{t.done=next},(next?L('task selesai: '):'task dibuka: ')+t.title,p.id);State.pulses.push({id:p.id,t:State.time});this.select(p.id)},
 async editTask(p,i){const t=p.tasks[i];if(!t)return;const title=await input({command:'task edit --title',label:L('Judul task'),value:t.title});if(title===null)return;const due=await input({command:'task edit --due',label:L('Due YYYY-MM-DD (kosongkan untuk hapus)'),value:t.due||'',placeholder:'YYYY-MM-DD'});if(due===null)return;
   if(title.trim().length>CONFIG.limits.maxTaskTitleLength){UI.log('edit task gagal · teks terlalu panjang','c');return}if(due&&!Store.validDate(due)){UI.log(L('edit task gagal · tanggal tidak valid'),'c');return}this.mutate(()=>{t.title=title.trim()||t.title;t.due=due},'task diubah: '+t.title,p.id);this.select(p.id)},
 deleteTask(p,i){if(!p||!p.tasks[i])return;const title=p.tasks[i].title;this.mutate(()=>p.tasks.splice(i,1),'task dihapus: '+title,p.id);this.select(p.id)},
 async rename(p){const n=await input({command:'project edit --name',label:L('Nama proyek'),value:p.name});if(n===null||!n.trim())return;if(n.trim().length>CONFIG.limits.maxNameLength){UI.log('rename gagal · teks terlalu panjang','c');return}this.mutate(()=>p.name=n.trim(),L('proyek diubah: nama'),p.id);this.select(p.id)},
 async group(p){const n=await input({command:'project edit --group',label:'Group',value:p.group});if(n===null||!n.trim())return;if(n.trim().length>CONFIG.limits.maxGroupLength){UI.log('group gagal · teks terlalu panjang','c');return}this.mutate(()=>p.group=n.trim(),L('proyek diubah: group'),p.id);this.select(p.id)},
 async deadline(p){const n=await input({command:'project edit --deadline',label:L('Deadline YYYY-MM-DD (kosongkan untuk hapus)'),value:p.deadline||'',placeholder:'YYYY-MM-DD'});if(n===null)return;if(n&&!Store.validDate(n)){UI.log(L('deadline gagal · tanggal tidak valid'),'c',p.id);return}this.mutate(()=>p.deadline=n,L('proyek diubah: deadline'),p.id);this.select(p.id)},
 allDone(p){this.mutate(()=>p.tasks.forEach(t=>t.done=true),L('semua task selesai'),p.id);this.select(p.id)},
 async deleteProject(p){if(!p||!(await confirmAction({command:'project delete '+p.name,label:L('Hapus proyek "')+p.name+L('" beserta task?'),details:'This operation removes the project and every task inside it.',confirmLabel:'ENTER / DELETE'})))return;const n=p.name;this.mutate(()=>{const i=Store.projects.indexOf(p);if(i>=0)Store.projects.splice(i,1);if(State.selected===p.id)State.selected=''},L('proyek dihapus: ')+n)},
 undo(){if(!Store.undo.length)return;Store.redo.push(Store.capture());Store.applySnapshot(Store.undo.pop());UI.log('undo')},
 redo(){if(!Store.redo.length)return;Store.undo.push(Store.capture());Store.applySnapshot(Store.redo.pop());UI.log('redo')},
 async loadSample(){const D=n=>{const d=Store.today();d.setDate(d.getDate()+n);return Store.fmt(d)},
  mk=(id,name,group,ds,ts)=>({id,name,group,deadline:D(ds),seed:U.hash(id),slots:{},tasks:ts.map(x=>({title:x[0],done:x[1],due:D(x[2])}))});
  const sample=[mk('s1','Website','Work',5,[['Plan',true,-4],['Build',false,1],['Launch',false,5]]),mk('s2','Study Plan','School',12,[['Read notes',true,-2],['Practice',false,6],['Exam',false,12]]),mk('s3','Side Project','Personal',25,[['Idea',true,-6],['Prototype',false,10],['Share',false,25]])];
  if(Store.projects.length&&!await confirmAction({command:'dataset load --sample',label:L('Ganti semua proyek dengan sample?'),details:'This replaces the current local dataset.',confirmLabel:'ENTER / REPLACE'}))return;
  const before=Store.capture();Store.projects=sample;Store.addUndo(before);Store.ensureSlots();World.rebuild(false);UI.refreshAll();Store.save();UI.log('load sample · '+sample.length+L(' proyek'))},
 exportJSON(){this.download('neotask-projects-'+Store.fmt(new Date())+'.json',JSON.stringify({projects:Store.projects},null,2),'application/json');UI.log('export json · '+Store.projects.length+L(' proyek'))},
 exportCSV(){const q=v=>{const s=String(v==null?'':v),safe=/^\s*[=+\-@]/.test(s)?"'"+s:s;return'"'+safe.replace(/"/g,'""')+'"'},rows=[['project','group','project_deadline','task','task_due','done'].join(',')];
  Store.projects.forEach(p=>{if(!p.tasks.length)rows.push([q(p.name),q(p.group),q(p.deadline),'','',''].join(','));p.tasks.forEach(t=>rows.push([q(p.name),q(p.group),q(p.deadline),q(t.title),q(t.due),t.done?1:0].join(',')))});
  this.download('neotask-tasks-'+Store.fmt(new Date())+'.csv',rows.join('\n'),'text/csv');UI.log('export csv · '+(rows.length-1)+L(' baris'))},
 download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)},
 snap(){R.cv.toBlob(b=>this.download('neotask-map-'+Date.now()+'.png',b,'image/png'));UI.log('snapshot png')},
 importTooLarge(){setImportError('The selected JSON file is too large.','maximum size: '+Math.round(CONFIG.limits.importBytes/1024/1024)+' MB');UI.log('import gagal · file terlalu besar','c');return false},
 async importJSON(txt){
  setBusy(true,'IMPORT JSON');clearImportError()
  try{
   if(String(txt||'').length>CONFIG.limits.importBytes)return this.importTooLarge();let n;try{n=Store.norm(JSON.parse(txt))}catch(e){n=null}
   if(!n){setImportError(L('import gagal · JSON tidak valid atau melebihi batas'),'expected a NeoTask export with a valid projects array.');UI.log(L('import gagal · JSON tidak valid atau melebihi batas'),'c');return false}
   if(Store.projects.length&&!await confirmAction({command:'dataset import --replace',label:L('Ganti semua proyek dengan isi import?'),details:'This replaces the current local dataset.',confirmLabel:'ENTER / REPLACE'}))return false;
   const before=Store.capture();Store.projects=n;Store.ensureSlots();Store.addUndo(before);World.rebuild(false);UI.refreshAll();Store.save();UI.log('import '+n.length+L(' proyek'));return true
  }finally{setBusy(false)}
 },
 getSnapshot(){return{projects:deep(Store.projects),scene:State.scene,layer:State.layer,threshold:State.threshold}},
 setData(p){const n=Store.norm(p);if(!n)return false;Store.projects=n;Store.ensureSlots();World.rebuild(true);UI.refreshAll();Store.save();return true},
 selectNext(dir){const a=World.buildings;if(!a.length)return;let i=Math.max(0,a.findIndex(b=>b.p.id===State.selected));i=(i+(dir>0?1:-1)+a.length)%a.length;this.select(a[i].p.id)}
};
