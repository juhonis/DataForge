import { describe, expect, it } from 'vitest';
import type { GenerationSettings } from '../types/dataset';
import type { Brand } from '../types/product';
import type { FieldMapping } from './outputSchema';
import { CATEGORY_TEMPLATES } from './categories';
import { DEFAULT_REFERENCE_TIME } from './generationTime';
import { generateDataset } from './generate';
import { SeededRng } from './rng';
import {
  PRESET_FORMAT,
  PRESET_VERSION,
  PresetValidationError,
  createPreset,
  parsePreset,
  serializePreset,
} from './presets';

const category = structuredClone(CATEGORY_TEMPLATES[0]);

const brands: Brand[] = [
  {
    id: 'brand-apple',
    name: 'Apple',
    weight: 2.5,
    models: ['iPhone 15', 'iPhone 15 Pro'],
    selectedModels: ['iPhone 15'],
    priceRange: { min: 499, max: 1299 },
    modelPrices: { 'iPhone 15': 799 },
  },
  {
    id: 'brand-google',
    name: 'Google',
    weight: 1,
    models: ['Pixel 8'],
    selectedModels: ['Pixel 8'],
    modelPrices: {},
  },
];

const settings: GenerationSettings = {
  seed: 42,
  referenceTime: '2025-06-15T13:45:12.123Z',
  productCount: 12,
  customerCount: 8,
  ordersPerCustomer: { min: 1, max: 3 },
  reviewCount: 10,
};

const outputMapping: FieldMapping = {
  products: { weight_kg: 'w_kg' },
  orders: { customer_id: 'buyer_id' },
};

const preset = createPreset({
  category,
  brands,
  selectedBrands: ['brand-apple', 'brand-google'],
  settings,
  outputMapping,
});

const presetJson = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({ ...preset, ...overrides });

