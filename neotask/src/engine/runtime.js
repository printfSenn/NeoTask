import{State,UI,Viz}from'./core.js'
import{Store,Data}from'./store.js'
import{World}from'./world.js'
import{R}from'./renderer.js'
export const Cine={l:0,stop(){if(!State.cine)return;State.cine=false;UI.sync();State.zoom=.95;State.rotX=.15},
 toggle(){if(State.cine){this.stop();return}State.cine=true;State.ci=-1;State.cd=0;State.fx=0;State.fy=.1;State.fz=0;UI.sync()},
 tick(){const n=performance.now(),dt=Math.min(.1,(n-(this.l||n))/1000);this.l=n;
  const B=World.buildings.filter(b=>!b.complete&&b.open>0).sort((a,b)=>(a.next==null?1e9:a.next)-(b.next==null?1e9:b.next)).slice(0,4);let tg,zm=1.8;
  if(World.mode==='airport'&&State.flights.length&&State.fp){tg=State.fp.slice();zm=1.5}
  else if(World.mode==='metro'&&State.flights.length){const f=State.flights[State.flights.length-1];tg=[f.x+.3,.05,f.z+.07];zm=1.9}
  else if(B.length){State.cd-=dt;if(State.cd<=0){State.ci=(State.ci+1)%B.length;State.cd=7}const b=B[State.ci%B.length];tg=[b.cx,((b.y0||0)+(b.top||.1))*.5,b.cz];zm=2}
  else{tg=[0,.1,0];zm=1}
  const k=Math.min(1,dt*2.2);State.fx+=(tg[0]-State.fx)*k;State.fy+=(tg[1]-State.fy)*k;State.fz+=(tg[2]-State.fz)*k;
  State.zoom+=(zm-State.zoom)*Math.min(1,dt*1.2);State.rotX+=(.26+Math.sin(State.time*.2)*.06-State.rotX)*Math.min(1,dt);State.rotY+=.05*dt}};
export function initEngine(){
 Store.load();State.scene=Store.scene;State.layer=Store.layer;State.threshold=Store.threshold;
 World.rebuild(true);Data.syncAlerts()
}
export function startEngine(cv){
 R.init(cv);
 let last=0,vizT=0,raf=0;
 function loop(now){raf=requestAnimationFrame(loop);
  const dt=last?Math.min(.05,(now-last)/1000):.016;last=now;State.time+=dt;
  if(!State.dragging&&State.auto)State.rotY+=.0028*dt*60;
  if(!State.dragging&&!State.auto)State.rotY+=State.vy*dt*60;
  State.vy*=.95;State.pulses=State.pulses.filter(p=>State.time-p.t<1);
  State.fw+=((State.cine?1:0)-State.fw)*.04;if(State.cine)Cine.tick();
  World.stepMorph(now);
  vizT+=dt;if(vizT>.25){vizT=0;Viz.draw()}
  if(R.fit())R.render(dt)}
 raf=requestAnimationFrame(loop);
 const iv=setInterval(()=>{Data.syncAlerts();UI.stats();UI.list();Store.save()},1000);
 return()=>{cancelAnimationFrame(raf);clearInterval(iv)}
}
