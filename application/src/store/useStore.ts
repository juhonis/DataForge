import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CategoryTemplate, Brand, AttributeDefinition } from '../types/product';
import type { Dataset, GenerationSettings } from '../types/dataset';
import type { PresetConfig } from '../core/presets';
import { CATEGORY_TEMPLATES, getDefaultCategory } from '../core/categories';

interface StoreState {
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
  updateBrandWeight: (id: string, weight: number) => void;
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

  // Generated dataset
  dataset: Dataset | null;
  setDataset: (dataset: Dataset) => void;
  clearDataset: () => void;

  // Generation settings
  settings: GenerationSettings;
  updateSettings: (updates: Partial<GenerationSettings>) => void;

  // Presets
  applyPreset: (preset: PresetConfig) => void;
}

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  seed: 42,
  productCount: 20,
  customerCount: 50,
  ordersPerCustomer: { min: 1, max: 3 },
  reviewCount: 50,
};

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
      weight: category.brandWeights?.[name] ?? 1,
      models,
      selectedModels: [...models], // All models selected by default
      modelPrices: {}, // Empty price map initially
    };
  });
};

const initialBrands = createInitialBrands(defaultCategory);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
  // Category management
  categories: CATEGORY_TEMPLATES,
  selectedCategory: defaultCategory,
  setSelectedCategory: (category) => {
    const brands = createInitialBrands(category);
    set({
      selectedCategory: category,
      brands,
      selectedBrands: brands.map(b => b.id),
      dataset: null,
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
        dataset: null,
      };
    });
  },
  
  // Attribute management
  addAttribute: (categoryId, attribute) => {
    const key = attribute.key.trim();

    if (!key) return;

    const nextAttribute = key === attribute.key ? attribute : { ...attribute, key };

    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) =>
        c.id === categoryId && !c.attributes.some((candidate) => candidate.key === key)
          ? { ...c, attributes: [...c.attributes, nextAttribute] }
          : c;
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },

  updateAttribute: (categoryId, attributeKey, updates) => {
    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => {
        if (c.id !== categoryId) return c;

        let nextUpdates = updates;

        if (updates.key !== undefined) {
          const nextKey = updates.key.trim();

          if (
            !nextKey ||
            (nextKey !== attributeKey &&
              c.attributes.some((attribute) => attribute.key === nextKey))
          ) {
            return c;
          }

          nextUpdates = { ...updates, key: nextKey };
        }

        return {
          ...c,
          attributes: c.attributes.map((attribute) =>
            attribute.key === attributeKey
              ? { ...attribute, ...nextUpdates }
              : attribute
          ),
        };
      };
      return {
        categories: state.categories.map(updateCategoryAttrs),
        selectedCategory: updateCategoryAttrs(state.selectedCategory),
      };
    });
  },

  renameAttributeKey: (categoryId, oldKey, newKey) => {
    const nextKey = newKey.trim();

    if (!nextKey || nextKey === oldKey) return;

    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => {
        if (
          c.id !== categoryId ||
          !c.attributes.some((attribute) => attribute.key === oldKey) ||
          c.attributes.some((attribute) => attribute.key === nextKey)
        ) {
          return c;
        }

        return {
          ...c,
          attributes: c.attributes.map((attribute) =>
            attribute.key === oldKey
              ? { ...attribute, key: nextKey }
              : attribute
          ),
        };
      };
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
    const nextOption = option.trim();

    if (!nextOption) return;

    set((state) => {
      const updateCategoryAttrs = (c: CategoryTemplate) => 
        c.id === categoryId 
          ? { 
              ...c, 
              attributes: c.attributes.map(a => {
                if (a.key !== attributeKey) return a;

                const options = a.options ?? [];

                return options.includes(nextOption)
                  ? a
                  : { ...a, options: [...options, nextOption] };
              })
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
  brands: initialBrands,
  addBrand: (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    const { selectedCategory, brands } = get();

    if (brands.some((brand) => brand.name === trimmedName)) return;

    // Check if there are brand-specific models for this name
    const brandSpecificModels = selectedCategory.brandModels?.[trimmedName];
    const models = brandSpecificModels && brandSpecificModels.length > 0
      ? brandSpecificModels
      : [...selectedCategory.models];
    
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      name: trimmedName,
      weight: selectedCategory.brandWeights?.[trimmedName] ?? 1,
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
    const trimmedName = name.trim();

    if (!trimmedName) return;

    const { brands } = get();

    if (
      brands.some(
        (brand) => brand.id !== id && brand.name === trimmedName,
      )
    ) {
      return;
    }

    set((state) => ({
      brands: state.brands.map(b =>
        b.id === id ? { ...b, name: trimmedName } : b
      ),
    }));
  },
  updateBrandWeight: (id, weight) => {
    const normalizedWeight =
      Number.isFinite(weight) && weight > 0 ? weight : 1;

    set((state) => ({
      brands: state.brands.map(b =>
        b.id === id ? { ...b, weight: normalizedWeight } : b
      ),
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
    const nextModel = model.trim();

    if (!nextModel) return;

    set((state) => ({
      brands: state.brands.map(b => {
        if (b.id !== brandId || b.models.includes(nextModel)) return b;

        return {
          ...b,
          models: [...b.models, nextModel],
          selectedModels: b.selectedModels.includes(nextModel)
            ? b.selectedModels
            : [...b.selectedModels, nextModel],
        };
      }),
    }));
  },
  
  removeBrandModel: (brandId, model) => {
    set((state) => ({
      brands: state.brands.map(b => {
        if (b.id !== brandId) return b;

        const modelPrices = { ...b.modelPrices };
        delete modelPrices[model];

        return {
          ...b,
          models: b.models.filter(m => m !== model),
          selectedModels: b.selectedModels.filter(m => m !== model),
          modelPrices,
        };
      }),
    }));
  },
  
  updateBrandModel: (brandId, oldModel, newModel) => {
    const nextModel = newModel.trim();

    if (!nextModel || nextModel === oldModel) return;

    set((state) => ({
      brands: state.brands.map(b => {
        if (
          b.id !== brandId ||
          !b.models.includes(oldModel) ||
          b.models.includes(nextModel)
        ) {
          return b;
        }

        const modelPrices = { ...b.modelPrices };

        if (oldModel in modelPrices) {
          modelPrices[nextModel] = modelPrices[oldModel];
          delete modelPrices[oldModel];
        }

        return {
          ...b,
          models: b.models.map(m => m === oldModel ? nextModel : m),
          selectedModels: b.selectedModels.map(m =>
            m === oldModel ? nextModel : m
          ),
          modelPrices,
        };
      }),
    }));
  },
  
  selectedBrands: initialBrands.map(b => b.id),
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
          ? { ...c, priceRange: { ...c.priceRange, min, max } }
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
          ? {
              ...b,
              priceRange: { ...(b.priceRange ?? {}), min, max },
            }
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

  // Dataset
  dataset: null,
  setDataset: (dataset) => set({ dataset }),
  clearDataset: () => set({ dataset: null }),

  // Generation settings
  settings: DEFAULT_GENERATION_SETTINGS,
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  // Presets
  applyPreset: (preset) =>
    set((state) => ({
      categories: state.categories.some((category) => category.id === preset.category.id)
        ? state.categories.map((category) =>
            category.id === preset.category.id ? preset.category : category,
          )
        : [...state.categories, preset.category],
      selectedCategory: preset.category,
      brands: preset.brands,
      selectedBrands: preset.selectedBrands,
      settings: preset.settings,
      dataset: null,
    })),
    }),
    {
      name: 'dataforge-config',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        categories: state.categories,
        selectedCategory: state.selectedCategory,
        brands: state.brands,
        selectedBrands: state.selectedBrands,
        settings: state.settings,
      }),
      migrate: (persistedState, version) => {
        if (version < 1) {
          const state = persistedState as Partial<StoreState>;

          return {
            ...state,
            dataset: null,
            settings: {
              ...DEFAULT_GENERATION_SETTINGS,
              ...(state.settings ?? {}),
            },
          };
        }

        return persistedState as Partial<StoreState>;
      },
    },
  ),
);