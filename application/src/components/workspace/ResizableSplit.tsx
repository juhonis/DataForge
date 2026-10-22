/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  clampPanelWidth,
  DEFAULT_PANEL_WIDTH,
  getPanelWidthBounds,
  loadPanelWidth,
  savePanelWidth,
} from '../../lib/panelWidth';

const DESKTOP_QUERY = '(min-width: 1024px)';
const KEYBOARD_STEP = 16;
const KEYBOARD_LARGE_STEP = 64;

const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = () => setIsDesktop(query.matches);

    handleChange();
    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
};

interface ResizableSplitProps {
  configuration: React.ReactNode;
  output: React.ReactNode;
  isConfigurationOpen: boolean;
  onConfigurationClose: () => void;
}

export const ResizableSplit: React.FC<ResizableSplitProps> = ({
  configuration,
  output,
  isConfigurationOpen,
  onConfigurationClose,
}) => {
  const isDesktop = useIsDesktop();
  const [panelWidth, setPanelWidth] = useState(loadPanelWidth);
  const [workspaceWidth, setWorkspaceWidth] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => savePanelWidth(panelWidth), 150);

    return () => clearTimeout(timeoutId);
  }, [panelWidth]);

  useEffect(() => {
    if (!isDesktop) return;

    const workspace = workspaceRef.current;

    if (!workspace) return;

    const measure = () =>
      setWorkspaceWidth(workspace.getBoundingClientRect().width);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(workspace);

    return () => observer.disconnect();
  }, [isDesktop]);

  useEffect(
    () => () => {
      dragCleanupRef.current?.();
    },
    [],
  );

  useEffect(() => {
    if (isDesktop || !isConfigurationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onConfigurationClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, isConfigurationOpen, onConfigurationClose]);

  const updatePanelWidth = useCallback(
    (width: number) => {
      setPanelWidth(clampPanelWidth(width, workspaceWidth));
    },
    [workspaceWidth],
  );

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();

    const startX = event.clientX;
    const startWidth = clampPanelWidth(panelWidth, workspaceWidth);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updatePanelWidth(
        startWidth + moveEvent.clientX - startX,
      );
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
      dragCleanupRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', cleanup, { once: true });
    window.addEventListener('pointercancel', cleanup);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    dragCleanupRef.current = cleanup;
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const bounds = getPanelWidthBounds(workspaceWidth);
    const currentWidth = clampPanelWidth(panelWidth, workspaceWidth);
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
    let nextWidth: number | null = null;

    if (event.key === 'ArrowLeft') {
      nextWidth = currentWidth - step;
    } else if (event.key === 'ArrowRight') {
      nextWidth = currentWidth + step;
    } else if (event.key === 'Home') {
      nextWidth = bounds.min;
    } else if (event.key === 'End') {
      nextWidth = bounds.max;
    }

    if (nextWidth === null) return;

    event.preventDefault();
    updatePanelWidth(nextWidth);
  };

  const bounds = getPanelWidthBounds(workspaceWidth);
  const effectiveWidth = clampPanelWidth(panelWidth, workspaceWidth);

  if (!isDesktop) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isConfigurationOpen && (
          <button
            type="button"
            aria-label="Close product configuration"
            onClick={onConfigurationClose}
            className="fixed inset-0 z-30 bg-overlay"
          />
        )}

        <aside
          id="configuration-pane"
          aria-label="Product configuration"
          className={`${
            isConfigurationOpen ? 'flex' : 'hidden'
          } fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] flex-col overflow-hidden border-r border-border bg-surface`}
        >
          {configuration}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {output}
        </main>
      </div>
    );
  }

  return (
    <div
      ref={workspaceRef}
      className="flex min-h-0 flex-1 overflow-hidden"
    >
      <aside
        id="configuration-pane"
        aria-label="Product configuration"
        style={{ width: effectiveWidth }}
        className="flex min-h-0 shrink-0 flex-col overflow-hidden bg-surface"
      >
        {configuration}
      </aside>

      <div
        role="separator"
        aria-label="Resize configuration panel"
        aria-controls="configuration-pane"
        aria-orientation="vertical"
        aria-valuemin={bounds.min}
        aria-valuemax={bounds.max}
        aria-valuenow={effectiveWidth}
        aria-valuetext={`${effectiveWidth} pixels`}
        tabIndex={0}
        title="Drag to resize. Double-click to reset."
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => updatePanelWidth(DEFAULT_PANEL_WIDTH)}
        className="group relative z-10 w-2 shrink-0 cursor-col-resize touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-accent group-focus-visible:bg-accent" />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {output}
      </main>
    </div>
  );
};

ResizableSplit.displayName = 'ResizableSplit';
/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
