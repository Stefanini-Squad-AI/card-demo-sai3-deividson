import { useCallback, useEffect, useMemo, useState } from 'react';
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

export function useLanguage(initialLanguage?: LoginLanguageCode) {
  const [language, setLanguageState] = useState<LoginLanguageCode>(() =>
    readStoredLanguage(initialLanguage ?? DEFAULT_LANGUAGE)
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.warn('Unable to persist login language preference', error);
    }
  }, [language]);

  const setLanguage = useCallback((nextLanguage: LoginLanguageCode) => {
    if (nextLanguage === language) {
      return;
    }
    setLanguageState(nextLanguage);
  }, [language]);

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
