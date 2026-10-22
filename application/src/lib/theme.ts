export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dataforge-theme';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark';

export const readTheme = (storage: ThemeStorage): Theme => {
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);

    return isTheme(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
};

export const writeTheme = (
  storage: ThemeStorage,
  theme: Theme,
): boolean => {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
};

export const initializeTheme = (): Theme => {
  const storage = getStorage();
  const theme = storage ? readTheme(storage) : 'light';

  applyTheme(theme);
  return theme;
};

export const setTheme = (theme: Theme): void => {
  const storage = getStorage();

  if (storage) writeTheme(storage, theme);

  applyTheme(theme);
};
