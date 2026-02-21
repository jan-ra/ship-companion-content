import { create } from 'zustand';

const STORAGE_KEY = 'ship-companion-prefs';

interface Preferences {
  devMode: boolean;
}

interface PreferencesStore extends Preferences {
  setDevMode: (enabled: boolean) => void;
}

function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return { devMode: false };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { devMode: false };
}

function savePreferences(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  ...loadPreferences(),

  setDevMode: (enabled) => set((state) => {
    const next = { ...state, devMode: enabled };
    savePreferences({ devMode: next.devMode });
    return next;
  }),
}));

export function useDevMode(): boolean {
  return usePreferencesStore((s) => s.devMode);
}
