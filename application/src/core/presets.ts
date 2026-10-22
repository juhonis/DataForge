import type { GenerationSettings } from '../types/dataset';
import type {
  AttributeDefinition,
  Brand,
  CategoryTemplate,
  DimensionProfile,
  DimensionRange,
  IdFormat,
  NumberRange,
  PriceRange,
} from '../types/product';

export const PRESET_FORMAT = 'dataforge' as const;
export const PRESET_VERSION = 1 as const;

export interface DataForgePreset {
  format: typeof PRESET_FORMAT;
  version: typeof PRESET_VERSION;
  category: CategoryTemplate;
  brands: Brand[];
  selectedBrands: string[];
  settings: GenerationSettings;
}

export type PresetConfig = Omit<DataForgePreset, 'format' | 'version'>;

export class PresetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PresetValidationError';
  }
}

const DIMENSION_KEYS = [
  'weight_kg',
  'length_cm',
  'width_cm',
  'height_cm',
] as const;

const ID_FORMATS: readonly IdFormat[] = ['uuid', 'sequential', 'custom'];

const ATTRIBUTE_TYPES: readonly AttributeDefinition['type'][] = [
  'select',
  'number',
  'boolean',
  'text',
];

const MAX_COUNT = 1000;
const MAX_ORDERS_PER_CUSTOMER = 10;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === 'string';

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const isIntegerBetween = (
  value: unknown,
  min: number,
  max: number,
): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isRecordOfStringArrays = (
  value: unknown,
): value is Record<string, string[]> =>
  isRecord(value) && Object.values(value).every(isStringArray);

const isRecordOfNumbers = (
  value: unknown,
): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every(isFiniteNumber);

const isRecordOfPositiveNumbers = (
  value: unknown,
): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every(isPositiveNumber);

const isPriceRange = (value: unknown): value is PriceRange => {
  if (!isRecord(value)) return false;

  if (
    value.decimalPlaces !== undefined &&
    !isIntegerBetween(value.decimalPlaces, 0, 2)
  ) {
    return false;
  }

  return (
    isFiniteNumber(value.min) &&
    isFiniteNumber(value.max) &&
    value.min >= 0 &&
    value.max >= value.min
  );
};

const isIntegerRange = (
  value: unknown,
  minValue: number,
): value is NumberRange => {
  if (!isRecord(value)) return false;

  const { min, max } = value;

  return (
    isIntegerBetween(min, minValue, Number.MAX_SAFE_INTEGER) &&
    isIntegerBetween(max, minValue, Number.MAX_SAFE_INTEGER) &&
    max >= min
  );
};

const isDimensionRange = (value: unknown): value is DimensionRange => {
  if (!isRecord(value)) return false;

  if (!isPriceRange(value)) return false;
  if (
    value.fractionDigits !== undefined &&
    !isIntegerBetween(value.fractionDigits, 0, 10)
  ) {
    return false;
  }
  if (
    value.nullableProbability !== undefined &&
    (!isFiniteNumber(value.nullableProbability) ||
      value.nullableProbability < 0 ||
      value.nullableProbability > 1)
  ) {
    return false;
  }

  return true;
};

const isDimensionProfile = (value: unknown): value is DimensionProfile => {
  if (!isRecord(value)) return false;

  return DIMENSION_KEYS.every((key) => isDimensionRange(value[key]));
};

const isAttributeDefinition = (
  value: unknown,
): value is AttributeDefinition => {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.key)) return false;
  if (
    !isString(value.type) ||
    !ATTRIBUTE_TYPES.includes(value.type as AttributeDefinition['type'])
  ) {
    return false;
  }
  if (value.options !== undefined && !isStringArray(value.options)) return false;
  if (value.min !== undefined && !isFiniteNumber(value.min)) return false;
  if (value.max !== undefined && !isFiniteNumber(value.max)) return false;

  return true;
};

