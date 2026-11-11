export const CONFIG={
 points:50000,windowPitch:.02,rowPitch:.016,urgencyWindowDays:14,alertThreshold:.70,gridBase:3,
 limits:{importBytes:2*1024*1024,maxProjects:500,maxTasksPerProject:1000,maxTotalTasks:10000,maxNameLength:200,maxGroupLength:100,maxTaskTitleLength:300},
 scenes:['city','satellite','globe','ship','factory','airport','metro'],
 layers:[['true','TRUE'],['progress','PROGRESS'],['urgency','URGENCY'],['load','OPEN LOAD'],['risk','RISK']],
 palette:[[44,100,76],[70,135,108],[170,245,205],[205,255,228],[0,255,102],[40,205,95],[34,165,180],[255,60,80]],
 sceneCfg:{
  city:{taskH:.13,hMin:.5,hMax:1.35,types:['slab','tower','setback','podium','crown','spire']},
  satellite:{taskH:.11,hMin:.35,hMax:1.05,types:['station','dish','array']},
  globe:{taskH:.08,hMin:.12,hMax:.28,types:['region']},
  ship:{taskH:.075,hMin:.25,hMax:.8,types:['containers']},
  factory:{taskH:.1,hMin:.35,hMax:1.0,types:['hall','tank','silo']},
  airport:{taskH:.1,hMin:.3,hMax:1,types:['jet']},
  metro:{taskH:.1,hMin:.3,hMax:1,types:['stn']}
 }
};
export const U={
 $:id=>document.getElementById(id),
 cl:(v,a,b)=>Math.max(a,Math.min(b,v)),
 esc:s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 lerp:(a,b,t)=>a+(b-a)*t,
 rn:(a,b)=>a+Math.random()*(b-a),
 hash:s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0},
 rand:seed=>{let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}},
 ramp:t=>{t=U.cl(t,0,1);return t<.5?[U.lerp(0,255,t*2),U.lerp(200,220,t*2),U.lerp(90,60,t*2)]:[255,U.lerp(220,60,(t-.5)*2),U.lerp(60,70,(t-.5)*2)]}
};
export function deep(v){return JSON.parse(JSON.stringify(v))}
export const State={scene:'city',layer:'true',threshold:CONFIG.alertThreshold,selected:'',hover:'',auto:true,showTraffic:true,
 rotY:.65,rotX:.15,zoom:.95,vy:0,time:0,dragging:false,lx:0,ly:0,pulses:[],alerted:new Set(),alerts:0,flights:[],done:new Set(),fi:false,pm:'',cine:false,fw:0,fx:0,fy:0,fz:0,cd:0,ci:-1,fp:null,sceneFx:0,sceneFxFrom:0,sceneFxTo:0,sceneFxStart:0,sceneFxDuration:1.35,listeners:{select:[]}};
export const UI={ready:false,log(){},refreshAll(){},card(){},list(){},stats(){},sync(){}}
export const Viz={draw(){}}
