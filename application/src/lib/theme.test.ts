import { describe, expect, it } from 'vitest';
import {
  isTheme,
  readTheme,
  THEME_STORAGE_KEY,
  writeTheme,
} from './theme';

const createStorage = (initial: string | null = null) => {
  let value = initial;

  return {
    getItem: (key: string) =>
      key === THEME_STORAGE_KEY ? value : null,
    setItem: (key: string, next: string) => {
      if (key === THEME_STORAGE_KEY) value = next;
    },
    read: () => value,
  };
};

describe('theme', () => {
  it('recognizes supported themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it('reads a stored dark theme', () => {
    expect(readTheme(createStorage('dark'))).toBe('dark');
  });

  it('falls back to light for missing or invalid values', () => {
    expect(readTheme(createStorage())).toBe('light');
    expect(readTheme(createStorage('system'))).toBe('light');
  });

  it('falls back to light when storage cannot be read', () => {
    const storage = createStorage('dark');

    storage.getItem = () => {
      throw new Error('unavailable');
    };

    expect(readTheme(storage)).toBe('light');
  });

  it('writes the selected theme', () => {
    const storage = createStorage();

    expect(writeTheme(storage, 'dark')).toBe(true);
    expect(storage.read()).toBe('dark');
    expect(writeTheme(storage, 'light')).toBe(true);
    expect(storage.read()).toBe('light');
  });

  it('reports write failures', () => {
    const storage = createStorage();

    storage.setItem = () => {
      throw new Error('unavailable');
    };

    expect(writeTheme(storage, 'dark')).toBe(false);
  });
});
