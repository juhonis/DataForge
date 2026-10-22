import React, { useState } from 'react';
import {
  Package,
  Play,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PresetBar } from '../PresetBar';
import { AttributeSection } from '../sidebar/AttributeSection';
import { BrandSection } from '../sidebar/BrandSection';
import { CategorySection } from '../sidebar/CategorySection';
import { Button, IconButton } from '../ui';
import { GenerationPanel } from './GenerationPanel';

const CONFIGURATION_TABS = [
  { key: 'catalog', label: 'Catalog', icon: Package },
  { key: 'generation', label: 'Generation', icon: SlidersHorizontal },
] as const;

type ConfigurationTab = (typeof CONFIGURATION_TABS)[number]['key'];
type CatalogSection = 'category' | 'brands' | 'attributes';

interface ConfigurationPaneProps {
  isGenerating: boolean;
  canGenerate: boolean;
  isPreviewMode: boolean;
  onGenerate: () => void;
  onClear: () => void;
  onPresetApplied: () => void;
  onClose: () => void;
}

export const ConfigurationPane: React.FC<ConfigurationPaneProps> = ({
  isGenerating,
  canGenerate,
  isPreviewMode,
  onGenerate,
  onClear,
  onPresetApplied,
  onClose,
}) => {
  const settings = useStore((state) => state.settings);
  const [activeTab, setActiveTab] =
    useState<ConfigurationTab>('catalog');
  const [expandedSections, setExpandedSections] = useState<
    Record<CatalogSection, boolean>
  >({
    category: true,
    brands: true,
    attributes: true,
  });

  const toggleSection = (section: CatalogSection) => {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  const focusTab = (tab: ConfigurationTab) => {
    document.getElementById(`configuration-tab-${tab}`)?.focus();
  };

  const moveTab = (offset: number) => {
    const currentIndex = CONFIGURATION_TABS.findIndex(
      (tab) => tab.key === activeTab,
    );
    const nextIndex =
      (currentIndex + offset + CONFIGURATION_TABS.length) %
      CONFIGURATION_TABS.length;
    const nextTab = CONFIGURATION_TABS[nextIndex];

    setActiveTab(nextTab.key);
    focusTab(nextTab.key);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2 lg:hidden">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Configuration
        </span>
        <IconButton
          label="Close product configuration"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <PresetBar onPresetApplied={onPresetApplied} />

      <div
        role="tablist"
        aria-label="Configuration sections"
        className="flex shrink-0 border-b border-border bg-surface"
      >
        {CONFIGURATION_TABS.map((tab) => {
          const selected = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              id={`configuration-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`configuration-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  moveTab(1);
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  moveTab(-1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  setActiveTab(CONFIGURATION_TABS[0].key);
                  focusTab(CONFIGURATION_TABS[0].key);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  const lastTab =
                    CONFIGURATION_TABS[CONFIGURATION_TABS.length - 1];
                  setActiveTab(lastTab.key);
                  focusTab(lastTab.key);
                }
              }}
              className={`-mb-px flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                selected
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:bg-surface-muted hover:text-text'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id="configuration-panel-catalog"
        role="tabpanel"
        aria-labelledby="configuration-tab-catalog"
        tabIndex={0}
        hidden={activeTab !== 'catalog'}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto focus-visible:outline-none"
      >
        <CategorySection
          key="category"
          expanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        />

        <BrandSection
          expanded={expandedSections.brands}
          onToggle={() => toggleSection('brands')}
        />

        <AttributeSection
          expanded={expandedSections.attributes}
          onToggle={() => toggleSection('attributes')}
        />
      </div>

      <div
        id="configuration-panel-generation"
        role="tabpanel"
        aria-labelledby="configuration-tab-generation"
        tabIndex={0}
        hidden={activeTab !== 'generation'}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto focus-visible:outline-none"
      >
        <GenerationPanel />
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-3">
        <div className="flex gap-2">
          {!isPreviewMode && (
            <Button
              variant="plain"
              onClick={onClear}
              className="shrink-0 border border-border px-3 text-muted hover:border-danger/50 hover:bg-danger-muted hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}

          <Button
            variant="primary"
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="min-w-0 flex-1 whitespace-nowrap"
          >
            {isGenerating ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Generate {settings.productCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

ConfigurationPane.displayName = 'ConfigurationPane';
