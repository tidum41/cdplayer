import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * When running inside a Framer embed (or any iframe), hide the system cursor
 * so Framer's custom cursor element shows through without a double-cursor.
 * Drag functionality is unaffected — pointer events fire regardless of cursor CSS.
 */
if (typeof window !== 'undefined' && window.self !== window.top) {
  const style = document.createElement('style');
  style.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(style);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