describe('preset serialization', () => {
  it('creates a versioned preset from config', () => {
    expect(preset).toMatchObject({
      format: PRESET_FORMAT,
      version: PRESET_VERSION,
      category,
      brands,
      selectedBrands: ['brand-apple', 'brand-google'],
      settings,
      outputMapping,
    });
  });

  it('round-trips a preset through serialization', () => {
    const contents = serializePreset(preset);

    expect(contents).toContain('\n  "format": "dataforge"');
    expect(parsePreset(contents)).toEqual(preset);
  });

  it('preserves output field mappings', () => {
    const parsed = parsePreset(serializePreset(preset));

    expect(parsed.outputMapping).toEqual(outputMapping);
  });

  it('reproduces the complete dataset after preset export and import', () => {
    const generate = (config: typeof preset) => generateDataset(
      config.category,
      config.brands,
      config.selectedBrands,
      config.settings,
      new SeededRng(config.settings.seed),
    );

    expect(JSON.stringify(generate(parsePreset(serializePreset(preset))))).toBe(
      JSON.stringify(generate(preset)),
    );
  });

  it.each([1, 2])('adds a stable reference time to version %s presets', (version) => {
    const legacySettings: Partial<GenerationSettings> = { ...settings };
    delete legacySettings.referenceTime;
    const parsed = parsePreset(presetJson({ version, settings: legacySettings }));

    expect(parsed.settings).toEqual({
      ...settings,
      referenceTime: DEFAULT_REFERENCE_TIME,
    });
    expect(parsed.version).toBe(PRESET_VERSION);
  });

  it('upgrades version 1 presets with an identity mapping', () => {
    const legacyPreset = {
      format: PRESET_FORMAT,
      version: 1,
      category: preset.category,
      brands: preset.brands,
      selectedBrands: preset.selectedBrands,
      settings: preset.settings,
    };
    const parsed = parsePreset(JSON.stringify(legacyPreset));

    expect(parsed.version).toBe(PRESET_VERSION);
    expect(parsed.outputMapping).toEqual({});
  });

  it('preserves brand models and price overrides', () => {
    const parsed = parsePreset(serializePreset(preset));
    const apple = parsed.brands.find((brand) => brand.id === 'brand-apple');

    expect(apple?.models).toEqual(['iPhone 15', 'iPhone 15 Pro']);
    expect(apple?.selectedModels).toEqual(['iPhone 15']);
    expect(apple?.weight).toBe(2.5);
    expect(apple?.priceRange).toEqual({ min: 499, max: 1299 });
    expect(apple?.modelPrices).toEqual({ 'iPhone 15': 799 });
  });

  it('rejects malformed JSON', () => {
    expect(() => parsePreset('{')).toThrow(PresetValidationError);
    expect(() => parsePreset('{')).toThrow('Preset is not valid JSON.');
  });

  it('rejects non-object JSON', () => {
    expect(() => parsePreset('[]')).toThrow('Preset must be a JSON object.');
  });

  it('rejects a different format', () => {
    expect(() => parsePreset(presetJson({ format: 'other' }))).toThrow(
      'Unsupported preset format: other.',
    );
  });

  it('rejects an unsupported version', () => {
    expect(() => parsePreset(presetJson({ version: 4 }))).toThrow(
      'Unsupported preset version: 4.',
    );
  });

  it('rejects missing or malformed output mappings', () => {
    expect(() =>
      parsePreset(presetJson({ outputMapping: undefined })),
    ).toThrow('Preset outputMapping is invalid.');
    expect(() =>
      parsePreset(presetJson({ outputMapping: [] })),
    ).toThrow('Preset outputMapping is invalid.');
    expect(() =>
      parsePreset(
        presetJson({ outputMapping: { products: { unknown: 'value' } } }),
      ),
    ).toThrow('Preset outputMapping is invalid');
  });

  it('rejects output mappings with duplicate names', () => {
    expect(() =>
      parsePreset(
        presetJson({ outputMapping: { customers: { name: 'email' } } }),
      ),
    ).toThrow('Preset outputMapping is invalid');
  });

  it('rejects output mappings that collide with CSV attributes', () => {
    const attributeKey = preset.category.attributes[0]?.key ?? 'color';

    expect(() =>
      parsePreset(
        presetJson({
          outputMapping: {
            products: { name: `attr_${attributeKey}` },
          },
        }),
      ),
    ).toThrow('Preset outputMapping is invalid');
  });

  it('rejects an invalid category', () => {
    const invalidCategory = { ...preset.category, name: '' };

    expect(() => parsePreset(presetJson({ category: invalidCategory }))).toThrow(
      'Preset category is invalid.',
    );
  });

  it('preserves decimal price settings', () => {
    const decimalCategory = {
      ...preset.category,
      priceRange: { min: 9.99, max: 99.99, decimalPlaces: 2 },
    };
    const parsed = parsePreset(presetJson({ category: decimalCategory }));

    expect(parsed.category.priceRange).toEqual({
      min: 9.99,
      max: 99.99,
      decimalPlaces: 2,
    });
  });

  it.each([3, -1, 1.5])(
    'rejects a decimalPlaces value of %s',
    (decimalPlaces) => {
      const invalidCategory = {
        ...preset.category,
        priceRange: { ...preset.category.priceRange, decimalPlaces },
      };

      expect(() =>
        parsePreset(presetJson({ category: invalidCategory })),
      ).toThrow('Preset category is invalid.');
    },
  );

  it.each([
    ['fractional image counts', { imageCountRange: { min: 1, max: 2.5 } }],
    ['zero image counts', { imageCountRange: { min: 0, max: 2 } }],
    ['negative stock', { stockRange: { min: -1, max: 10 } }],
    ['inverted stock ranges', { stockRange: { min: 10, max: 5 } }],
  ])('rejects %s', (_label, ranges) => {
    expect(() =>
      parsePreset(presetJson({
        category: { ...preset.category, ...ranges },
      })),
    ).toThrow('Preset category is invalid.');
  });

  it('accepts categories without image or stock ranges', () => {
    const legacyCategory = { ...preset.category };
    delete legacyCategory.imageCountRange;
    delete legacyCategory.stockRange;

    const parsed = parsePreset(presetJson({ category: legacyCategory }));

    expect(parsed.category.imageCountRange).toBeUndefined();
    expect(parsed.category.stockRange).toBeUndefined();
  });

  it('rejects invalid brands', () => {
    expect(() => parsePreset(presetJson({ brands: 'nope' }))).toThrow(
      'Preset brands are invalid.',
    );
  });

  it('rejects non-positive brand weights', () => {
    const invalidBrand = { ...preset.brands[0], weight: 0 };

    expect(() => parsePreset(presetJson({
      brands: [invalidBrand, preset.brands[1]],
    }))).toThrow('Preset brands are invalid.');
  });

  it('rejects invalid category brand weights', () => {
    const invalidCategory = {
      ...preset.category,
      brandWeights: { Apple: 0 },
    };

    expect(() => parsePreset(presetJson({ category: invalidCategory }))).toThrow(
      'Preset category is invalid.',
    );
  });

  it('rejects selected models that are not in the model list', () => {
    const invalidBrand = {
      ...preset.brands[0],
      selectedModels: ['Unknown Model'],
    };

    expect(() => parsePreset(presetJson({
      brands: [invalidBrand, preset.brands[1]],
    }))).toThrow('Preset brands are invalid.');
  });

  it('rejects selected brands that do not exist', () => {
    expect(() => parsePreset(presetJson({
      selectedBrands: ['brand-missing'],
    }))).toThrow('Preset selectedBrands reference unknown brands.');
  });

  it('rejects duplicate brand ids', () => {
    const duplicateBrand = { ...preset.brands[1], id: preset.brands[0].id };

    expect(() => parsePreset(presetJson({
      brands: [preset.brands[0], duplicateBrand],
      selectedBrands: [preset.brands[0].id],
    }))).toThrow('Preset contains duplicate brand ids.');
  });

  it('rejects duplicate selected brand ids', () => {
    expect(() => parsePreset(presetJson({
      selectedBrands: ['brand-apple', 'brand-apple'],
    }))).toThrow('Preset contains duplicate selected brand ids.');
  });

  it.each([
    ['a negative seed', { seed: -1 }],
    ['a missing reference time', { referenceTime: undefined }],
    ['an invalid reference time', { referenceTime: 'not-a-date' }],
    ['an impossible date', { referenceTime: '2026-02-30T00:00:00.000Z' }],
    ['a timezone-less reference time', { referenceTime: '2026-01-01T00:00:00.000' }],
    ['a zero product count', { productCount: 0 }],
    ['a fractional customer count', { customerCount: 1.5 }],
    ['a reversed order range', { ordersPerCustomer: { min: 3, max: 1 } }],
    ['an excessive order range', { ordersPerCustomer: { min: 1, max: 11 } }],
  ])('rejects settings with %s', (_label, overrides) => {
    expect(() => parsePreset(presetJson({
      settings: { ...preset.settings, ...overrides },
    }))).toThrow('Preset settings are invalid.');
  });
});
