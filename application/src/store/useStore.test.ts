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
import { DEFAULT_REFERENCE_TIME } from '../core/generationTime';
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
let migratePersistedState: (typeof import('./useStore'))['migratePersistedState'];
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
  ({ useStore, migratePersistedState } = await import('./useStore'));
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
    outputMapping: {},
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

describe('output mapping', () => {
  it('stores overrides and drops canonical resets', () => {
    const { setFieldName } = useStore.getState();

    setFieldName('products', 'weight_kg', 'w_kg');
    setFieldName('products', 'sku', 'item_code');

    expect(useStore.getState().outputMapping).toEqual({
      products: { weight_kg: 'w_kg', sku: 'item_code' },
    });

    setFieldName('products', 'weight_kg', 'weight_kg');

    expect(useStore.getState().outputMapping).toEqual({
      products: { sku: 'item_code' },
    });
  });

  it('resets fields, tables, and the full mapping', () => {
    const {
      setFieldName,
      resetFieldName,
      resetTableMapping,
      resetOutputMapping,
    } = useStore.getState();

    setFieldName('products', 'weight_kg', 'w_kg');
    setFieldName('orders', 'customer_id', 'buyer_id');

    resetFieldName('products', 'weight_kg');
    expect(useStore.getState().outputMapping).toEqual({
      orders: { customer_id: 'buyer_id' },
    });

    resetTableMapping('orders');
    expect(useStore.getState().outputMapping).toEqual({});

    setFieldName('reviews', 'rating', 'score');
    resetOutputMapping();
    expect(useStore.getState().outputMapping).toEqual({});
  });
});

describe('preset output mapping', () => {
  it('applies mapping from an imported preset', () => {
    useStore.getState().applyPreset({
      category,
      brands,
      selectedBrands: brands.map((brand) => brand.id),
      settings: useStore.getState().settings,
      outputMapping: { products: { weight_kg: 'w_kg' } },
    });

    expect(useStore.getState().outputMapping).toEqual({
      products: { weight_kg: 'w_kg' },
    });
  });
});

describe('persisted store migration', () => {
  it('adds an identity mapping to version 1 state', () => {
    const settings = {
      seed: 7,
      productCount: 12,
      customerCount: 0,
      ordersPerCustomer: { min: 0, max: 0 },
      reviewCount: 0,
    };
    const migrated = migratePersistedState({ settings }, 1);

    expect(migrated.settings).toEqual({ ...settings, referenceTime: DEFAULT_REFERENCE_TIME });
    expect(migrated.outputMapping).toEqual({});
  });

  it('persists mappings and reference time in the version 3 payload', () => {
    useStore.getState().setFieldName('products', 'weight_kg', 'w_kg');
    const referenceTime = '2025-06-15T13:45:12.123Z';
    useStore.getState().updateSettings({ referenceTime });

    const stored = JSON.parse(
      storageData.get('dataforge-config') ?? '{}',
    );

    expect(stored.version).toBe(3);
    expect(stored.state.settings.referenceTime).toBe(referenceTime);
    expect(stored.state.outputMapping).toEqual({
      products: { weight_kg: 'w_kg' },
    });
  });

  it('restores the saved reference time when rehydrating', async () => {
    const referenceTime = '2024-09-10T11:12:13.456Z';
    useStore.getState().updateSettings({ referenceTime });
    const saved = storageData.get('dataforge-config')!;
    useStore.getState().updateSettings({ referenceTime: DEFAULT_REFERENCE_TIME });
    storageData.set('dataforge-config', saved);

    await useStore.persist.rehydrate();

    expect(useStore.getState().settings.referenceTime).toBe(referenceTime);
  });

  it.each([0, 1, 2])('adds a stable reference time to version %s state', (version) => {
    const migrated = migratePersistedState({ settings: { seed: 17 } }, version);

    expect(migrated.settings?.referenceTime).toBe(DEFAULT_REFERENCE_TIME);
    expect(migrated.settings?.seed).toBe(17);
  });

  it('preserves a valid version 2 mapping', () => {
    const outputMapping = {
      products: { weight_kg: 'w_kg' },
    };
    const migrated = migratePersistedState({ outputMapping }, 2);

    expect(migrated.outputMapping).toEqual(outputMapping);
  });

  it('drops malformed version 2 mappings', () => {
    expect(
      migratePersistedState(
        { outputMapping: { products: { weight_kg: 1 } } },
        2,
      ).outputMapping,
    ).toEqual({});
    expect(
      migratePersistedState({ outputMapping: null }, 2).outputMapping,
    ).toEqual({});
  });
});
