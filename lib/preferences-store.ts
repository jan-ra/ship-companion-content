import { create } from 'zustand';
import type { LanguageCode } from './types';
import { detectBrowserLanguage } from './i18n/browser-lang';

const STORAGE_KEY = 'ship-companion-prefs';

interface Preferences {
  devMode: boolean;
  uiLanguage: LanguageCode;
}

interface PreferencesStore extends Preferences {
  _hydrated: boolean;
  setDevMode: (enabled: boolean) => void;
  setUiLanguage: (lang: LanguageCode) => void;
  hydrate: () => void;
}

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.uiLanguage) {
        parsed.uiLanguage = detectBrowserLanguage();
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return { devMode: false, uiLanguage: detectBrowserLanguage() };
}

function savePreferences(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// Always start with SSR-safe defaults so server and client initial render match
const SSR_DEFAULTS: Preferences = { devMode: false, uiLanguage: 'en' };

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  ...SSR_DEFAULTS,
  _hydrated: false,

  hydrate: () => {
    const prefs = loadPreferences();
    set({ ...prefs, _hydrated: true });
  },

  setDevMode: (enabled) => set((state) => {
    const next = { ...state, devMode: enabled };
    savePreferences({ devMode: next.devMode, uiLanguage: next.uiLanguage });
    return next;
  }),

  setUiLanguage: (lang) => set((state) => {
    const next = { ...state, uiLanguage: lang };
    savePreferences({ devMode: next.devMode, uiLanguage: next.uiLanguage });
    return next;
  }),
}));

export function useDevMode(): boolean {
  return usePreferencesStore((s) => s.devMode);
}

export function useUiLanguage(): LanguageCode {
  return usePreferencesStore((s) => s.uiLanguage);
}
