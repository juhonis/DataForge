import { describe, expect, it } from 'vitest';
import type { GenerationSettings } from '../types/dataset';
import type { Brand } from '../types/product';
import { CATEGORY_TEMPLATES } from './categories';
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
  productCount: 12,
  customerCount: 8,
  ordersPerCustomer: { min: 1, max: 3 },
  reviewCount: 10,
};

const preset = createPreset({
  category,
  brands,
  selectedBrands: ['brand-apple', 'brand-google'],
  settings,
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
    });
  });

  it('round-trips a preset through serialization', () => {
    const contents = serializePreset(preset);

    expect(contents).toContain('\n  "format": "dataforge"');
    expect(parsePreset(contents)).toEqual(preset);
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
    expect(() => parsePreset(presetJson({ version: 2 }))).toThrow(
      'Unsupported preset version: 2.',
    );
  });

  it('rejects an invalid category', () => {
    const invalidCategory = { ...preset.category, name: '' };

    expect(() => parsePreset(presetJson({ category: invalidCategory }))).toThrow(
      'Preset category is invalid.',
    );
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
