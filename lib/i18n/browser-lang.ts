import type { LanguageCode } from '@/lib/types';

const SUPPORTED: LanguageCode[] = ['en', 'de', 'nl'];

export function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';

  const prefs = Array.from(navigator.languages ?? [navigator.language]);
  for (const pref of prefs) {
    const base = pref.split('-')[0].toLowerCase() as LanguageCode;
    if (SUPPORTED.includes(base)) return base;
  }

  return 'en';
}
