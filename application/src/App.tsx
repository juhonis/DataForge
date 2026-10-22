import React, { useState, useEffect, useRef } from 'react';
import { EcommerceSidebar } from './components/EcommerceSidebar';
import { PresetBar } from './components/PresetBar';
import { NumberInput } from './components/ui';
import { useStore } from './store/useStore';
import { generateDataset } from './core/generate';
import { generateProducts } from './core/generate/product';
import { toCsv } from './core/exporters/csv';
import { toJson } from './core/exporters/json';
import { datasetToSql, type SqlDialect } from './core/exporters/sql';
import { SeededRng } from './core/rng';
import { roundMoney } from './core/money';
import { downloadText } from './lib/download';
import type { Dataset } from './types/dataset';
import {
  Play,
  Copy,
  Database,
  Trash2,
  Package,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  FileCode2,
} from 'lucide-react';

const DATASET_TABS = [
  { key: 'products', label: 'Products' },
  { key: 'customers', label: 'Customers' },
  { key: 'orders', label: 'Orders' },
  { key: 'order_lines', label: 'Order Lines' },
  { key: 'reviews', label: 'Reviews' },
] as const;

type DatasetTab = (typeof DATASET_TABS)[number]['key'];

const EMPTY_PRODUCTS: Dataset['products'] = [];
const EMPTY_ROWS: object[] = [];

