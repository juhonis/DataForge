import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CATEGORY_TEMPLATES } from '../core/categories';
import type { Brand, CategoryTemplate } from '../types/product';

const storageData = new Map<string, string>();

const storage = {
  getItem: (key: string) => storageData.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageData.set(key, value);
  },
  removeItem: (key: string) => {
    storageData.delete(key);
  },
  clear: () => {
    storageData.clear();
  },
  key: (index: number) => [...storageData.keys()][index] ?? null,
  get length() {
    return storageData.size;
  },
};

let useStore: (typeof import('./useStore'))['useStore'];
let category: CategoryTemplate;
let brands: Brand[];

const makeBrands = (): Brand[] => [
  {
    id: 'brand-apple',
    name: 'Apple',
    models: ['Phone'],
    selectedModels: ['Phone'],
    modelPrices: { Phone: 799 },
  },
  {
    id: 'brand-google',
    name: 'Google',
    models: ['Pixel'],
    selectedModels: ['Pixel'],
    modelPrices: {},
  },
];

const getBrand = (id = 'brand-apple') =>
  useStore.getState().brands.find((brand) => brand.id === id)!;

const getCategory = () => useStore.getState().selectedCategory;

beforeAll(async () => {
  vi.stubGlobal('localStorage', storage);
  ({ useStore } = await import('./useStore'));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  storageData.clear();

  category = structuredClone(CATEGORY_TEMPLATES[0]);
  category.attributes = [
    { key: 'storage', type: 'select', options: ['128GB'] },
    { key: 'color', type: 'select', options: ['Black'] },
  ];
  brands = makeBrands();

  useStore.setState({
    categories: [category],
    selectedCategory: category,
    brands,
    selectedBrands: brands.map((brand) => brand.id),
    dataset: null,
  });
});

describe('brand mutations', () => {
  it('adds a trimmed model once and selects it', () => {
    const { addBrandModel } = useStore.getState();

    addBrandModel('brand-apple', '  Phone Pro  ');
    addBrandModel('brand-apple', 'Phone Pro');
    addBrandModel('brand-apple', '   ');

    expect(getBrand().models).toEqual(['Phone', 'Phone Pro']);
    expect(getBrand().selectedModels).toEqual(['Phone', 'Phone Pro']);
  });

  it('renames a model across models, selections, and prices', () => {
    useStore.getState().updateBrandModel('brand-apple', 'Phone', 'Phone X');

    expect(getBrand().models).toEqual(['Phone X']);
    expect(getBrand().selectedModels).toEqual(['Phone X']);
    expect(getBrand().modelPrices).toEqual({ 'Phone X': 799 });
  });

  it('refuses colliding and blank model renames', () => {
    useStore.getState().addBrandModel('brand-apple', 'Tablet');
    useStore.getState().updateBrandModel('brand-apple', 'Phone', 'Tablet');
    useStore.getState().updateBrandModel('brand-apple', 'Phone', '   ');

    expect(getBrand().models).toEqual(['Phone', 'Tablet']);
    expect(getBrand().selectedModels).toEqual(['Phone', 'Tablet']);
    expect(getBrand().modelPrices).toEqual({ Phone: 799 });
  });

  it('drops the exact price when a model is removed', () => {
    useStore.getState().removeBrandModel('brand-apple', 'Phone');

    expect(getBrand().models).toEqual([]);
    expect(getBrand().selectedModels).toEqual([]);
    expect(getBrand().modelPrices).toEqual({});
  });

  it('rejects blank and duplicate brand names', () => {
    const { addBrand, updateBrand } = useStore.getState();

    addBrand(' Apple ');
    addBrand('Google');
    addBrand('   ');

    expect(useStore.getState().brands.map((brand) => brand.name)).toEqual([
      'Apple',
      'Google',
    ]);

    updateBrand('brand-google', ' Apple ');
    updateBrand('brand-google', '   ');

    expect(getBrand('brand-google').name).toBe('Google');
  });
});

describe('attribute mutations', () => {
  it('adds trimmed attributes exactly once', () => {
    const { addAttribute } = useStore.getState();

    addAttribute(category.id, { key: ' ram ', type: 'number' });
    addAttribute(category.id, { key: 'ram', type: 'text' });
    addAttribute(category.id, { key: '   ', type: 'text' });

    expect(getCategory().attributes.map((attribute) => attribute.key)).toEqual([
      'storage',
      'color',
      'ram',
    ]);
  });

  it('renames an attribute key atomically', () => {
    useStore.getState().updateAttribute(category.id, 'storage', {
      key: ' capacity ',
      type: 'number',
      min: 0,
      max: 10,
    });

    expect(getCategory().attributes[0]).toMatchObject({
      key: 'capacity',
      type: 'number',
      min: 0,
      max: 10,
    });
  });

  it('rejects colliding and blank attribute renames', () => {
    const { updateAttribute, renameAttributeKey } = useStore.getState();

    updateAttribute(category.id, 'storage', { key: 'color', type: 'number' });
    renameAttributeKey(category.id, 'storage', ' color ');
    renameAttributeKey(category.id, 'storage', '   ');

    expect(getCategory().attributes).toEqual([
      { key: 'storage', type: 'select', options: ['128GB'] },
      { key: 'color', type: 'select', options: ['Black'] },
    ]);
  });

  it('renames through the dedicated key action', () => {
    useStore.getState().renameAttributeKey(
      category.id,
      'storage',
      ' capacity ',
    );

    expect(getCategory().attributes[0].key).toBe('capacity');
  });

  it('adds trimmed options exactly once', () => {
    const { addAttributeOption } = useStore.getState();

    addAttributeOption(category.id, 'storage', ' 256GB ');
    addAttributeOption(category.id, 'storage', '256GB');
    addAttributeOption(category.id, 'storage', '   ');

    expect(getCategory().attributes[0].options).toEqual([
      '128GB',
      '256GB',
    ]);
  });
});
