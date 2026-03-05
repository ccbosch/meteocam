import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, ViewMode } from '@/types';

interface AppState {
  settings: AppSettings;
  currentView: ViewMode;
  isOnline: boolean;
  isInstallPromptVisible: boolean;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentView: (view: ViewMode) => void;
  setIsOnline: (isOnline: boolean) => void;
  setIsInstallPromptVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        defaultRefreshInterval: 15 * 60 * 1000,
        theme: 'auto',
        defaultView: 'grid',
        notificationsEnabled: false,
        weatherAlertsEnabled: false,
      },
      currentView: 'grid',
      isOnline: navigator.onLine,
      isInstallPromptVisible: false,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setCurrentView: (view) => set({ currentView: view }),
      setIsOnline: (isOnline) => set({ isOnline }),
      setIsInstallPromptVisible: (visible) => set({ isInstallPromptVisible: visible }),
    }),
    {
      name: 'meteocam-storage',
      partialize: (state) => ({
        settings: state.settings,
        currentView: state.currentView,
      }),
    }
  )
);
