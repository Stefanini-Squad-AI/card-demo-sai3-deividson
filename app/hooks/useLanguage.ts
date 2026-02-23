import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  loginLanguageOptions,
  loginTranslations,
  type LoginLanguageCode,
} from '~/data/locales/login';

const STORAGE_KEY = 'loginPage.language';
const DEFAULT_LANGUAGE: LoginLanguageCode = 'es';

const isSupportedLanguage = (value: string | null): value is LoginLanguageCode =>
  value === 'es' || value === 'en';

const readStoredLanguage = (fallback: LoginLanguageCode): LoginLanguageCode => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(storedValue)) {
      return storedValue;
    }
  } catch (error) {
    console.warn('Unable to read stored login language preference', error);
  }

  return fallback;
};

const listeners = new Set<() => void>();
let cachedLanguage: LoginLanguageCode | null = null;

const ensureLanguage = (initial?: LoginLanguageCode) => {
  if (cachedLanguage) {
    return cachedLanguage;
  }

  cachedLanguage = readStoredLanguage(initial ?? DEFAULT_LANGUAGE);
  return cachedLanguage;
};

const persistLanguage = (language: LoginLanguageCode) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.warn('Unable to persist login language preference', error);
  }
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export function useLanguage(initialLanguage?: LoginLanguageCode) {
  ensureLanguage(initialLanguage);

  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }, []);

  const language = useSyncExternalStore(
    subscribe,
    () => cachedLanguage ?? ensureLanguage(initialLanguage),
    () => DEFAULT_LANGUAGE
  );

  const setLanguage = useCallback((nextLanguage: LoginLanguageCode) => {
    if (nextLanguage === cachedLanguage) {
      return;
    }

    cachedLanguage = nextLanguage;
    persistLanguage(nextLanguage);
    notifyListeners();
  }, []);

  const translation = useMemo(
    () => loginTranslations[language],
    [language]
  );

  return {
    language,
    setLanguage,
    translation,
    languageOptions: loginLanguageOptions,
  } as const;
}
