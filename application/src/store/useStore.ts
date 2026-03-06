import { create } from 'zustand';
import { Blueprint, BlueprintField } from '../core/engine';
import { CategoryTemplate, Brand, Product, AttributeDefinition } from '../types/product';
import { CATEGORY_TEMPLATES, getDefaultCategory } from '../core/categories';

interface StoreState {
  // Legacy blueprint support
  blueprint: Blueprint;
  updateBlueprintName: (name: string) => void;
  addField: (field: BlueprintField) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<BlueprintField>) => void;
  updateFieldOption: (fieldId: string, key: string, value: any) => void;

  // Category management
  categories: CategoryTemplate[];
  selectedCategory: CategoryTemplate;
  setSelectedCategory: (category: CategoryTemplate) => void;
  addCategory: (category: CategoryTemplate) => void;
  updateCategory: (id: string, updates: Partial<CategoryTemplate>) => void;
  removeCategory: (id: string) => void;
  
  // Attribute management
  addAttribute: (categoryId: string, attribute: AttributeDefinition) => void;
  updateAttribute: (categoryId: string, attributeKey: string, updates: Partial<AttributeDefinition>) => void;
  renameAttributeKey: (categoryId: string, oldKey: string, newKey: string) => void;
  removeAttribute: (categoryId: string, attributeKey: string) => void;
  addAttributeOption: (categoryId: string, attributeKey: string, option: string) => void;
  removeAttributeOption: (categoryId: string, attributeKey: string, option: string) => void;

  // Brands
  brands: Brand[];
  addBrand: (name: string) => void;
  removeBrand: (id: string) => void;
  updateBrand: (id: string, name: string) => void;
  resetBrands: () => void;
  addBrandModel: (brandId: string, model: string) => void;
  removeBrandModel: (brandId: string, model: string) => void;
  updateBrandModel: (brandId: string, oldModel: string, newModel: string) => void;

  selectedBrands: string[];
  toggleBrand: (id: string) => void;
  selectAllBrands: () => void;
  deselectAllBrands: () => void;
  
  // Model selection
  toggleBrandModel: (brandId: string, model: string) => void;
  selectAllBrandModels: (brandId: string) => void;
  deselectAllBrandModels: (brandId: string) => void;

  // Price management
  updateCategoryPriceRange: (categoryId: string, min: number, max: number) => void;
  updateBrandPriceRange: (brandId: string, min: number, max: number) => void;
  removeBrandPriceRange: (brandId: string) => void;
  setModelPrice: (brandId: string, model: string, price: number) => void;
  removeModelPrice: (brandId: string, model: string) => void;

  // Generated products
  products: Product[];
  setProducts: (products: Product[]) => void;
  clearProducts: () => void;
}

const defaultCategory = getDefaultCategory();

const createInitialBrands = (category: CategoryTemplate): Brand[] => {
  return category.defaultBrands.map((name) => {
    // Use brand-specific models if available, otherwise fall back to generic models
    const brandSpecificModels = category.brandModels?.[name];
    const models = brandSpecificModels && brandSpecificModels.length > 0
      ? brandSpecificModels
      : [...category.models];
    
    return {
      id: crypto.randomUUID(),
      name,
      models,
      selectedModels: [...models], // All models selected by default
      modelPrices: {}, // Empty price map initially
    };
  });
};

