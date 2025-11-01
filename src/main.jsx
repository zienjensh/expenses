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
        immediate: true,
        onNeedRefresh() {
          console.log('New content available, please refresh.');
        },
        onOfflineReady() {
          console.log('✅ App ready to work offline');
          // Show a subtle toast notification
          if (window.toast) {
            window.toast.success('التطبيق جاهز للعمل بدون إنترنت', { duration: 2000 });
          }
        },
        onRegistered(registration) {
          console.log('✅ Service Worker registered successfully:', registration);
        },
        onRegisterError(error) {
          console.error('❌ Service Worker registration error:', error);
        }
      });
      
      // Log registration status
      console.log('PWA Service Worker registration initiated');
    } catch (error) {
      console.error('❌ PWA registration error:', error);
    }
  });
  
  // Also try to register immediately (for faster activation)
  (async () => {
    try {
      const { registerSW } = await import('virtual:pwa-register');
      registerSW({ immediate: true });
    } catch (e) {
      // Ignore if already registered
    }
  })();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

