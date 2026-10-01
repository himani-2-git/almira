import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './today.css'
import './profile.css'
import './help.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => undefined)
  })
}