export const useStore = create<StoreState>((set, get) => ({
  // Legacy blueprint
  blueprint: {
    name: 'New E-shop Category',
    fields: [
      { id: '1', key: 'id', provider: 'string.uuid' },
      { id: '2', key: 'name', provider: 'commerce.productName' },
      { id: '3', key: 'price', provider: 'commerce.price', options: { min: 100, max: 1000 } },
    ]
  },

  updateBlueprintName: (name) =>
    set((state) => ({ blueprint: { ...state.blueprint, name } })),

  addField: (field) =>
    set((state) => ({
      blueprint: { ...state.blueprint, fields: [...state.blueprint.fields, field] }
    })),

  removeField: (id) =>
    set((state) => ({
      blueprint: { ...state.blueprint, fields: state.blueprint.fields.filter(f => f.id !== id) }
    })),

  updateField: (id, updates) =>
    set((state) => ({
      blueprint: {
        ...state.blueprint,
        fields: state.blueprint.fields.map(f => f.id === id ? { ...f, ...updates } : f)
      }
    })),

  updateFieldOption: (fieldId, key, value) =>
    set((state) => ({
      blueprint: {
        ...state.blueprint,
        fields: state.blueprint.fields.map(f =>
          f.id === fieldId
          ? { ...f, options: { ...f.options, [key]: value } }
          : f
        )
      }
    })),
  
  // Category management
  categories: CATEGORY_TEMPLATES,
  selectedCategory: defaultCategory,
  setSelectedCategory: (category) => {
    const brands = createInitialBrands(category);
    set({
      selectedCategory: category,
      brands,
      selectedBrands: brands.map(b => b.id),
      products: [],
    });
  },
  
  addCategory: (category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },
  
  updateCategory: (id, updates) => {
    set((state) => {
      const updatedCategories = state.categories.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      const updatedSelected = state.selectedCategory.id === id 
        ? { ...state.selectedCategory, ...updates }
        : state.selectedCategory;
      return {
        categories: updatedCategories,
        selectedCategory: updatedSelected,
      };
    });
  },
  
  removeCategory: (id) => {
    set((state) => {
      const remaining = state.categories.filter(c => c.id !== id);
      const newSelected = state.selectedCategory.id === id && remaining.length > 0
        ? remaining[0]
        : state.selectedCategory;
      const brands = createInitialBrands(newSelected);
      return {
        categories: remaining,
        selectedCategory: newSelected,
        brands,
        selectedBrands: brands.map(b => b.id),
        products: [],
      };
    });
  },
  
  // Attribute management
  addAttribute: (categoryId, attribute) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) =>
        c.id === categoryId
          ? { ...c, attributes: [...c.attributes, attribute] }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },

  updateAttribute: (categoryId, attributeKey, updates) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) =>
        c.id === categoryId
          ? {
              ...c,
              attributes: c.attributes.map(a =>
                a.key === attributeKey ? { ...a, ...updates } : a
              )
            }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },

  renameAttributeKey: (categoryId, oldKey, newKey) => {
  set((state) => {
    const updateCategoryAttrs = (c: CategoryTemplate) =>
      c.id === categoryId
        ? {
            ...c,
            attributes: c.attributes.map(a =>
              a.key === oldKey ? { ...a, key: newKey } : a
            )
          }
        : c;
    return {
      categories: state.categories.map(updateCategoryAttrs),
      selectedCategory: updateCategoryAttrs(state.selectedCategory),
    };
  });
},

