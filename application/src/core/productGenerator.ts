import { faker } from '@faker-js/faker';
import { Product, CategoryTemplate, Brand, AttributeDefinition } from '../types/product';
import { slugify } from './normalize';

let sequentialCounter = 0;

export const generateId = (format: 'uuid' | 'sequential' | 'custom', prefix?: string, index?: number): string => {
  switch (format) {
    case 'sequential':
      return String(index ?? ++sequentialCounter);
    case 'custom':
      return `${prefix ?? ''}${index ?? ++sequentialCounter}`;
    case 'uuid':
    default:
      return crypto.randomUUID();
  }
};

export const resetSequentialCounter = (): void => {
  sequentialCounter = 0;
};

export const generateSKU = (prefix: string, id: string): string => {
  const shortId = id.split('-')[0].toUpperCase();
  return `${prefix}-${shortId}`;
};

export const generateSlug = (name: string, id: string): string => {
  const shortId = id.split('-')[0].toLowerCase();
  return [slugify(name), shortId].filter(Boolean).join('-');
};

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const generateAttributeValue = (def: AttributeDefinition): any => {
  switch (def.type) {
    case 'select':
      return getRandomItem(def.options || []);
    case 'number':
      return Math.floor(Math.random() * ((def.max || 100) - (def.min || 0) + 1)) + (def.min || 0);
    case 'boolean':
      return Math.random() > 0.5;
    case 'text':
      return faker.lorem.word();
    default:
      return null;
  }
};

const generateAttributes = (attributeDefs: AttributeDefinition[]): Record<string, any> => {
  const attributes: Record<string, any> = {};
  
  attributeDefs.forEach((def) => {
    attributes[def.key] = generateAttributeValue(def);
  });
  
  return attributes;
};

const generateProductName = (
  brand: Brand,
  category: CategoryTemplate,
  attributes: Record<string, any>
): { name: string; model: string } => {
  // Use only selected models for this brand
  const availableModels = brand.selectedModels.length > 0 
    ? brand.selectedModels 
    : (brand.models.length > 0 ? brand.models : []);
  
  const model = availableModels.length > 0 
    ? getRandomItem(availableModels)
    : (category.variants.length > 0 ? getRandomItem(category.variants) : '');

  // For laptops: Brand + Model + Screen Size
  if (category.id === 'laptops') {
    const screenSize = attributes['screenSize'] || getRandomItem(['13 Inch', '14 Inch', '15 Inch', '16 Inch']);
    return { name: `${brand.name} ${model} ${screenSize}`, model };
  }

  // For audio: Brand + Model + Variant
  if (category.id === 'audio') {
    const variant = category.variants.length > 0 ? getRandomItem(category.variants) : '';
    return { name: `${brand.name} ${model} ${variant}`.trim(), model };
  }

  // For accessories: Brand + Model + Device Type
  if (category.id === 'accessories') {
    const deviceType = getRandomItem(['Cable', 'Hub', 'Adapter']);
    return { name: `${brand.name} ${model} ${deviceType}`, model };
  }

  // Default naming: Brand + Model
  return { name: `${brand.name} ${model}`.trim(), model };
};

const generatePrice = (brand: Brand, model: string, category: CategoryTemplate): number => {
  // Priority 1: Exact model price
  if (brand.modelPrices && brand.modelPrices[model] !== undefined) {
    return brand.modelPrices[model];
  }
  
  // Priority 2: Brand-specific price range
  if (brand.priceRange) {
    return faker.number.int({ min: brand.priceRange.min, max: brand.priceRange.max });
  }
  
  // Priority 3: Category default price range
  return faker.number.int({ min: category.priceRange.min, max: category.priceRange.max });
};

const generateDimensions = (category: CategoryTemplate) => {
  if (category.id === 'laptops') {
    return {
      weight_kg: faker.number.float({ min: 1, max: 2.5, fractionDigits: 1 }),
      length_cm: faker.number.int({ min: 30, max: 36 }),
      width_cm: faker.number.int({ min: 21, max: 25 }),
      height_cm: faker.number.int({ min: 1, max: 2 }),
    };
  }
  
  if (category.id === 'smartphones') {
    return {
      weight_kg: faker.number.float({ min: 0.15, max: 0.25, fractionDigits: 2 }),
      length_cm: faker.number.int({ min: 14, max: 17 }),
      width_cm: faker.number.int({ min: 7, max: 8 }),
      height_cm: faker.number.float({ min: 0.7, max: 0.9, fractionDigits: 1 }),
    };
  }
  
  if (category.id === 'audio') {
    return {
      weight_kg: faker.number.float({ min: 0.05, max: 0.4, fractionDigits: 2 }),
      length_cm: Math.random() > 0.5 ? faker.number.int({ min: 14, max: 17 }) : null,
      width_cm: faker.number.int({ min: 7, max: 8 }),
      height_cm: faker.number.float({ min: 0.7, max: 0.9, fractionDigits: 1 }),
    };
  }
  
  if (category.id === 'accessories') {
    return {
      weight_kg: faker.number.float({ min: 0.05, max: 0.2, fractionDigits: 2 }),
      length_cm: Math.random() > 0.3 ? faker.number.int({ min: 14, max: 17 }) : null,
      width_cm: faker.number.int({ min: 7, max: 8 }),
      height_cm: faker.number.float({ min: 0.7, max: 0.9, fractionDigits: 1 }),
    };
  }
  
  // Default dimensions
  return {
    weight_kg: faker.number.float({ min: 0.1, max: 2, fractionDigits: 2 }),
    length_cm: faker.number.int({ min: 10, max: 50 }),
    width_cm: faker.number.int({ min: 5, max: 30 }),
    height_cm: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
  };
};

export const generateProduct = (
  category: CategoryTemplate,
  brand: Brand,
  _existingProducts: Product[] = [],
  index?: number
): Product => {
  const id = generateId(category.idFormat, category.idPrefix, index);
  const attributes = generateAttributes(category.attributes);
  const { name, model } = generateProductName(brand, category, attributes);
  const dimensions = generateDimensions(category);
  const price = generatePrice(brand, model, category);

  return {
    id,
    brand: brand.name,
    name,
    slug: generateSlug(name, id),
    price,
    stock_quantity: faker.number.int({ min: 0, max: 100 }),
    category: category.name,
    sku: generateSKU(category.skuPrefix, id),
    ...dimensions,
    images: [getRandomItem(category.unsplashIds)],
    attributes,
  };
};

export const generateProducts = (
  category: CategoryTemplate,
  brands: Brand[],
  selectedBrandIds: string[],
  count: number,
  resetCounter: boolean = true
): Product[] => {
  const products: Product[] = [];
  const selectedBrands = brands.filter((b) => selectedBrandIds.includes(b.id));

  if (selectedBrands.length === 0) {
    return products;
  }

  // Reset sequential counter if requested
  if (resetCounter) {
    resetSequentialCounter();
  }

  for (let i = 0; i < count; i++) {
    const brand = selectedBrands[i % selectedBrands.length];
    const product = generateProduct(category, brand, products, i + 1);
    products.push(product);
  }

  return products;
};

export const exportToJSON = (products: Product[]): string => {
  return JSON.stringify(products, null, 2);
};

export const downloadJSON = (products: Product[], filename: string) => {
  const json = exportToJSON(products);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
