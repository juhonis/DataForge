import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORY_TEMPLATES } from '../core/categories';
import { CategoryTemplate, Brand } from '../types/product';
import { 
  Plus, 
  Trash2, 
  Package, 
  Tag, 
  ChevronDown, 
  ChevronRight,
  Check,
  RefreshCw,
  Edit3,
  Save,
  X
} from 'lucide-react';

export const EcommerceSidebar: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    brands,
    selectedBrands,
    addBrand,
    removeBrand,
    updateBrand,
    resetBrands,
    toggleBrand,
    selectAllBrands,
    deselectAllBrands,
  } = useStore();
  
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brands: true,
    attributes: true,
  });
  
  const handleAddBrand = () => {
    if (newBrandName.trim()) {
      addBrand(newBrandName.trim());
      setNewBrandName('');
    }
  };
  
  const startEditing = (brand: Brand) => {
    setEditingBrand(brand.id);
    setEditName(brand.name);
  };
  
  const saveEdit = () => {
    if (editingBrand && editName.trim()) {
      updateBrand(editingBrand, editName.trim());
      setEditingBrand(null);
      setEditName('');
    }
  };
  
  const cancelEdit = () => {
    setEditingBrand(null);
    setEditName('');
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
          <Package className="w-4 h-4 text-indigo-500" />
          Product Generator
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Category Section */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => toggleSection('category')}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Tag className="w-3 h-3" />
              Category
            </span>
            {expandedSections.category ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>
          
          {expandedSections.category && (
            <div className="px-5 pb-4 space-y-2">
              <select
                value={selectedCategory.id}
                onChange={(e) => {
                  const category = CATEGORY_TEMPLATES.find(c => c.id === e.target.value);
                  if (category) setSelectedCategory(category);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 ring-indigo-500 transition-all text-slate-200"
              >
                {CATEGORY_TEMPLATES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              
              <div className="pt-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">SKU Prefix</div>
                <div className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm font-mono text-indigo-400">
                  {selectedCategory.skuPrefix}-
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Brands Section */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Brands
            </span>
            {expandedSections.brands ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>
          
          {expandedSections.brands && (
            <div className="px-5 pb-4 space-y-3">
              {/* Add Brand */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New brand name..."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 transition-all text-slate-200 placeholder:text-slate-600"
                />
                <button
                  onClick={handleAddBrand}
                  disabled={!newBrandName.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Brand Actions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {selectedBrands.length} of {brands.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllBrands}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={deselectAllBrands}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    None
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={resetBrands}
                    className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Brand List */}
              <div className="space-y-1">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
                  >
                    <button
                      onClick={() => toggleBrand(brand.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedBrands.includes(brand.id)
                          ? 'bg-indigo-600 border-indigo-500'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {selectedBrands.includes(brand.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    
                    {editingBrand === brand.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          className="flex-1 bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm outline-none text-slate-200"
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-slate-300 truncate">
                          {brand.name}
                        </span>
                        <button
                          onClick={() => startEditing(brand)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeBrand(brand.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Attributes Section */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => toggleSection('attributes')}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Attributes
            </span>
            {expandedSections.attributes ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>
          
          {expandedSections.attributes && (
            <div className="px-5 pb-4">
              <div className="space-y-2">
                {selectedCategory.attributes.map((attr) => (
                  <div
                    key={attr.key}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="text-xs font-bold text-slate-300 mb-1">
                      {attr.label}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      {attr.type}
                    </div>
                    {attr.options && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {attr.options.slice(0, 5).map((opt) => (
                          <span
                            key={String(opt)}
                            className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400"
                          >
                            {String(opt)}
                          </span>
                        ))}
                        {attr.options.length > 5 && (
                          <span className="px-2 py-0.5 text-[10px] text-slate-500">
                            +{attr.options.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
