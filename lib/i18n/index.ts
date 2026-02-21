import type { LanguageCode } from '@/lib/types';
import { en } from './locales/en';
import { de } from './locales/de';
import { nl } from './locales/nl';
import { usePreferencesStore } from '@/lib/preferences-store';

const translations: Record<LanguageCode, typeof en> = { en, de, nl };

function resolvePath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return path;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== 'string') return path;
  return current;
}

function interpolate(str: string, values?: Record<string, string | number>): string {
  if (!values) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    const val = values[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

export function translate(
  lang: LanguageCode,
  key: string,
  values?: Record<string, string | number>
): string {
  const dict = translations[lang] ?? translations.en;
  const raw = resolvePath(dict as unknown as Record<string, unknown>, key);
  // Fallback to English if key not found in the requested language
  if (raw === key && lang !== 'en') {
    const enRaw = resolvePath(translations.en as unknown as Record<string, unknown>, key);
    return interpolate(enRaw, values);
  }
  return interpolate(raw, values);
}

export function useT() {
  const lang = usePreferencesStore((s) => s.uiLanguage);
  return {
    t: (key: string, values?: Record<string, string | number>) =>
      translate(lang, key, values),
    lang,
  };
}
