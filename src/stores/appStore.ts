import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, ViewMode } from '@/types';

const detectLanguage = (): 'en' | 'fr' => {
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
};

interface AppState {
  settings: AppSettings;
  currentView: ViewMode;
  isOnline: boolean;
  isInstallPromptVisible: boolean;
  highlightedLocationId: string | null;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentView: (view: ViewMode) => void;
  setIsOnline: (isOnline: boolean) => void;
  setIsInstallPromptVisible: (visible: boolean) => void;
  setHighlightedLocationId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        language: detectLanguage(),
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        defaultRefreshInterval: 15 * 60 * 1000,
        theme: 'auto',
        defaultView: 'grid',
        locationSortBy: 'custom',
        notificationsEnabled: false,
        weatherAlertsEnabled: false,
      },
      currentView: 'grid',
      isOnline: navigator.onLine,
      isInstallPromptVisible: false,
      highlightedLocationId: null,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setCurrentView: (view) => set({ currentView: view }),
      setIsOnline: (isOnline) => set({ isOnline }),
      setIsInstallPromptVisible: (visible) => set({ isInstallPromptVisible: visible }),
      setHighlightedLocationId: (id) => set({ highlightedLocationId: id }),
    }),
    {
      name: 'meteocam-storage',
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<AppState>;
        return {
          ...currentState,
          ...typedPersisted,
          settings: {
            ...currentState.settings,
            ...typedPersisted.settings,
          },
        };
      },
      partialize: (state) => ({
        settings: state.settings,
        currentView: state.currentView,
      }),
    }
  )
);