removeAttribute: (categoryId, attributeKey) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => 
        c.id === categoryId 
          ? { ...c, attributes: c.attributes.filter(a => a.key !== attributeKey) }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },
  
  addAttributeOption: (categoryId, attributeKey, option) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => 
        c.id === categoryId 
          ? { 
              ...c, 
              attributes: c.attributes.map(a => 
                a.key === attributeKey 
                  ? { ...a, options: [...(a.options || []), option] }
                  : a
              )
            }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },
  
  removeAttributeOption: (categoryId, attributeKey, option) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => 
        c.id === categoryId 
          ? { 
              ...c, 
              attributes: c.attributes.map(a => 
                a.key === attributeKey 
                  ? { ...a, options: (a.options || []).filter(o => o !== option) }
                  : a
              )
            }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },
  
  // Brands
  brands: createInitialBrands(defaultCategory),
  addBrand: (name) => {
    const { selectedCategory } = get();
    // Check if there are brand-specific models for this name
    const brandSpecificModels = selectedCategory.brandModels?.[name];
    const models = brandSpecificModels && brandSpecificModels.length > 0
      ? brandSpecificModels
      : [...selectedCategory.models];
    
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      name,
      models,
      selectedModels: [...models],
      modelPrices: {},
    };
    set((state) => ({
      brands: [...state.brands, newBrand],
      selectedBrands: [...state.selectedBrands, newBrand.id],
    }));
  },
  removeBrand: (id) => {
    set((state) => ({
      brands: state.brands.filter(b => b.id !== id),
      selectedBrands: state.selectedBrands.filter(bId => bId !== id),
    }));
  },
  updateBrand: (id, name) => {
    set((state) => ({
      brands: state.brands.map(b => b.id === id ? { ...b, name } : b),
    }));
  },
  resetBrands: () => {
    const { selectedCategory } = get();
    const brands = createInitialBrands(selectedCategory);
    set({
      brands,
      selectedBrands: brands.map(b => b.id),
    });
  },
  
  addBrandModel: (brandId, model) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, models: [...b.models, model] }
          : b
      ),
    }));
  },
  
  removeBrandModel: (brandId, model) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { 
              ...b, 
              models: b.models.filter(m => m !== model),
              selectedModels: b.selectedModels.filter(m => m !== model)
            }
          : b
      ),
    }));
  },
  
  updateBrandModel: (brandId, oldModel, newModel) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, models: b.models.map(m => m === oldModel ? newModel : m) }
          : b
      ),
    }));
  },
  
  selectedBrands: createInitialBrands(defaultCategory).map(b => b.id),
  toggleBrand: (id) => {
    set((state) => ({
      selectedBrands: state.selectedBrands.includes(id)
        ? state.selectedBrands.filter(bId => bId !== id)
        : [...state.selectedBrands, id],
    }));
  },
  selectAllBrands: () => {
    set((state) => ({
      selectedBrands: state.brands.map(b => b.id),
    }));
  },
  deselectAllBrands: () => {
    set({ selectedBrands: [] });
  },
  
  // Model selection
  toggleBrandModel: (brandId, model) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? {
              ...b,
              selectedModels: b.selectedModels.includes(model)
                ? b.selectedModels.filter(m => m !== model)
                : [...b.selectedModels, model]
            }
          : b
      ),
    }));
  },
  
  selectAllBrandModels: (brandId) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, selectedModels: [...b.models] }
          : b
      ),
    }));
  },
  
  deselectAllBrandModels: (brandId) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, selectedModels: [] }
          : b
      ),
    }));
  },

  // Price management
  updateCategoryPriceRange: (categoryId, min, max) => {
    set((state) => {
      const updatePriceRange = (c: CategoryTemplate) =>
        c.id === categoryId
          ? { ...c, priceRange: { min, max } }
          : c;
      return {
        categories: state.categories.map(updatePriceRange),
        selectedCategory: updatePriceRange(state.selectedCategory),
      };
    });
  },

  updateBrandPriceRange: (brandId, min, max) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, priceRange: { min, max } }
          : b
      ),
    }));
  },

  removeBrandPriceRange: (brandId) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, priceRange: undefined }
          : b
      ),
    }));
  },

  setModelPrice: (brandId, model, price) => {
    set((state) => ({
      brands: state.brands.map(b =>
        b.id === brandId
          ? { ...b, modelPrices: { ...b.modelPrices, [model]: price } }
          : b
      ),
    }));
  },

  removeModelPrice: (brandId, model) => {
    set((state) => ({
      brands: state.brands.map(b => {
        if (b.id !== brandId) return b;
        const { [model]: _, ...remainingPrices } = b.modelPrices;
        return { ...b, modelPrices: remainingPrices };
      }),
    }));
  },

  // Products
  products: [],
  setProducts: (products) => set({ products }),
  clearProducts: () => set({ products: [] }),
}));