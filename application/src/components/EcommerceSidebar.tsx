import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AttributeDefinition } from '../types/product';
import { 
  Plus, 
  Package, 
  ChevronDown, 
  ChevronRight,
  Check,
  Edit3,
  Save,
  Trash2,
  X,
  Hash,
  Type,
  List,
  Layers,
} from 'lucide-react';
import { normalizeAttributeKey } from '../core/normalize';
import { BrandSection } from './sidebar/BrandSection';
import { CategorySection } from './sidebar/CategorySection';

// Attribute type options
const ATTRIBUTE_TYPES = [
  { value: 'select', label: 'Select', icon: List },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'boolean', label: 'Yes/No', icon: Check },
  { value: 'text', label: 'Text', icon: Type },
] as const;

export const EcommerceSidebar: React.FC = () => {
  const {
    selectedCategory,
    addAttribute,
    updateAttribute,
    removeAttribute,
    addAttributeOption,
    removeAttributeOption,
  } = useStore();

  // Attribute state
  const [editingAttr, setEditingAttr] = useState<string | null>(null);
  const [editAttrKey, setEditAttrKey] = useState('');
  const [editAttrType, setEditAttrType] = useState<AttributeDefinition['type']>('select');
  const [editAttrMin, setEditAttrMin] = useState<number>(0);
  const [editAttrMax, setEditAttrMax] = useState<number>(100);
  const [newOption, setNewOption] = useState('');
  const [addingAttr, setAddingAttr] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  
  // Expand/collapse sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brands: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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

      const nextKey = normalizeAttributeKey(editAttrKey);

      if (nextKey && nextKey !== editingAttr) {
        updates.key = nextKey;
      }

      updateAttribute(selectedCategory.id, editingAttr, updates);

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
        <CategorySection
          key={selectedCategory.id}
          expanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        />

        <BrandSection
          expanded={expandedSections.brands}
          onToggle={() => toggleSection('brands')}
        />

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
