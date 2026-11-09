import{createRoot}from'react-dom/client'
import'./styles.css'
import{UI}from'./engine/core.js'
import{L}from'./engine/i18n.js'
import{Store}from'./engine/store.js'
import{initEngine}from'./engine/runtime.js'
import{installBridge}from'./ui/bridge.js'
import App from'./App.jsx'

installBridge()
initEngine()
UI.ready=true
UI.refreshAll(true)
UI.log('NeoTask online · '+Store.projects.length+L(' proyek'))
createRoot(document.getElementById('root')).render(<App/>)
