import { describe, expect, it } from 'vitest';
import {
  clampPanelWidth,
  DEFAULT_PANEL_WIDTH,
  getPanelWidthBounds,
  MAX_PANEL_WIDTH,
  MIN_PANEL_WIDTH,
  PANEL_WIDTH_STORAGE_KEY,
  readPanelWidth,
  writePanelWidth,
} from './panelWidth';

const createStorage = (initial: string | null = null) => {
  let value = initial;

  return {
    getItem: (key: string) =>
      key === PANEL_WIDTH_STORAGE_KEY ? value : null,
    setItem: (key: string, next: string) => {
      if (key === PANEL_WIDTH_STORAGE_KEY) value = next;
    },
    read: () => value,
  };
};

describe('panelWidth', () => {
  it('uses absolute bounds before the workspace is measured', () => {
    expect(getPanelWidthBounds(0)).toEqual({
      min: MIN_PANEL_WIDTH,
      max: MAX_PANEL_WIDTH,
    });
  });

  it('caps the width at 55 percent of the workspace', () => {
    expect(getPanelWidthBounds(900)).toEqual({
      min: MIN_PANEL_WIDTH,
      max: 495,
    });
    expect(getPanelWidthBounds(800)).toEqual({
      min: MIN_PANEL_WIDTH,
      max: 440,
    });
  });

  it('never allows the absolute maximum to be exceeded', () => {
    expect(getPanelWidthBounds(2000)).toEqual({
      min: MIN_PANEL_WIDTH,
      max: MAX_PANEL_WIDTH,
    });
  });

  it('clamps values to the available bounds', () => {
    expect(clampPanelWidth(200, 1200)).toBe(MIN_PANEL_WIDTH);
    expect(clampPanelWidth(900, 800)).toBe(440);
    expect(clampPanelWidth(500, 1200)).toBe(500);
    expect(clampPanelWidth(Number.NaN, 1200)).toBe(DEFAULT_PANEL_WIDTH);
  });

  it('reads valid persisted widths', () => {
    expect(readPanelWidth(createStorage('520'))).toBe(520);
  });

  it('falls back for missing or invalid persisted widths', () => {
    expect(readPanelWidth(createStorage())).toBe(DEFAULT_PANEL_WIDTH);
    expect(readPanelWidth(createStorage('wide'))).toBe(DEFAULT_PANEL_WIDTH);
    expect(readPanelWidth(createStorage('10'))).toBe(MIN_PANEL_WIDTH);
    expect(readPanelWidth(createStorage('900'))).toBe(MAX_PANEL_WIDTH);
  });

  it('falls back when storage cannot be read', () => {
    const storage = createStorage('520');

    storage.getItem = () => {
      throw new Error('unavailable');
    };

    expect(readPanelWidth(storage)).toBe(DEFAULT_PANEL_WIDTH);
  });

  it('writes clamped widths', () => {
    const storage = createStorage();

    expect(writePanelWidth(storage, 500)).toBe(true);
    expect(storage.read()).toBe('500');
    expect(writePanelWidth(storage, 900)).toBe(true);
    expect(storage.read()).toBe(String(MAX_PANEL_WIDTH));
  });

  it('reports write failures', () => {
    const storage = createStorage();

    storage.setItem = () => {
      throw new Error('unavailable');
    };

    expect(writePanelWidth(storage, 500)).toBe(false);
  });
});
