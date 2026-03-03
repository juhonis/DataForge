export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  category: string;
  sku: string;
  weight_kg: number;
  length_cm: number | null;
  width_cm: number;
  height_cm: number;
  images: string[];
  attributes: Record<string, any>;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  slug: string;
  skuPrefix: string;
  unsplashIds: string[];
  defaultBrands: string[];
  models: string[]; // Generic fallback models
  brandModels: Record<string, string[]>; // Brand-specific models
  variants: string[];
  attributes: AttributeDefinition[];
}

export interface AttributeDefinition {
  key: string;
  label: string;
  type: 'select' | 'number' | 'boolean' | 'text';
  options?: string[] | number[];
  min?: number;
  max?: number;
}

export interface Brand {
  id: string;
  name: string;
  models: string[];  // All available models for this brand
  selectedModels: string[];  // Models currently selected for generation
}

export interface GenerationConfig {
  category: CategoryTemplate;
  brands: Brand[];
  selectedBrands: string[];
  count: number;
}

export interface ProductFilters {
  brands: string[];
  minPrice: number;
  maxPrice: number;
}
