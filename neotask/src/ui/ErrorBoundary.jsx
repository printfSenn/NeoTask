import{Component}from'react'
import SystemPage from'./SystemPage.jsx'

export default class ErrorBoundary extends Component{
 constructor(props){super(props);this.state={error:props.initialError||null}}
 static getDerivedStateFromError(error){return{error}}
 componentDidCatch(error,info){console.error('NeoTask runtime error',error,info)}
 render(){
  if(this.state.error)return <SystemPage code="500" title="RUNTIME ERROR" message="NeoTask hit an unexpected runtime error." details={this.state.error?.message||'Unknown error'} action="↻ RELOAD SYSTEM" onAction={()=>window.location.reload()}/>
  return this.props.children
 }
}
