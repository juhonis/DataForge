import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { CategoryTemplate, Brand, AttributeDefinition } from '../types/product';
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
  X,
  Settings2,
  Hash,
  Type,
  List,
  Car,
  Layers,
} from 'lucide-react';
import {
  isValidPriceRange,
  normalizeAttributeKey,
  normalizeSkuPrefix,
  slugify,
} from '../core/normalize';

// Attribute type options
const ATTRIBUTE_TYPES = [
  { value: 'select', label: 'Select', icon: List },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'boolean', label: 'Yes/No', icon: Check },
  { value: 'text', label: 'Text', icon: Type },
] as const;

export const EcommerceSidebar: React.FC = () => {
  const {
    categories,
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
    updateCategory,
    addAttribute,
    updateAttribute,
    renameAttributeKey,
    removeAttribute,
    addAttributeOption,
    removeAttributeOption,
    addBrandModel,
    removeBrandModel,
    updateBrandModel,
    toggleBrandModel,
    selectAllBrandModels,
    deselectAllBrandModels,
    updateCategoryPriceRange,
    updateBrandPriceRange,
    removeBrandPriceRange,
    setModelPrice,
    removeModelPrice,
} = useStore();

  // Brand state
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editingBrandModels, setEditingBrandModels] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [editingModel, setEditingModel] = useState<{ brandId: string; model: string } | null>(null);
  const [editModelName, setEditModelName] = useState('');
  
  // Attribute state
  const [editingAttr, setEditingAttr] = useState<string | null>(null);
  const [editAttrKey, setEditAttrKey] = useState('');
  const [editAttrType, setEditAttrType] = useState<AttributeDefinition['type']>('select');
  const [editAttrMin, setEditAttrMin] = useState<number>(0);
  const [editAttrMax, setEditAttrMax] = useState<number>(100);
  const [newOption, setNewOption] = useState('');
  const [addingAttr, setAddingAttr] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  
  // Category edit state
  const [editingCategory, setEditingCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editSkuPrefix, setEditSkuPrefix] = useState('');
  const [editIdFormat, setEditIdFormat] = useState<'uuid' | 'sequential' | 'custom'>('uuid');
  const [editIdPrefix, setEditIdPrefix] = useState('');
  
  // Expand/collapse sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    pricing: true,
    brands: true,
  });
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  
  // Price editing state
  const [editingCategoryPrice, setEditingCategoryPrice] = useState(false);
  const [editCatPriceMin, setEditCatPriceMin] = useState(selectedCategory.priceRange.min);
  const [editCatPriceMax, setEditCatPriceMax] = useState(selectedCategory.priceRange.max);
  const [editingBrandPrice, setEditingBrandPrice] = useState<string | null>(null);
  const [editBrandPriceMin, setEditBrandPriceMin] = useState<number>(0);
  const [editBrandPriceMax, setEditBrandPriceMax] = useState<number>(1000);
  const [editingModelPrice, setEditingModelPrice] = useState<{ brandId: string; model: string } | null>(null);
  const [editModelPrice, setEditModelPrice] = useState<number>(0);

  const handleAddBrand = () => {
    if (newBrandName.trim()) {
      addBrand(newBrandName.trim());
      setNewBrandName('');
    }
  };

  const startEditingBrand = (brand: Brand) => {
    setEditingBrand(brand.id);
    setEditName(brand.name);
  };

  const saveBrandEdit = () => {
    if (editingBrand && editName.trim()) {
      updateBrand(editingBrand, editName.trim());
      setEditingBrand(null);
      setEditName('');
    }
  };

  const cancelBrandEdit = () => {
    setEditingBrand(null);
    setEditName('');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBrandExpand = (brandId: string) => {
    setExpandedBrands(prev => ({ ...prev, [brandId]: !prev[brandId] }));
  };

  const startEditingCategory = () => {
    setEditingCategory(true);
    setEditCategoryName(selectedCategory.name);
    setEditSkuPrefix(selectedCategory.skuPrefix);
    setEditIdFormat(selectedCategory.idFormat || 'uuid');
    setEditIdPrefix(selectedCategory.idPrefix || '');
  };

  const saveCategoryEdit = () => {
    if (editCategoryName.trim() && editSkuPrefix.trim()) {
      const updates: Partial<CategoryTemplate> = {
        name: editCategoryName.trim(),
        skuPrefix: editSkuPrefix,
        slug: slugify(editCategoryName),
        idFormat: editIdFormat,
      };
      if (editIdFormat === 'custom') {
        updates.idPrefix = editIdPrefix;
      }
      updateCategory(selectedCategory.id, updates);
      setEditingCategory(false);
    }
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(false);
    setEditCategoryName('');
    setEditSkuPrefix('');
    setEditIdFormat('uuid');
    setEditIdPrefix('');
  };

  // Price editing handlers
  const startEditingCategoryPrice = () => {
    setEditingCategoryPrice(true);
    setEditCatPriceMin(selectedCategory.priceRange.min);
    setEditCatPriceMax(selectedCategory.priceRange.max);
  };

  const saveCategoryPriceEdit = () => {
    if (isValidPriceRange(editCatPriceMin, editCatPriceMax)) {
      updateCategoryPriceRange(selectedCategory.id, editCatPriceMin, editCatPriceMax);
      setEditingCategoryPrice(false);
    }
  };

  const cancelCategoryPriceEdit = () => {
    setEditingCategoryPrice(false);
  };

  const startEditingBrandPrice = (brand: Brand) => {
    setEditingBrandPrice(brand.id);
    setEditBrandPriceMin(brand.priceRange?.min ?? selectedCategory.priceRange.min);
    setEditBrandPriceMax(brand.priceRange?.max ?? selectedCategory.priceRange.max);
  };

  const saveBrandPriceEdit = (brandId: string) => {
    if (isValidPriceRange(editBrandPriceMin, editBrandPriceMax)) {
      updateBrandPriceRange(brandId, editBrandPriceMin, editBrandPriceMax);
      setEditingBrandPrice(null);
    }
  };

  const cancelBrandPriceEdit = () => {
    setEditingBrandPrice(null);
  };

  const removeBrandPrice = (brandId: string) => {
    removeBrandPriceRange(brandId);
  };

  const startEditingModelPrice = (brandId: string, model: string, brand: Brand) => {
    setEditingModelPrice({ brandId, model });
    setEditModelPrice(brand.modelPrices[model] ?? 0);
  };

  const saveModelPriceEdit = () => {
    if (editingModelPrice && editModelPrice > 0) {
      setModelPrice(editingModelPrice.brandId, editingModelPrice.model, editModelPrice);
      setEditingModelPrice(null);
    }
  };

  const cancelModelPriceEdit = () => {
    setEditingModelPrice(null);
  };

  const removeModelExactPrice = (brandId: string, model: string) => {
    removeModelPrice(brandId, model);
  };

  const startEditingAttr = (attr: AttributeDefinition) => {
    setEditingAttr(attr.key);
    setEditAttrKey(attr.key);
    setEditAttrType(attr.type);
    setEditAttrMin(attr.min || 0);
    setEditAttrMax(attr.max || 100);
  };

  const saveAttrEdit = () => {
    if (editingAttr) {
      const updates: Partial<AttributeDefinition> = {
        type: editAttrType,
      };

      if (editAttrType === 'number') {
        updates.min = editAttrMin;
        updates.max = editAttrMax;
      }

      updateAttribute(selectedCategory.id, editingAttr, updates);
      
      // Handle key rename if changed
      if (editAttrKey.trim() && editAttrKey !== editingAttr) {
        renameAttributeKey(selectedCategory.id, editingAttr, normalizeAttributeKey(editAttrKey));
      }
      
      setEditingAttr(null);
      setEditAttrKey('');
    }
  };

  const cancelAttrEdit = () => {
    setEditingAttr(null);
    setEditAttrKey('');
    setNewOption('');
  };

  const handleAddAttribute = () => {
    if (newAttrKey.trim()) {
      const newAttr: AttributeDefinition = {
        key: normalizeAttributeKey(newAttrKey),
        type: 'select',
        options: [],
      };
      addAttribute(selectedCategory.id, newAttr);
      setAddingAttr(false);
      setNewAttrKey('');
    }
  };

  const handleAddOption = (attrKey: string) => {
    if (newOption.trim()) {
      addAttributeOption(selectedCategory.id, attrKey, newOption.trim());
      setNewOption('');
    }
  };

  const handleAddModel = (brandId: string) => {
    if (newModelName.trim()) {
      addBrandModel(brandId, newModelName.trim());
      setNewModelName('');
    }
  };

  const startEditingBrandModels = (brandId: string) => {
    setEditingBrandModels(brandId);
    setNewModelName('');
  };

  const startEditingModelName = (brandId: string, model: string) => {
    setEditingModel({ brandId, model });
    setEditModelName(model);
  };

  const saveModelEdit = () => {
    if (editingModel && editModelName.trim() && editModelName !== editingModel.model) {
      updateBrandModel(editingModel.brandId, editingModel.model, editModelName.trim());
      setEditingModel(null);
      setEditModelName('');
    }
  };

  const cancelModelEdit = () => {
    setEditingModel(null);
    setEditModelName('');
  };

  return (
    <aside className="w-1/2 min-w-[600px] border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
          <Package className="w-4 h-4 text-indigo-500" />
          Product Configuration
        </h2>
        <div className="text-xs text-slate-500">
          {selectedCategory.name}
        </div>
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
              Category Settings
            </span>
            {expandedSections.category ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {expandedSections.category && (
            <div className="px-5 pb-4 space-y-3">
              {/* Category Selector */}
              <select
                value={selectedCategory.id}
                onChange={(e) => {
                  const category = categories.find(c => c.id === e.target.value);
                  if (category) setSelectedCategory(category);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 ring-indigo-500 transition-all text-slate-200"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Category Info / Edit */}
              {editingCategory ? (
                <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div>
                    <label htmlFor="edit-category-name" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                      Category Name
                    </label>
                    <input
                      id="edit-category-name"
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                    />
                  </div>
                <div>
                  <label htmlFor="edit-sku-prefix" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                    SKU Prefix
                  </label>
                  <input
                    id="edit-sku-prefix"
                    type="text"
                    value={editSkuPrefix}
                    onChange={(e) => setEditSkuPrefix(normalizeSkuPrefix(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="edit-id-format" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                    ID Format
                  </label>
                  <select
                    id="edit-id-format"
                    value={editIdFormat}
                    onChange={(e) => setEditIdFormat(e.target.value as 'uuid' | 'sequential' | 'custom')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                  >
                    <option value="uuid">UUID</option>
                    <option value="sequential">Sequential</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {editIdFormat === 'custom' && (
                  <div>
                    <label htmlFor="edit-id-prefix" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                      ID Prefix
                    </label>
                    <input
                      id="edit-id-prefix"
                      type="text"
                      value={editIdPrefix}
                      onChange={(e) => setEditIdPrefix(e.target.value)}
                      placeholder="e.g., PROD-"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 font-mono"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                    <button
                      onClick={saveCategoryEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelCategoryEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
      ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">SKU Prefix</div>
                      <div className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm font-mono text-indigo-400">
                        {selectedCategory.skuPrefix}-
                      </div>
                    </div>
                    <button
                      onClick={startEditingCategory}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category Price Range */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">Price Range</span>
                      {!editingCategoryPrice && (
                        <button
                          onClick={startEditingCategoryPrice}
                          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    {editingCategoryPrice ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              min={0}
                              placeholder="Min"
                              value={editCatPriceMin}
                              onChange={(e) => setEditCatPriceMin(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              min={0}
                              placeholder="Max"
                              value={editCatPriceMax}
                              onChange={(e) => setEditCatPriceMax(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveCategoryPriceEdit}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={cancelCategoryPriceEdit}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-all"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">
                        ${selectedCategory.priceRange.min} - ${selectedCategory.priceRange.max}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brands & Models Section */}
    <div className="border-b border-slate-800">
      <button
        onClick={() => toggleSection('brands')}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Car className="w-3 h-3" />
          Brands & Models
          <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded-full text-[10px] text-slate-500">
            {brands.length}
          </span>
        </span>
            {expandedSections.brands ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {expandedSections.brands && (
            <div className="px-5 pb-4 space-y-4">
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

              {/* Brand List with Models */}
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className={`border rounded-lg transition-all ${
                      selectedBrands.includes(brand.id)
                        ? 'border-indigo-500/50 bg-slate-800/30'
                        : 'border-slate-700/50 bg-slate-800/20'
                    }`}
                  >
                    {/* Brand Header */}
                    <div className="flex items-center gap-2 p-3">
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
                              if (e.key === 'Enter') saveBrandEdit();
                              if (e.key === 'Escape') cancelBrandEdit();
                            }                            }
                            className="flex-1 bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm outline-none text-slate-200"
                          />
                          <button
                            onClick={saveBrandEdit}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelBrandEdit}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-bold text-slate-300">
                          {brand.name}
                        </span>
                        <span className={`text-xs ${
                          brand.selectedModels.length > 0 ? 'text-indigo-400' : 'text-slate-500'
                        }`}>
                          {brand.selectedModels.length}/{brand.models.length} models
                        </span>
                          <button
                            onClick={() => startEditingBrand(brand)}
                            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeBrand(brand.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleBrandExpand(brand.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-all"
                          >
                            {expandedBrands[brand.id] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>

              {/* Models Section */}
              {expandedBrands[brand.id] && (
                <div className="px-3 pb-3 border-t border-slate-700/30">
                  {/* Brand Price Override */}
                  <div className="pt-3 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Brand Price Range</span>
                    <div className="flex items-center gap-1">
                      {editingBrandPrice === brand.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            placeholder="Min"
                            value={editBrandPriceMin}
                            onChange={(e) => setEditBrandPriceMin(parseInt(e.target.value) || 0)}
                            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Max"
                            value={editBrandPriceMax}
                            onChange={(e) => setEditBrandPriceMax(parseInt(e.target.value) || 0)}
                            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                          />
                          <button
                            onClick={() => saveBrandPriceEdit(brand.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelBrandPriceEdit}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : brand.priceRange ? (
                        <>
                          <span className="text-xs text-indigo-400">
                            ${brand.priceRange.min}-${brand.priceRange.max}
                          </span>
                          <button
                            onClick={() => startEditingBrandPrice(brand)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeBrandPrice(brand.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditingBrandPrice(brand)}
                          className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          + Set price
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Model Selection Header */}
                  <div className="pt-2 pb-1 flex items-center justify-between border-t border-slate-700/20">
                    <span className="text-xs font-bold text-slate-400">
                      Select Models ({brand.selectedModels.length}/{brand.models.length})
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => selectAllBrandModels(brand.id)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        All
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => deselectAllBrandModels(brand.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-800/50 transition-colors"
                      >
                        None
                      </button>
                    </div>
                  </div>

                      {/* Model List with Checkboxes */}
                      <div className="pt-2 space-y-2">
                        {brand.models.length > 0 ? (
                          <div className="space-y-1">
                            {brand.models.map((model) => (
                              <div
                                key={model}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
                              >
                                <button
                                  onClick={() => toggleBrandModel(brand.id, model)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    brand.selectedModels.includes(model)
                                      ? 'bg-indigo-600 border-indigo-500'
                                      : 'border-slate-600 hover:border-slate-500'
                                  }`}
                                >
                                  {brand.selectedModels.includes(model) && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </button>
                                
                                {editingModel?.brandId === brand.id && editingModel?.model === model ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editModelName}
                                      onChange={(e) => setEditModelName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveModelEdit();
                                        if (e.key === 'Escape') cancelModelEdit();
                                      }                                      }
                                      className="flex-1 bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm outline-none text-slate-200"
                                    />
                                    <button
                                      onClick={saveModelEdit}
                                      className="p-1 text-emerald-400 hover:text-emerald-300"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={cancelModelEdit}
                                      className="p-1 text-red-400 hover:text-red-300"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <button
                          type="button"
                          className={`text-sm text-left cursor-pointer ${
                            brand.selectedModels.includes(model)
                              ? 'text-slate-300'
                              : 'text-slate-500'
                          }`}
                          onClick={() => startEditingModelName(brand.id, model)}
                        >
                          {model}
                        </button>
                        {editingModelPrice?.brandId === brand.id && editingModelPrice?.model === model ? (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-xs text-slate-500">$</span>
                            <input
                              type="number"
                              min={0}
                              value={editModelPrice}
                              onChange={(e) => setEditModelPrice(parseInt(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveModelPriceEdit();
                                if (e.key === 'Escape') cancelModelPriceEdit();
                              }                              }
                              className="w-16 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs outline-none text-slate-200"
                            />
                            <button
                              onClick={saveModelPriceEdit}
                              className="p-0.5 text-emerald-400 hover:text-emerald-300"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                            <button
                              onClick={cancelModelPriceEdit}
                              className="p-0.5 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                            {brand.modelPrices[model] ? (
                              <>
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                                  ${brand.modelPrices[model]}
                                </span>
                                <button
                                  onClick={() => startEditingModelPrice(brand.id, model, brand)}
                                  className="p-0.5 text-slate-500 hover:text-slate-300"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => removeModelExactPrice(brand.id, model)}
                                  className="p-0.5 text-slate-500 hover:text-red-400"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditingModelPrice(brand.id, model, brand)}
                                className="text-[10px] text-slate-600 hover:text-indigo-400 transition-colors"
                              >
                                + Set price
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => startEditingModelName(brand.id, model)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeBrandModel(brand.id, model)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                      <div className="text-xs text-slate-500 italic py-2">
                        No models defined
                      </div>
                    )}

                    {/* Add Model */}
                    {editingBrandModels === brand.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Model name..."
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddModel(brand.id);
                              setNewModelName('');
                            }
                            if (e.key === 'Escape') {
                              setEditingBrandModels(null);
                              setNewModelName('');
                            }
                          }                          }
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 placeholder:text-slate-600"
                        />
                        <button
                          onClick={() => {
                            handleAddModel(brand.id);
                            setNewModelName('');
                          }}
                          disabled={!newModelName.trim()}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-all"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBrandModels(null);
                            setNewModelName('');
                          }}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingBrandModels(brand.id)}
                        className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Model
                      </button>
                    )}
                  </div>
                </div>
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Attributes
              <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded-full text-[10px] text-slate-500">
                {selectedCategory.attributes.length}
              </span>
            </span>
            {expandedSections.attributes ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {expandedSections.attributes && (
            <div className="px-5 pb-4 space-y-3">
              {/* Add Attribute Button */}
              {!addingAttr ? (
                <button
                  onClick={() => setAddingAttr(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-lg text-sm font-bold text-slate-400 hover:text-slate-300 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Attribute
                </button>
              ) : (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-2">
                  <input
                    type="text"
                    placeholder="Attribute key (e.g., color)"
                    value={newAttrKey}
                    onChange={(e) => setNewAttrKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 placeholder:text-slate-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAttribute}
                      disabled={!newAttrKey.trim()}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-bold transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setAddingAttr(false);
                        setNewAttrKey('');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Attribute List */}
              <div className="space-y-2">
                {selectedCategory.attributes.map((attr) => (
                  <div
                    key={attr.key}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                {editingAttr === attr.key ? (
                  <div className="space-y-3">
                    {/* Edit Attribute Form */}
                    <div>
                      <label htmlFor="edit-attr-key" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                        Key
                      </label>
                      <input
                        id="edit-attr-key"
                        type="text"
                        value={editAttrKey}
                        onChange={(e) => setEditAttrKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                        Type
                      </span>
                          <div className="grid grid-cols-2 gap-2">
                            {ATTRIBUTE_TYPES.map((type) => (
                              <button
                                key={type.value}
                                onClick={() => setEditAttrType(type.value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                  editAttrType === type.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-950 border border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                              >
                                <type.icon className="w-3 h-3" />
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {editAttrType === 'number' && (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label htmlFor="edit-attr-min" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                                Min
                              </label>
                              <input
                                id="edit-attr-min"
                                type="number"
                                value={editAttrMin}
                                onChange={(e) => setEditAttrMin(parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="edit-attr-max" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                                Max
                              </label>
                              <input
                                id="edit-attr-max"
                                type="number"
                                value={editAttrMax}
                                onChange={(e) => setEditAttrMax(parseInt(e.target.value) || 100)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                              />
                            </div>
                          </div>
                        )}

                        {/* Options for select type */}
                        {(editAttrType === 'select' || attr.type === 'select') && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                              Options
                            </span>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {attr.options?.map((opt) => (
                                <span
                                  key={String(opt)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                                >
                                  {String(opt)}
                                  <button
                                    onClick={() => removeAttributeOption(selectedCategory.id, attr.key, String(opt))}
                                    className="hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add option..."
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddOption(attr.key)}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 placeholder:text-slate-600"
                              />
                              <button
                                onClick={() => handleAddOption(attr.key)}
                                disabled={!newOption.trim()}
                                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={saveAttrEdit}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-all"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelAttrEdit}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-all"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-bold text-slate-300 capitalize">
                          {attr.key}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {attr.type}
                        </div>
                      </div>
                      <div className="flex gap-1">
                            <button
                              onClick={() => startEditingAttr(attr)}
                              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeAttribute(selectedCategory.id, attr.key)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Display options if select type */}
                        {attr.type === 'select' && attr.options && attr.options.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {attr.options.map((opt) => (
                              <span
                                key={String(opt)}
                                className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400"
                              >
                                {String(opt)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Display min/max if number type */}
                        {attr.type === 'number' && (
                          <div className="text-[10px] text-slate-500">
                            Range: {attr.min} - {attr.max}
                          </div>
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
