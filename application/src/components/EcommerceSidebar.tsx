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
  Image,
  Hash,
  Type,
  List,
  GripVertical,
  MoreHorizontal
} from 'lucide-react';

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
    removeAttribute,
    addAttributeOption,
    removeAttributeOption,
  } = useStore();

  // Brand state
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Attribute state
  const [editingAttr, setEditingAttr] = useState<string | null>(null);
  const [editAttrLabel, setEditAttrLabel] = useState('');
  const [editAttrType, setEditAttrType] = useState<AttributeDefinition['type']>('select');
  const [editAttrMin, setEditAttrMin] = useState<number>(0);
  const [editAttrMax, setEditAttrMax] = useState<number>(100);
  const [newOption, setNewOption] = useState('');
  const [addingAttr, setAddingAttr] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrLabel, setNewAttrLabel] = useState('');
  
  // Category edit state
  const [editingCategory, setEditingCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editSkuPrefix, setEditSkuPrefix] = useState('');
  
  // Expand/collapse sections
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const startEditingCategory = () => {
    setEditingCategory(true);
    setEditCategoryName(selectedCategory.name);
    setEditSkuPrefix(selectedCategory.skuPrefix);
  };

  const saveCategoryEdit = () => {
    if (editCategoryName.trim() && editSkuPrefix.trim()) {
      updateCategory(selectedCategory.id, {
        name: editCategoryName.trim(),
        skuPrefix: editSkuPrefix.trim().toUpperCase(),
        slug: editCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      setEditingCategory(false);
    }
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(false);
    setEditCategoryName('');
    setEditSkuPrefix('');
  };

  const startEditingAttr = (attr: AttributeDefinition) => {
    setEditingAttr(attr.key);
    setEditAttrLabel(attr.label);
    setEditAttrType(attr.type);
    setEditAttrMin(attr.min || 0);
    setEditAttrMax(attr.max || 100);
  };

  const saveAttrEdit = () => {
    if (editingAttr && editAttrLabel.trim()) {
      const updates: Partial<AttributeDefinition> = {
        label: editAttrLabel.trim(),
        type: editAttrType,
      };
      
      if (editAttrType === 'number') {
        updates.min = editAttrMin;
        updates.max = editAttrMax;
      }
      
      updateAttribute(selectedCategory.id, editingAttr, updates);
      setEditingAttr(null);
    }
  };

  const cancelAttrEdit = () => {
    setEditingAttr(null);
    setEditAttrLabel('');
    setNewOption('');
  };

  const handleAddAttribute = () => {
    if (newAttrKey.trim() && newAttrLabel.trim()) {
      const newAttr: AttributeDefinition = {
        key: newAttrKey.trim().toLowerCase().replace(/\s+/g, '_'),
        label: newAttrLabel.trim(),
        type: 'select',
        options: [],
      };
      addAttribute(selectedCategory.id, newAttr);
      setAddingAttr(false);
      setNewAttrKey('');
      setNewAttrLabel('');
    }
  };

  const handleAddOption = (attrKey: string) => {
    if (newOption.trim()) {
      addAttributeOption(selectedCategory.id, attrKey, newOption.trim());
      setNewOption('');
    }
  };

  return (
    <aside className="w-96 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
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
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                      SKU Prefix
                    </label>
                    <input
                      type="text"
                      value={editSkuPrefix}
                      onChange={(e) => setEditSkuPrefix(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 font-mono"
                    />
                  </div>
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
                <div className="space-y-2">
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
                </div>
              )}
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
                            if (e.key === 'Enter') saveBrandEdit();
                            if (e.key === 'Escape') cancelBrandEdit();
                          }}
                          autoFocus
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
                        <span className="flex-1 text-sm text-slate-300 truncate">
                          {brand.name}
                        </span>
                        <button
                          onClick={() => startEditingBrand(brand)}
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Settings2 className="w-3 h-3" />
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
                  <input
                    type="text"
                    placeholder="Attribute label (e.g., Color)"
                    value={newAttrLabel}
                    onChange={(e) => setNewAttrLabel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200 placeholder:text-slate-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAttribute}
                      disabled={!newAttrKey.trim() || !newAttrLabel.trim()}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-bold transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setAddingAttr(false);
                        setNewAttrKey('');
                        setNewAttrLabel('');
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
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                            Label
                          </label>
                          <input
                            type="text"
                            value={editAttrLabel}
                            onChange={(e) => setEditAttrLabel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                            Type
                          </label>
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
                              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                                Min
                              </label>
                              <input
                                type="number"
                                value={editAttrMin}
                                onChange={(e) => setEditAttrMin(parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-indigo-500 text-slate-200"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                                Max
                              </label>
                              <input
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
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                              Options
                            </label>
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
                            <div className="text-sm font-bold text-slate-300">
                              {attr.label}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {attr.key} • {attr.type}
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
