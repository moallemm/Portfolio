import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { content } from '../data/content';

const LocaleContext = createContext(null);

export function getLocaleFromPath(pathname = '') {
  return /(?:^|\/)ar(?:\/|$)/i.test(pathname) ? 'ar' : 'en';
}

export function LocaleProvider({ children, initialLocale }) {
  const locale = initialLocale === 'ar' || initialLocale === 'en'
    ? initialLocale
    : getLocaleFromPath(typeof window === 'undefined' ? '' : window.location.pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo(() => ({ locale, t: content[locale], isArabic: locale === 'ar' }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider.');
  return context;
}
