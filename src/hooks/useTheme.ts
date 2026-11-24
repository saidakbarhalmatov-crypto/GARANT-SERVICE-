import { useCallback, useEffect, useState } from 'react';
import type { ThemeOption } from '../types';

const ALLOWED_THEMES: ThemeOption[] = ['dark', 'yellow', 'light', 'ocean', 'emerald', 'system'];
const STORAGE_KEY = 'garant-theme';
const memStorage: Record<string, string> = {};

function getStoredTheme(): ThemeOption {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = memStorage[STORAGE_KEY] || null;
  }
  if (raw && ALLOWED_THEMES.includes(raw as ThemeOption)) {
    return raw as ThemeOption;
  }
  return 'dark';
}

function saveStoredTheme(theme: ThemeOption) {
  memStorage[STORAGE_KEY] = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage errors in restricted environments
  }
}

function getThemeColor(actual: Exclude<ThemeOption, 'system'>): string {
  switch (actual) {
    case 'light':
      return '#f2f3f5';
    case 'ocean':
      return '#09171e';
    case 'emerald':
      return '#0d1914';
    case 'yellow':
      return '#17140c';
    default:
      return '#101114';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeOption>(() => getStoredTheme());

  useEffect(() => {
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

    const applyActualTheme = () => {
      const actual: Exclude<ThemeOption, 'system'> =
        theme === 'system' ? (media?.matches ? 'light' : 'dark') : theme;
      document.body.setAttribute('data-theme', actual);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', getThemeColor(actual));
      }
    };

    applyActualTheme();

    if (theme === 'system' && media && media.addEventListener) {
      media.addEventListener('change', applyActualTheme);
      return () => {
        media.removeEventListener('change', applyActualTheme);
      };
    }
    return undefined;
  }, [theme]);

  const setTheme = useCallback((nextTheme: string) => {
    const normalized: ThemeOption = ALLOWED_THEMES.includes(nextTheme as ThemeOption)
      ? (nextTheme as ThemeOption)
      : 'dark';
    saveStoredTheme(normalized);
    setThemeState(normalized);
  }, []);

  return { theme, setTheme };
}
