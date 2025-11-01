import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register service worker for PWA (handled by vite-plugin-pwa)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const { registerSW } = await import('virtual:pwa-register');
      const updateSW = registerSW({
        onNeedRefresh() {
          console.log('New content available, please refresh.');
        },
        onOfflineReady() {
          console.log('App ready to work offline');
        },
      });
    } catch (error) {
      console.log('PWA registration error:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

