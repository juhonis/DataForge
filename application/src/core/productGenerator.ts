import { faker } from '@faker-js/faker';
import { Product, CategoryTemplate, Brand, AttributeDefinition } from '../types/product';

export const generateUUID = (): string => {
  return crypto.randomUUID();
};

export const generateSKU = (prefix: string, id: string): string => {
  const shortId = id.split('-')[0].toUpperCase();
  return `${prefix}-${shortId}`;
};

export const generateSlug = (name: string, id: string): string => {
  const shortId = id.split('-')[0].toLowerCase();
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${shortId}`;
};

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
  brand: string,
  category: CategoryTemplate,
  attributes: Record<string, any>
): string => {
  const variant = getRandomItem(category.variants);
  
  if (category.id === 'laptops') {
    const screenSize = attributes['screenSize'] || getRandomItem(['13 Inch', '14 Inch', '15 Inch', '16 Inch']);
    const modelType = getRandomItem(category.variants);
    return `${brand} ${modelType} ${screenSize}`;
  }
  
  if (category.id === 'audio') {
    const modelType = getRandomItem(['Studio', 'Bass', 'Noise']);
    return `${brand} ${modelType} ${variant}`;
  }
  
  if (category.id === 'accessories') {
    const connector = getRandomItem(category.variants);
    const deviceType = getRandomItem(['Cable', 'Hub', 'Adapter']);
    return `${brand} ${connector} ${deviceType}`;
  }
  
  return `${brand} ${category.models[0] || ''} ${variant}`.trim();
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
  existingProducts: Product[] = []
): Product => {
  const id = generateUUID();
  const attributes = generateAttributes(category.attributes);
  const name = generateProductName(brand.name, category, attributes);
  const dimensions = generateDimensions(category);
  
  return {
    id,
    brand: brand.name,
    name,
    slug: generateSlug(name, id),
    price: faker.number.int({ min: 10, max: 3000 }),
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
  count: number
): Product[] => {
  const products: Product[] = [];
  const selectedBrands = brands.filter((b) => selectedBrandIds.includes(b.id));
  
  if (selectedBrands.length === 0) {
    return products;
  }
  
  for (let i = 0; i < count; i++) {
    const brand = selectedBrands[i % selectedBrands.length];
    const product = generateProduct(category, brand, products);
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
