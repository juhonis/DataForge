import { useEffect, useRef, useState } from 'react';
import { Menu, Package, Play, Trash2 } from 'lucide-react';
import { OutputPanel, type DatasetTab } from './components/OutputPanel';
import { PresetBar } from './components/PresetBar';
import { Sidebar } from './components/sidebar/Sidebar';
import { Button, IconButton, NumberInput } from './components/ui';
import { generateDataset } from './core/generate';
import { generateProducts } from './core/generate/product';
import type { SqlDialect } from './core/exporters/sql';
import { SeededRng } from './core/rng';
import { useStore } from './store/useStore';

function App() {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const brands = useStore((state) => state.brands);
  const selectedBrands = useStore((state) => state.selectedBrands);
  const dataset = useStore((state) => state.dataset);
  const setDataset = useStore((state) => state.setDataset);
  const clearDataset = useStore((state) => state.clearDataset);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const [activeTab, setActiveTab] = useState<DatasetTab>('products');
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgres');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const updateCustomerCount = (customerCount: number) => {
    updateSettings({ customerCount });
  };

  const updateReviewCount = (reviewCount: number) => {
    updateSettings({ reviewCount });
  };

  const updateMinOrders = (min: number) => {
    updateSettings({
      ordersPerCustomer: {
        min,
        max: Math.max(min, settings.ordersPerCustomer.max),
      },
    });
  };

  const updateMaxOrders = (max: number) => {
    updateSettings({
      ordersPerCustomer: {
        min: Math.min(max, settings.ordersPerCustomer.min),
        max,
      },
    });
  };

  const selectedCount = selectedBrands.length;
  const canGenerate = selectedCount > 0;
  const isLoadingPreview =
    dataset === null && selectedBrands.length > 0 && !isGenerating;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-950 text-slate-200">
      <header className="z-10 flex min-h-[64px] shrink-0 flex-col justify-between gap-3 border-b border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur-md lg:flex-row lg:items-center lg:gap-4 lg:px-6 lg:py-0">
        <div className="flex shrink-0 items-center gap-3">
          <IconButton
            label={
              isSidebarOpen
                ? 'Close product configuration'
                : 'Open product configuration'
            }
            aria-expanded={isSidebarOpen}
            aria-controls="configuration-sidebar"
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </IconButton>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-100">
              {selectedCategory.name}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedCount} brand{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:gap-4">
          <div className="flex items-center gap-1.5 lg:gap-2">
            {[5, 10, 25, 50, 100].map((count) => (
              <Button
                key={count}
                size="sm"
                variant={
                  settings.productCount === count ? 'primary' : 'secondary'
                }
                aria-pressed={settings.productCount === count}
                onClick={() => updateSettings({ productCount: count })}
                className="px-2 lg:px-3"
              >
                {count}
              </Button>
            ))}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1.5 lg:px-3">
              <span className="hidden text-[10px] font-bold uppercase text-slate-500 sm:inline">
                Custom
              </span>
              <NumberInput
                variant="bare"
                min={1}
                max={1000}
                integer
                aria-label="Custom product count"
                className="w-10 bg-transparent text-center text-sm font-bold text-indigo-400 lg:w-12"
                value={settings.productCount}
                onValueChange={(productCount) =>
                  updateSettings({ productCount })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1.5 lg:px-3">
            <label
              htmlFor="customer-count"
              className="hidden text-[10px] font-bold uppercase text-slate-500 sm:inline"
            >
              Customers
            </label>
            <NumberInput
              id="customer-count"
              variant="bare"
              min={0}
              max={1000}
              integer
              aria-label="Customer count"
              className="w-10 bg-transparent text-center text-sm font-bold text-indigo-400 lg:w-12"
              value={settings.customerCount}
              onValueChange={updateCustomerCount}
            />

            <div className="h-4 w-px bg-slate-700" />

            <label
              htmlFor="min-orders"
              className="hidden text-[10px] font-bold uppercase text-slate-500 sm:inline"
            >
              Orders/customer
            </label>
            <NumberInput
              id="min-orders"
              variant="bare"
              min={0}
              max={10}
              integer
              aria-label="Minimum orders per customer"
              className="w-8 bg-transparent text-center text-sm font-bold text-indigo-400"
              value={settings.ordersPerCustomer.min}
              onValueChange={updateMinOrders}
            />
            <span className="text-slate-600">–</span>
            <NumberInput
              variant="bare"
              min={0}
              max={10}
              integer
              aria-label="Maximum orders per customer"
              className="w-8 bg-transparent text-center text-sm font-bold text-indigo-400"
              value={settings.ordersPerCustomer.max}
              onValueChange={updateMaxOrders}
            />

            <div className="h-4 w-px bg-slate-700" />

            <label
              htmlFor="review-count"
              className="hidden text-[10px] font-bold uppercase text-slate-500 sm:inline"
            >
              Reviews
            </label>
            <NumberInput
              id="review-count"
              variant="bare"
              min={0}
              max={1000}
              integer
              aria-label="Review count"
              className="w-10 bg-transparent text-center text-sm font-bold text-indigo-400 lg:w-12"
              value={settings.reviewCount}
              onValueChange={updateReviewCount}
            />
          </div>

          <div className="hidden h-6 w-px bg-slate-800 sm:block lg:h-8" />

          <div className="flex items-center gap-2">
            {!isPreviewMode && (
              <Button
                variant="plain"
                onClick={handleClear}
                className="text-slate-400 hover:bg-red-400/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="!rounded-full whitespace-nowrap px-4 font-bold shadow-xl shadow-indigo-500/10 active:scale-95 lg:px-5"
            >
              {isGenerating ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white lg:h-4 lg:w-4" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
              <span>Generate {settings.productCount}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PresetBar onPresetApplied={handlePresetApplied} />

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
          />
        </main>
      </div>
    </div>
  );
}

export default App;