const isCategoryTemplate = (value: unknown): value is CategoryTemplate => {
  if (!isRecord(value)) return false;

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.slug) ||
    !isNonEmptyString(value.skuPrefix) ||
    !isNonEmptyString(value.nameTemplate)
  ) {
    return false;
  }

  if (
    !isStringArray(value.unsplashIds) ||
    !isStringArray(value.defaultBrands) ||
    !isStringArray(value.models) ||
    !isRecordOfStringArrays(value.brandModels) ||
    !isDimensionProfile(value.dimensions) ||
    !Array.isArray(value.attributes) ||
    !value.attributes.every(isAttributeDefinition) ||
    !isPriceRange(value.priceRange) ||
    !isString(value.idFormat) ||
    !ID_FORMATS.includes(value.idFormat as IdFormat) ||
    typeof value.usesVariantInName !== 'boolean'
  ) {
    return false;
  }

  if (value.variants !== undefined && !isStringArray(value.variants)) return false;
  if (value.nameParts !== undefined && !isRecordOfStringArrays(value.nameParts)) {
    return false;
  }
  if (
    value.brandWeights !== undefined &&
    !isRecordOfPositiveNumbers(value.brandWeights)
  ) {
    return false;
  }
  if (
    value.imageCountRange !== undefined &&
    !isIntegerRange(value.imageCountRange, 1)
  ) {
    return false;
  }
  if (
    value.stockRange !== undefined &&
    !isIntegerRange(value.stockRange, 0)
  ) {
    return false;
  }
  if (value.idPrefix !== undefined && !isString(value.idPrefix)) return false;

  return true;
};

const isBrand = (value: unknown): value is Brand => {
  if (!isRecord(value)) return false;

  const models = value.models;
  const selectedModels = value.selectedModels;

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isStringArray(models) ||
    !isStringArray(selectedModels) ||
    !isRecordOfNumbers(value.modelPrices)
  ) {
    return false;
  }

  if (
    value.priceRange !== undefined &&
    !isPriceRange(value.priceRange)
  ) {
    return false;
  }

  if (value.weight !== undefined && !isPositiveNumber(value.weight)) {
    return false;
  }

  return selectedModels.every((model) => models.includes(model));
};

const isGenerationSettings = (
  value: unknown,
): value is GenerationSettings => {
  if (!isRecord(value)) return false;

  if (
    !Number.isSafeInteger(value.seed) ||
    (value.seed as number) < 0 ||
    !isIntegerBetween(value.productCount, 1, MAX_COUNT) ||
    !isIntegerBetween(value.customerCount, 0, MAX_COUNT) ||
    !isIntegerBetween(value.reviewCount, 0, MAX_COUNT) ||
    !isRecord(value.ordersPerCustomer)
  ) {
    return false;
  }

  const orders = value.ordersPerCustomer;

  return (
    isIntegerBetween(orders.min, 0, MAX_ORDERS_PER_CUSTOMER) &&
    isIntegerBetween(orders.max, 0, MAX_ORDERS_PER_CUSTOMER) &&
    orders.min <= orders.max
  );
};

const assertUnique = (values: readonly string[], label: string): void => {
  if (new Set(values).size !== values.length) {
    throw new PresetValidationError(`Preset contains duplicate ${label}.`);
  }
};

export const createPreset = (config: PresetConfig): DataForgePreset => ({
  format: PRESET_FORMAT,
  version: PRESET_VERSION,
  category: config.category,
  brands: config.brands,
  selectedBrands: config.selectedBrands,
  settings: config.settings,
});

export const serializePreset = (preset: DataForgePreset): string =>
  JSON.stringify(preset, null, 2);

export const parsePreset = (contents: string): DataForgePreset => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new PresetValidationError('Preset is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new PresetValidationError('Preset must be a JSON object.');
  }
  if (parsed.format !== PRESET_FORMAT) {
    throw new PresetValidationError(
      `Unsupported preset format: ${String(parsed.format)}.`,
    );
  }
  if (parsed.version !== PRESET_VERSION) {
    throw new PresetValidationError(
      `Unsupported preset version: ${String(parsed.version)}.`,
    );
  }
  if (!isCategoryTemplate(parsed.category)) {
    throw new PresetValidationError('Preset category is invalid.');
  }
  if (!Array.isArray(parsed.brands) || !parsed.brands.every(isBrand)) {
    throw new PresetValidationError('Preset brands are invalid.');
  }
  if (!isStringArray(parsed.selectedBrands)) {
    throw new PresetValidationError('Preset selectedBrands are invalid.');
  }
  if (!isGenerationSettings(parsed.settings)) {
    throw new PresetValidationError('Preset settings are invalid.');
  }

  const brandIds = parsed.brands.map((brand) => brand.id);
  assertUnique(brandIds, 'brand ids');
  assertUnique(parsed.selectedBrands, 'selected brand ids');

  if (parsed.selectedBrands.some((id) => !brandIds.includes(id))) {
    throw new PresetValidationError(
      'Preset selectedBrands reference unknown brands.',
    );
  }

  return {
    format: PRESET_FORMAT,
    version: PRESET_VERSION,
    category: parsed.category,
    brands: parsed.brands,
    selectedBrands: parsed.selectedBrands,
    settings: parsed.settings,
  };
};
