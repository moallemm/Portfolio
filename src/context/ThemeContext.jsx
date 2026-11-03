import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // The head script applies the saved theme before paint. Start with the same
  // React state as the static render, then synchronize the accessible control.
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (next) => {
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };
    const followSystem = (event) => {
      try { if (['light', 'dark'].includes(localStorage.getItem('theme'))) return; } catch { /* Optional storage. */ }
      apply(event.matches ? 'dark' : 'light');
    };
    const syncTab = (event) => {
      if (event.key === 'theme') apply(['light', 'dark'].includes(event.newValue) ? event.newValue : media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', followSystem);
    window.addEventListener('storage', syncTab);
    return () => {
      media.removeEventListener('change', followSystem);
      window.removeEventListener('storage', syncTab);
    };
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem('theme', next); } catch { /* Theme works without storage. */ }
    setTheme(next);
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
