import React, { useState, useEffect, useRef } from 'react';
import { EcommerceSidebar } from './components/EcommerceSidebar';
import { useStore } from './store/useStore';
import { generateProducts } from './core/generate/product';
import { toJson } from './core/exporters/json';
import { Play, Download, Copy, Database, Trash2, Package, Sparkles } from 'lucide-react';

const downloadText = (contents: string, filename: string, mimeType: string) => {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function App() {
  const {
    selectedCategory,
    brands,
    selectedBrands,
    products,
    setProducts,
    clearProducts,
  } = useStore();

  const [count, setCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  // Refs to track previous config for comparison
  const prevConfigRef = useRef('');

  // Real-time preview generation
  useEffect(() => {
    // Create a config signature from current state
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
    });

    // Only regenerate if config actually changed
    if (configSignature !== prevConfigRef.current) {
      prevConfigRef.current = configSignature;
      
      // Clear any existing generated products when config changes
      if (!isPreviewMode && products.length > 0) {
        clearProducts();
      }
      
      // Generate preview if we have selected brands
      if (selectedBrands.length > 0) {
        setIsLoadingPreview(true);
        // Small delay to prevent excessive re-renders
        const timeoutId = setTimeout(() => {
          const data = generateProducts(selectedCategory, brands, selectedBrands, 1);
          setProducts(data);
          setIsPreviewMode(true);
          setIsLoadingPreview(false);
        }, 150);
        
        return () => clearTimeout(timeoutId);
      } else if (products.length > 0) {
        clearProducts();
      }
    }
  }, [selectedCategory, brands, selectedBrands, selectedCategory.idFormat, selectedCategory.idPrefix]);

  const handleGenerate = () => {
    if (selectedBrands.length === 0) return;

    setIsGenerating(true);
    setIsPreviewMode(false);
    // Small delay to show loading state
    setTimeout(() => {
      const data = generateProducts(selectedCategory, brands, selectedBrands, count);
      setProducts(data);
      setIsGenerating(false);
    }, 100);
  };

  const handleDownload = () => {
    if (products.length === 0) return;
    const filename = `${selectedCategory.slug}-products.json`;
    downloadText(toJson(products), filename, 'application/json');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(toJson(products));
  };

  const selectedCount = selectedBrands.length;
  const canGenerate = selectedCount > 0;

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (products.length === 0) return null;

    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

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
                onClick={() => setCount(num)}
                className={`px-2 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  count === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <div className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">Custom</span>
              <input
                type="number"
                min={1}
                max={1000}
                className="w-10 lg:w-12 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
                value={count}
                onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          <div className="h-6 lg:h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isPreviewMode && products.length > 0 && (
              <button
                onClick={() => {
                  clearProducts();
                  setIsPreviewMode(true);
                }}
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
              <span>Generate {count}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <EcommerceSidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                <div className="flex gap-1">
                  <button
                    onClick={copyToClipboard}
                    disabled={products.length === 0}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={products.length === 0}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
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
                {products.length > 0 ? (
                  <div className="relative">
                    {isPreviewMode && (
                      <div className="absolute -top-2 -left-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Live Preview
                      </div>
                    )}
                    <pre className={`whitespace-pre-wrap ${isPreviewMode ? 'text-amber-400/90' : 'text-emerald-400/90'}`}>
                      {JSON.stringify(products, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <Database className="w-12 h-12 opacity-10" />
                    <div className="text-center">
                      <p className="text-sm font-medium opacity-40 uppercase tracking-widest mb-2">Select Brands to Preview</p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Select brands in the sidebar to see a live preview of your product configuration
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
