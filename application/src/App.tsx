import React, { useState } from 'react';
import { EcommerceSidebar } from './components/EcommerceSidebar';
import { useStore } from './store/useStore';
import { generateProducts, downloadJSON } from './core/productGenerator';
import { Play, Download, Copy, Database, Trash2, Package } from 'lucide-react';

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

  const handleGenerate = () => {
    if (selectedBrands.length === 0) return;
    
    setIsGenerating(true);
    // Small delay to show loading state
    setTimeout(() => {
      const data = generateProducts(selectedCategory, brands, selectedBrands, count);
      setProducts(data);
      setIsGenerating(false);
    }, 100);
  };

  const handleDownload = () => {
    if (products.length === 0) return;
    const filename = `${selectedCategory.slug}-products`;
    downloadJSON(products, filename);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
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
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      <EcommerceSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">{selectedCategory.name}</h1>
              <p className="text-xs text-slate-500">
                {selectedCount} brand{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quantity Presets */}
            <div className="flex items-center gap-2">
              {[5, 10, 25, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setCount(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    count === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-slate-500">Custom</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  className="w-12 bg-transparent outline-none text-sm font-bold text-indigo-400 text-center"
                  value={count}
                  onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Actions */}
            {products.length > 0 && (
              <button
                onClick={clearProducts}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 px-5 py-2 rounded-full font-bold transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Generate {count} Products
            </button>
          </div>
        </header>

        {/* Editor/Preview Surface */}
        <div className="flex-1 p-6 bg-slate-950 overflow-hidden">
          <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Output Header */}
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${products.length > 0 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {products.length > 0 ? `${products.length} Products Generated` : 'Ready to Generate'}
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

            {/* Stats Bar */}
            {stats && (
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
                <pre className="text-emerald-400/90 whitespace-pre-wrap">{JSON.stringify(products, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                  <Database className="w-12 h-12 opacity-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium opacity-40 uppercase tracking-widest mb-2">No Products Yet</p>
                    <p className="text-xs text-slate-600 max-w-xs">
                      Select brands and click "Generate" to create mock products for {selectedCategory.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;