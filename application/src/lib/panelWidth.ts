export const DEFAULT_PANEL_WIDTH = 640;
export const MIN_PANEL_WIDTH = 340;
export const PANEL_WIDTH_RATIO = 0.5;
export const PANEL_WIDTH_STORAGE_KEY = 'dataforge-panel-width';

type PanelStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export interface PanelWidthBounds {
  min: number;
  max: number;
}

export const getPanelWidthBounds = (
  workspaceWidth: number,
): PanelWidthBounds => {
  if (!Number.isFinite(workspaceWidth) || workspaceWidth <= 0) {
    return { min: MIN_PANEL_WIDTH, max: DEFAULT_PANEL_WIDTH };
  }

  const max = Math.round(
    Math.max(MIN_PANEL_WIDTH, workspaceWidth * PANEL_WIDTH_RATIO),
  );

  return { min: Math.min(MIN_PANEL_WIDTH, max), max };
};

export const clampPanelWidth = (
  width: number,
  workspaceWidth: number,
): number => {
  const { min, max } = getPanelWidthBounds(workspaceWidth);
  const candidate = Number.isFinite(width) ? width : DEFAULT_PANEL_WIDTH;

  return Math.min(max, Math.max(min, Math.round(candidate)));
};

const normalizePanelWidth = (width: number): number =>
  Number.isFinite(width)
    ? Math.max(MIN_PANEL_WIDTH, Math.round(width))
    : DEFAULT_PANEL_WIDTH;

export const readPanelWidth = (storage: PanelStorage): number => {
  try {
    const stored = storage.getItem(PANEL_WIDTH_STORAGE_KEY);

    if (stored === null) return DEFAULT_PANEL_WIDTH;

    return normalizePanelWidth(Number(stored));
  } catch {
    return DEFAULT_PANEL_WIDTH;
  }
};

export const writePanelWidth = (
  storage: PanelStorage,
  width: number,
): boolean => {
  try {
    storage.setItem(
      PANEL_WIDTH_STORAGE_KEY,
      String(normalizePanelWidth(width)),
    );
    return true;
  } catch {
    return false;
  }
};

export const loadPanelWidth = (): number => {
  const storage = getStorage();

  return storage ? readPanelWidth(storage) : DEFAULT_PANEL_WIDTH;
};

export const savePanelWidth = (width: number): void => {
  const storage = getStorage();

  if (storage) writePanelWidth(storage, width);
};
