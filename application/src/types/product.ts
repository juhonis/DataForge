export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  category: string;
  sku: string;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  images: string[];
  attributes: Record<string, any>;
}

export interface PriceRange {
  min: number;
  max: number;
}

export type IdFormat = 'uuid' | 'sequential' | 'custom';

export type DimensionKey = 'weight_kg' | 'length_cm' | 'width_cm' | 'height_cm';

export interface DimensionRange {
  min: number;
  max: number;
  fractionDigits?: number;
  nullableProbability?: number;
}

export type DimensionProfile = Record<DimensionKey, DimensionRange>;

export interface CategoryTemplate {
  id: string;
  name: string;
  slug: string;
  skuPrefix: string;
  unsplashIds: string[];
  defaultBrands: string[];
  models: string[]; // Generic fallback models
  brandModels: Record<string, string[]>; // Brand-specific models
  variants?: string[];
  nameTemplate: string;
  nameParts?: Record<string, string[]>;
  usesVariantInName: boolean;
  dimensions: DimensionProfile;
  attributes: AttributeDefinition[];
  priceRange: PriceRange; // Global price range for this category
  idFormat: IdFormat; // Format for generating product IDs
  idPrefix?: string; // Optional prefix for custom ID format
}

export interface AttributeDefinition {
  key: string;
  type: 'select' | 'number' | 'boolean' | 'text';
  options?: string[];
  min?: number;
  max?: number;
}

export interface Brand {
  id: string;
  name: string;
  models: string[]; // All available models for this brand
  selectedModels: string[]; // Models currently selected for generation
  priceRange?: PriceRange; // Optional per-brand price range (overrides category default)
  modelPrices: Record<string, number>; // Optional exact prices for specific models
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
