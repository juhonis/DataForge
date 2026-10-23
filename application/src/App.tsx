import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Package, Sun } from 'lucide-react';
import { OutputPanel, type DatasetTab } from './components/OutputPanel';
import { IconButton } from './components/ui';
import { ConfigurationPane } from './components/workspace/ConfigurationPane';
import { ResizableSplit } from './components/workspace/ResizableSplit';
import { generateDataset } from './core/generate';
import { generateProducts } from './core/generate/product';
import type { SqlDialect } from './core/exporters/sql';
import { SeededRng } from './core/rng';
import {
  initializeTheme,
  setTheme,
  type Theme,
} from './lib/theme';
import { useStore } from './store/useStore';

function App() {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const brands = useStore((state) => state.brands);
  const selectedBrands = useStore((state) => state.selectedBrands);
  const dataset = useStore((state) => state.dataset);
  const setDataset = useStore((state) => state.setDataset);
  const clearDataset = useStore((state) => state.clearDataset);
  const settings = useStore((state) => state.settings);
  const outputMapping = useStore((state) => state.outputMapping);

  const [activeTab, setActiveTab] = useState<DatasetTab>('products');
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgres');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(initializeTheme);

  const prevConfigRef = useRef('');

  useEffect(() => {
    const configSignature = JSON.stringify({
      category: selectedCategory.id,
      skuPrefix: selectedCategory.skuPrefix,
      idFormat: selectedCategory.idFormat,
      idPrefix: selectedCategory.idPrefix,
      brands: brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        selected: selectedBrands.includes(brand.id),
        selectedModels: brand.selectedModels,
        priceRange: brand.priceRange,
        modelPrices: brand.modelPrices,
      })),
      priceRange: selectedCategory.priceRange,
      attributes: selectedCategory.attributes.map((attribute) => ({
        key: attribute.key,
        type: attribute.type,
        options: attribute.options,
        min: attribute.min,
        max: attribute.max,
      })),
      seed: settings.seed,
      customerCount: settings.customerCount,
      ordersPerCustomer: settings.ordersPerCustomer,
      reviewCount: settings.reviewCount,
    });

    if (configSignature === prevConfigRef.current) return;

    prevConfigRef.current = configSignature;
    clearDataset();
  }, [
    selectedCategory,
    brands,
    selectedBrands,
    settings.seed,
    settings.customerCount,
    settings.ordersPerCustomer,
    settings.reviewCount,
    clearDataset,
  ]);

  useEffect(() => {
    if (dataset !== null || selectedBrands.length === 0 || isGenerating) return;

    const timeoutId = setTimeout(() => {
      const products = generateProducts(
        selectedCategory,
        brands,
        selectedBrands,
        1,
        new SeededRng(settings.seed),
      );

      setDataset({
        products,
        customers: [],
        orders: [],
        order_lines: [],
        reviews: [],
      });
      setIsPreviewMode(true);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [
    dataset,
    selectedCategory,
    brands,
    selectedBrands,
    settings.seed,
    isGenerating,
    setDataset,
  ]);

  const handleGenerate = () => {
    if (selectedBrands.length === 0) return;

    setIsGenerating(true);
    setIsPreviewMode(false);
    setActiveTab('products');

    setTimeout(() => {
      const data = generateDataset(
        selectedCategory,
        brands,
        selectedBrands,
        {
          productCount: settings.productCount,
          customerCount: settings.customerCount,
          ordersPerCustomer: settings.ordersPerCustomer,
          reviewCount: settings.reviewCount,
        },
        new SeededRng(settings.seed),
      );

      setDataset(data);
      setIsGenerating(false);
    }, 100);
  };

  const handleClear = () => {
    clearDataset();
    setIsPreviewMode(true);
    setActiveTab('products');
  };

  const handlePresetApplied = () => {
    setIsPreviewMode(true);
    setActiveTab('products');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  const selectedCount = selectedBrands.length;
  const canGenerate = selectedCount > 0;
  const isLoadingPreview =
    dataset === null && selectedBrands.length > 0 && !isGenerating;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-canvas text-text">
      <header className="z-10 flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton
            label={
              isConfigurationOpen
                ? 'Close product configuration'
                : 'Open product configuration'
            }
            aria-expanded={isConfigurationOpen}
            aria-controls="configuration-pane"
            onClick={() => setIsConfigurationOpen((open) => !open)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </IconButton>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent">
            <Package className="h-5 w-5 text-on-accent" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-text sm:text-lg">
              {selectedCategory.name}
            </h1>
            <p className="truncate text-xs text-muted">
              DataForge · {selectedCount} brand
              {selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        <IconButton
          label={
            theme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          aria-pressed={theme === 'dark'}
          onClick={toggleTheme}
          className="shrink-0 border border-border bg-surface"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </IconButton>
      </header>

      <ResizableSplit
        isConfigurationOpen={isConfigurationOpen}
        onConfigurationClose={() => setIsConfigurationOpen(false)}
        configuration={
          <ConfigurationPane
            isGenerating={isGenerating}
            canGenerate={canGenerate}
            isPreviewMode={isPreviewMode}
            onGenerate={handleGenerate}
            onClear={handleClear}
            onPresetApplied={handlePresetApplied}
            onClose={() => setIsConfigurationOpen(false)}
          />
        }
        output={
          <OutputPanel
            dataset={dataset}
            categorySlug={selectedCategory.slug}
            seed={settings.seed}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sqlDialect={sqlDialect}
            onSqlDialectChange={setSqlDialect}
            isPreviewMode={isPreviewMode}
            isLoadingPreview={isLoadingPreview}
            outputMapping={outputMapping}
          />
        }
      />
    </div>
  );
}

export default App;
