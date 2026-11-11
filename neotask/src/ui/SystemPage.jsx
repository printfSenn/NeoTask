export default function SystemPage({code='ERROR',title='SYSTEM ERROR',message='Something went wrong.',details,action='RELOAD SYSTEM',onAction}){
 return(<main className="systempage" role="main">
  <section className="systemcard" aria-labelledby="systemTitle">
   <div className="systemhead"><span>NEOTASK // {code}</span><span className="systemdot">● OFFLINE</span></div>
   <div className="systemprompt"><span>neo@task:~$</span> system status</div>
   <div className="systemcode">{code}</div>
   <h1 id="systemTitle">{title}</h1>
   <p>{message}</p>
   {details&&<pre>{details}</pre>}
   {onAction?<button className="systemaction" onClick={onAction}>{action}</button>:<a className="systemaction" href="/">{action}</a>}
  </section>
 </main>)
}

export function NotFound(){
 return(<SystemPage code="404" title="ROUTE NOT FOUND" message="The requested path does not exist in this workspace." details="status: 404\nroute: unknown\naction: return to dashboard" action="← RETURN TO DASHBOARD"/>)
}
