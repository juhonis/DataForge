import type {
  AttributeDefinition,
  Brand,
  CategoryTemplate,
  DimensionKey,
  DimensionProfile,
  DimensionRange,
  IdFormat,
  Product,
} from '../../types/product';
import { SeededRng, type Rng } from '../rng';
import { slugify } from '../normalize';

let sequentialCounter = 0;

export const generateId = (
  format: IdFormat,
  prefix?: string,
  index?: number,
  rng?: Pick<Rng, 'uuid'>,
): string => {
  switch (format) {
    case 'sequential':
      return String(index ?? ++sequentialCounter);
    case 'custom':
      return `${prefix ?? ''}${index ?? ++sequentialCounter}`;
    case 'uuid':
    default:
      return rng ? rng.uuid() : crypto.randomUUID();
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

const interpolateTemplate = (
  template: string,
  values: Record<string, unknown>,
): string =>
  template
    .replace(/\{(\w+)\}/g, (_match, key: string) => {
      const value = values[key];
      return value === undefined || value === null ? '' : String(value);
    })
    .replace(/\s+/g, ' ')
    .trim();

const pickModel = (
  brand: Brand,
  category: CategoryTemplate,
  rng: Rng,
): string => {
  const availableModels =
    brand.selectedModels.length > 0
      ? brand.selectedModels
      : brand.models.length > 0
        ? brand.models
        : category.models;

  return availableModels.length > 0 ? rng.pick(availableModels) : '';
};

const generateAttributeValue = (
  definition: AttributeDefinition,
  rng: Rng,
): unknown => {
  switch (definition.type) {
    case 'select':
      return definition.options && definition.options.length > 0
        ? rng.pick(definition.options)
        : null;
    case 'number':
      return rng.int(definition.min ?? 0, definition.max ?? 100);
    case 'boolean':
      return rng.bool();
    case 'text':
      return rng.word();
    default:
      return null;
  }
};

const generateAttributes = (
  definitions: AttributeDefinition[],
  rng: Rng,
): Record<string, unknown> => {
  const attributes: Record<string, unknown> = {};

  for (const definition of definitions) {
    attributes[definition.key] = generateAttributeValue(definition, rng);
  }

  return attributes;
};

const generateProductName = (
  brand: Brand,
  category: CategoryTemplate,
  attributes: Record<string, unknown>,
  rng: Rng,
): { name: string; model: string } => {
  const model = pickModel(brand, category, rng);
  const variants = category.variants ?? [];
  const variant =
    category.usesVariantInName && variants.length > 0
      ? rng.pick(variants)
      : '';

  const nameParts = Object.fromEntries(
    Object.entries(category.nameParts ?? {}).map(([key, options]) => [
      key,
      options.length > 0 ? rng.pick(options) : '',
    ]),
  );

  const name = interpolateTemplate(category.nameTemplate, {
    brand: brand.name,
    model,
    variant,
    ...attributes,
    ...nameParts,
  });

  return { name, model };
};

const generatePrice = (
  brand: Brand,
  model: string,
  category: CategoryTemplate,
  rng: Rng,
): number => {
  if (brand.modelPrices[model] !== undefined) {
    return brand.modelPrices[model];
  }

  const range = brand.priceRange ?? category.priceRange;
  const decimalPlaces =
    range.decimalPlaces ?? category.priceRange.decimalPlaces ?? 0;

  return decimalPlaces === 0
    ? rng.int(range.min, range.max)
    : rng.float(range.min, range.max, decimalPlaces);
};

const generateDimension = (
  range: DimensionRange,
  rng: Rng,
): number | null => {
  if (
    range.nullableProbability !== undefined &&
    rng.bool(range.nullableProbability)
  ) {
    return null;
  }

  return range.fractionDigits === undefined
    ? rng.int(range.min, range.max)
    : rng.float(range.min, range.max, range.fractionDigits);
};

const generateDimensions = (
  profile: DimensionProfile,
  rng: Rng,
): Record<DimensionKey, number | null> => ({
  weight_kg: generateDimension(profile.weight_kg, rng),
  length_cm: generateDimension(profile.length_cm, rng),
  width_cm: generateDimension(profile.width_cm, rng),
  height_cm: generateDimension(profile.height_cm, rng),
});

const brandWeight = (brand: Brand): number =>
  brand.weight !== undefined && Number.isFinite(brand.weight) && brand.weight > 0
    ? brand.weight
    : 1;

export const generateProduct = (
  category: CategoryTemplate,
  brand: Brand,
  rng: Rng,
  index?: number,
): Product => {
  const id = generateId(category.idFormat, category.idPrefix, index, rng);
  const attributes = generateAttributes(category.attributes, rng);
  const { name, model } = generateProductName(brand, category, attributes, rng);
  const price = generatePrice(brand, model, category, rng);

  return {
    id,
    brand: brand.name,
    name,
    description: rng.productDescription(),
    slug: generateSlug(name, id),
    price,
    stock_quantity: rng.int(0, 100),
    category: category.name,
    sku: generateSKU(category.skuPrefix, id),
    ...generateDimensions(category.dimensions, rng),
    images: [rng.pick(category.unsplashIds)],
    attributes,
  };
};

export const generateProducts = (
  category: CategoryTemplate,
  brands: Brand[],
  selectedBrandIds: string[],
  count: number,
  rng: Rng = new SeededRng(),
): Product[] => {
  const products: Product[] = [];
  const selectedBrands = brands.filter((brand) =>
    selectedBrandIds.includes(brand.id),
  );

  if (selectedBrands.length === 0) {
    return products;
  }

  const weightedBrands = selectedBrands.map(
    (brand) => [brand, brandWeight(brand)] as const,
  );

  resetSequentialCounter();

  for (let i = 0; i < count; i++) {
    const brand = rng.weighted(weightedBrands);
    products.push(generateProduct(category, brand, rng, i + 1));
  }

  return products;
};
