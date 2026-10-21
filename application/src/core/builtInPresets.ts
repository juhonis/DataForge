import type { GenerationSettings } from '../types/dataset';

export interface BundledPreset {
  id: string;
  name: string;
  categoryId: string;
  settings: GenerationSettings;
}

const demoSettings = (seed: number): GenerationSettings => ({
  seed,
  productCount: 24,
  customerCount: 40,
  ordersPerCustomer: { min: 1, max: 3 },
  reviewCount: 30,
});

export const BUNDLED_PRESETS: readonly BundledPreset[] = [
  {
    id: 'smartphones-demo',
    name: 'Smartphones Demo',
    categoryId: 'smartphones',
    settings: demoSettings(1201),
  },
  {
    id: 'laptops-demo',
    name: 'Laptops Demo',
    categoryId: 'laptops',
    settings: demoSettings(2202),
  },
  {
    id: 'audio-demo',
    name: 'Audio Demo',
    categoryId: 'audio',
    settings: demoSettings(3203),
  },
  {
    id: 'accessories-demo',
    name: 'Accessories Demo',
    categoryId: 'accessories',
    settings: demoSettings(4204),
  },
  {
    id: 'books-demo',
    name: 'Books Demo',
    categoryId: 'books',
    settings: demoSettings(5205),
  },
  {
    id: 'clothing-demo',
    name: 'Clothing Demo',
    categoryId: 'clothing',
    settings: demoSettings(6206),
  },
];
