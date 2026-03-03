import { create } from 'zustand';
import { Blueprint, BlueprintField } from '../core/engine';
import { CategoryTemplate, Brand, Product } from '../types/product';
import { CATEGORY_TEMPLATES, getDefaultCategory } from '../core/categories';

interface StoreState {
  // Legacy blueprint support
  blueprint: Blueprint;
  updateBlueprintName: (name: string) => void;
  addField: (field: BlueprintField) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<BlueprintField>) => void;
  updateFieldOption: (fieldId: string, key: string, value: any) => void;
  
  // E-commerce specific state
  selectedCategory: CategoryTemplate;
  setSelectedCategory: (category: CategoryTemplate) => void;
  
  brands: Brand[];
  addBrand: (name: string) => void;
  removeBrand: (id: string) => void;
  updateBrand: (id: string, name: string) => void;
  resetBrands: () => void;
  
  selectedBrands: string[];
  toggleBrand: (id: string) => void;
  selectAllBrands: () => void;
  deselectAllBrands: () => void;
  
  // Generated products
  products: Product[];
  setProducts: (products: Product[]) => void;
  clearProducts: () => void;
}

const defaultCategory = getDefaultCategory();

const createInitialBrands = (category: CategoryTemplate): Brand[] => {
  return category.defaultBrands.map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));
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
  
  // E-commerce state
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
  
  brands: createInitialBrands(defaultCategory),
  addBrand: (name) => {
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      name,
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
  
  // Products
  products: [],
  setProducts: (products) => set({ products }),
  clearProducts: () => set({ products: [] }),
}));