function App() {
  const {
    selectedCategory,
    brands,
    selectedBrands,
    dataset,
    setDataset,
    clearDataset,
    settings,
    updateSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<DatasetTab>('products');
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgres');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Refs to track previous config for comparison
  const prevConfigRef = useRef('');

  // Clear the dataset whenever the generation config changes
  useEffect(() => {
    const configSignature = JSON.stringify({
      category: selectedCategory.id,
      skuPrefix: selectedCategory.skuPrefix,
      idFormat: selectedCategory.idFormat,
      idPrefix: selectedCategory.idPrefix,
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        selected: selectedBrands.includes(b.id),
        selectedModels: b.selectedModels,
        priceRange: b.priceRange,
        modelPrices: b.modelPrices,
      })),
      priceRange: selectedCategory.priceRange,
      attributes: selectedCategory.attributes.map(a => ({
        key: a.key,
        type: a.type,
        options: a.options,
        min: a.min,
        max: a.max,
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

  // Generate a one-product preview whenever no dataset is present
  useEffect(() => {
    if (dataset !== null) return;

    if (selectedBrands.length === 0) {
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(true);
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
      setIsLoadingPreview(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [dataset, selectedCategory, brands, selectedBrands, settings.seed, setDataset]);

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

  const activeRows = dataset ? dataset[activeTab] : EMPTY_ROWS;
  const activeTabLabel =
    DATASET_TABS.find((tab) => tab.key === activeTab)?.label ?? 'Dataset';

  const copyToClipboard = () => {
    if (activeRows.length === 0) return;
    navigator.clipboard.writeText(toJson(activeRows));
  };

  const handleDownloadCsv = () => {
    if (activeRows.length === 0) return;
    downloadText(
      toCsv(activeRows),
      `${selectedCategory.slug}-${activeTab}.csv`,
      'text/csv;charset=utf-8',
    );
  };

  const handleDownloadJson = () => {
    if (!dataset) return;
    downloadText(
      toJson(dataset),
      `${selectedCategory.slug}-dataset.json`,
      'application/json',
    );
  };

  const handleDownloadSql = () => {
    if (!dataset) return;
    downloadText(
      datasetToSql(dataset, { dialect: sqlDialect, seed: settings.seed }),
      `${selectedCategory.slug}-dataset-${sqlDialect}.sql`,
      'application/sql',
    );
  };

  const updateCustomerCount = (value: number) => {
    updateSettings({ customerCount: value });
  };

  const updateReviewCount = (value: number) => {
    updateSettings({ reviewCount: value });
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

  const products = dataset?.products ?? EMPTY_PRODUCTS;
  const selectedCount = selectedBrands.length;
  const canGenerate = selectedCount > 0;

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (products.length === 0) return null;

    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = roundMoney(
      prices.reduce((a, b) => a + b, 0) / prices.length,
    );

    const brandCounts = products.reduce((acc, p) => {
      acc[p.brand] = (acc[p.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      minPrice,
      maxPrice,
      avgPrice,
      brandCounts,
    };
  }, [products]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Bar - Full Width */}
      <header className="min-h-[64px] border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between px-4 lg:px-6 py-3 lg:py-0 bg-slate-900/50 backdrop-blur-md z-10 gap-3 lg:gap-4 shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-100 truncate">{selectedCategory.name}</h1>
            <p className="text-xs text-slate-500">
              {selectedCount} brand{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap">
          {/* Quantity Presets */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            {[5, 10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => updateSettings({ productCount: num })}
                className={`px-2 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.productCount === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">Custom</span>
              <NumberInput
                variant="bare"
                min={1}
                max={1000}
                integer
                className="w-10 lg:w-12 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
                value={settings.productCount}
                onValueChange={(productCount) =>
                  updateSettings({ productCount })
                }
              />
            </div>
          </div>

          {/* Related Data */}
          <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
            <label htmlFor="customer-count" className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">
              Customers
            </label>
            <NumberInput
              id="customer-count"
              variant="bare"
              min={0}
              max={1000}
              integer
              aria-label="Customer count"
              className="w-10 lg:w-12 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
              value={settings.customerCount}
              onValueChange={updateCustomerCount}
            />

            <div className="h-4 w-px bg-slate-700" />

            <label htmlFor="min-orders" className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">
              Orders/customer
            </label>
            <NumberInput
              id="min-orders"
              variant="bare"
              min={0}
              max={10}
              integer
              aria-label="Minimum orders per customer"
              className="w-8 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
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
              className="w-8 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
              value={settings.ordersPerCustomer.max}
              onValueChange={updateMaxOrders}
            />

            <div className="h-4 w-px bg-slate-700" />

            <label htmlFor="review-count" className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">
              Reviews
            </label>
            <NumberInput
              id="review-count"
              variant="bare"
              min={0}
              max={1000}
              integer
              aria-label="Review count"
              className="w-10 lg:w-12 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
              value={settings.reviewCount}
              onValueChange={updateReviewCount}
            />
          </div>

          <div className="h-6 lg:h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isPreviewMode && products.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-lg font-bold text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="flex items-center gap-1.5 lg:gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 px-4 lg:px-5 py-2 rounded-full font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 active:scale-95 whitespace-nowrap"
            >
              {isGenerating ? (
                <div className="w-3.5 lg:w-4 h-3.5 lg:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>Generate {settings.productCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <EcommerceSidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PresetBar onPresetApplied={handlePresetApplied} />

          {/* Editor/Preview Surface */}
          <div className="flex-1 p-6 bg-slate-950 overflow-hidden">
            <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
              {/* Output Header */}
              <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isLoadingPreview ? 'bg-amber-400' : 
                      products.length > 0 ? (isPreviewMode ? 'bg-amber-500' : 'bg-emerald-500') : 
                      'bg-slate-600'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {isLoadingPreview ? 'Updating Preview...' :
                       products.length > 0 ? (isPreviewMode ? 'Live Preview (1 Sample)' : `${products.length} Products Generated`) : 
                       'Ready to Generate'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyToClipboard}
                    disabled={activeRows.length === 0}
                    title="Copy active dataset as JSON"
                    aria-label="Copy active dataset as JSON"
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    disabled={activeRows.length === 0}
                    title="Download active dataset as CSV"
                    aria-label="Download active dataset as CSV"
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    disabled={!dataset}
                    title="Download full dataset as JSON"
                    aria-label="Download full dataset as JSON"
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileJson className="w-4 h-4" />
                  </button>
                  <select
                    value={sqlDialect}
                    onChange={(event) => setSqlDialect(event.target.value as SqlDialect)}
                    aria-label="SQL dialect"
                    className="bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold uppercase text-slate-400 px-1.5 py-1.5 outline-none"
                  >
                    <option value="postgres">Postgres</option>
                    <option value="mysql">MySQL</option>
                  </select>
                  <button
                    onClick={handleDownloadSql}
                    disabled={!dataset}
                    title="Download full dataset as SQL"
                    aria-label="Download full dataset as SQL"
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileCode2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dataset Tabs */}
              <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center gap-1 overflow-x-auto">
                {DATASET_TABS.map((tab) => {
                  const rows = dataset?.[tab.key];
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        activeTab === tab.key
                          ? 'bg-indigo-500/60'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {rows?.length ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stats Bar - Only show for generated products (not preview) */}
              {stats && !isPreviewMode && (
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-800/20">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Price Range:</span>
                      <span className="font-bold text-indigo-400">
                        ${stats.minPrice} - ${stats.maxPrice}
                      </span>
                      <span className="text-slate-600">(avg ${stats.avgPrice})</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Brands:</span>
                      <div className="flex gap-2">
                        {Object.entries(stats.brandCounts).map(([brand, count]) => (
                          <span key={brand} className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-300">
                            {brand}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Content */}
              <div className="flex-1 overflow-auto p-8 font-mono text-sm leading-relaxed custom-scrollbar">
                {activeRows.length > 0 ? (
                  <div className="relative">
                    {isPreviewMode && activeTab === 'products' && (
                      <div className="absolute -top-2 -left-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Live Preview
                      </div>
                    )}
                    <pre className={`whitespace-pre-wrap ${isPreviewMode ? 'text-amber-400/90' : 'text-emerald-400/90'}`}>
                      {toJson(activeRows)}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <Database className="w-12 h-12 opacity-10" />
                    <div className="text-center">
                      <p className="text-sm font-medium opacity-40 uppercase tracking-widest mb-2">
                        {dataset ? `No ${activeTabLabel} Data` : 'Select Brands to Preview'}
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        {dataset
                          ? 'Generate a full dataset to populate this tab.'
                          : 'Select brands in the sidebar to see a live preview of your product configuration'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
