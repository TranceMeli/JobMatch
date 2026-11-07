import React from 'react'
import ReactDOM from 'react-dom/client'
import { Globals } from '@react-spring/web'
import App from './App'
import './styles/global.css'

// Swipe-Animationen (react-spring) bei reduzierter Bewegung überspringen
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  Globals.assign({ skipAnimation: true })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)