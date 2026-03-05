import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { triggerUpdatePrompt } from './components/UpdatePrompt';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    triggerUpdatePrompt();
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// Make updateSW available globally for UpdatePrompt component
(window as any).__updateSW = updateSW;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
