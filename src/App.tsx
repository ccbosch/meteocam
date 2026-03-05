import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeDefaultSettings } from '@/db/schema';
import { useAppStore } from '@/stores/appStore';
import { DialogProvider } from '@/components/DialogProvider';
import UpdatePrompt from '@/components/UpdatePrompt';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import SettingsPage from '@/components/SettingsPage';
import OfflineIndicator from '@/components/OfflineIndicator';

function App() {
  const { setIsOnline } = useAppStore();

  useEffect(() => {
    // Initialize database
    initializeDefaultSettings();

    // Setup online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  const handleUpdate = () => {
    const updateSW = (window as any).__updateSW;
    if (updateSW) {
      updateSW(true);
    }
  };

  return (
    <DialogProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <OfflineIndicator />
        </div>
      </Router>
      <UpdatePrompt onUpdate={handleUpdate} />
    </DialogProvider>
  );
}

export default App;
