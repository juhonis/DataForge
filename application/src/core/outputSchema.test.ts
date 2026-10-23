import { describe, expect, it } from 'vitest';
import type { Dataset } from '../types/dataset';
import {
  DATASET_TABLES,
  FIXED_FIELDS,
  RENAMEABLE_FIELDS,
  applyDatasetFieldMapping,
  applyFieldMapping,
  getCsvAttributeColumnNames,
  getEffectiveFieldName,
  isFieldMapping,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  validateFieldMapping,
  type DatasetTable,
  type FieldMapping,
} from './outputSchema';

const dataset: Dataset = {
  products: [
    {
      id: 'p1',
      brand: 'Acme',
      name: 'Phone',
      description: 'A useful phone.',
      slug: 'phone',
      price: 99.5,
      stock_quantity: 12,
      category: 'Phones',
      sku: 'ACM-1',
      weight_kg: 0.4,
      length_cm: 15,
      width_cm: 8,
      height_cm: 1,
      images: ['https://example.com/phone.jpg'],
      attributes: { color: 'red', storage: '128GB' },
    },
  ],
  customers: [
    {
      id: 'c1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '555-0100',
      city: 'London',
      country: 'UK',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  orders: [
    {
      id: 'o1',
      customer_id: 'c1',
      status: 'paid',
      placed_at: '2026-01-02T00:00:00.000Z',
      total: 99.5,
      currency: 'USD',
    },
  ],
  order_lines: [
    {
      id: 'l1',
      order_id: 'o1',
      product_id: 'p1',
      quantity: 1,
      unit_price: 99.5,
      line_total: 99.5,
    },
  ],
  reviews: [
    {
      id: 'r1',
      product_id: 'p1',
      customer_id: 'c1',
      rating: 5,
      title: 'Great',
      body: 'Works well.',
      created_at: '2026-01-03T00:00:00.000Z',
    },
  ],
};

const firstRows: Record<DatasetTable, Record<string, unknown>> = {
  products: dataset.products[0] as unknown as Record<string, unknown>,
  customers: dataset.customers[0] as unknown as Record<string, unknown>,
  orders: dataset.orders[0] as unknown as Record<string, unknown>,
  order_lines: dataset.order_lines[0] as unknown as Record<string, unknown>,
  reviews: dataset.reviews[0] as unknown as Record<string, unknown>,
};

describe('output schema metadata', () => {
  it('lists every renameable field without fixed fields', () => {
    for (const table of DATASET_TABLES) {
      const fixedFields = FIXED_FIELDS[table] as readonly string[];
      const expected = Object.keys(firstRows[table]).filter(
        (field) => !fixedFields.includes(field),
      );

      expect(RENAMEABLE_FIELDS[table]).toEqual(expected);
    }
  });

  it('keeps the product attributes container fixed', () => {
    expect(FIXED_FIELDS.products).toContain('attributes');
    expect(RENAMEABLE_FIELDS.products).not.toContain('attributes');
  });

  it('builds flattened CSV attribute column names', () => {
    expect(getCsvAttributeColumnNames(['color', 'storage'])).toEqual([
      'attr_color',
      'attr_storage',
    ]);
  });
});

describe('field mapping transforms', () => {
  it('leaves rows and datasets byte-identical with an identity mapping', () => {
    for (const table of DATASET_TABLES) {
      expect(applyFieldMapping([firstRows[table]], table, {})).toEqual([
        firstRows[table],
      ]);
    }

    const mapped = applyDatasetFieldMapping(dataset, {});

    expect(mapped).toEqual(dataset);
    expect(JSON.stringify(mapped)).toBe(JSON.stringify(dataset));
    expect(Object.keys(mapped)).toEqual([...DATASET_TABLES]);
  });

  it('renames fields without changing values or source data', () => {
    const mapping: FieldMapping = {
      products: { weight_kg: 'w_kg' },
      orders: { customer_id: 'buyer_id' },
      reviews: { rating: 'score' },
    };
    const mapped = applyDatasetFieldMapping(dataset, mapping);

    expect(mapped.products[0]).toMatchObject({
      w_kg: 0.4,
      attributes: { color: 'red', storage: '128GB' },
    });
    expect(mapped.products[0]).not.toHaveProperty('weight_kg');
    expect(mapped.orders[0].buyer_id).toBe('c1');
    expect(mapped.reviews[0].score).toBe(5);
    expect(dataset.products[0].weight_kg).toBe(0.4);
    expect(dataset.orders[0].customer_id).toBe('c1');
  });

  it('preserves the original field order', () => {
    const row = firstRows.products;
    const mapped = applyFieldMapping(
      [row],
      'products',
      { products: { name: 'product_name' } },
    );

    const expected = Object.keys(row);
    expected[2] = 'product_name';

    expect(Object.keys(mapped[0])).toEqual(expected);
  });

  it('never renames fixed fields even if a mapping contains them', () => {
    expect(
      getEffectiveFieldName('products', 'attributes', {
        products: { attributes: 'attrs' },
      }),
    ).toBe('attributes');
    expect(
      applyFieldMapping(
        [firstRows.products],
        'products',
        { products: { attributes: 'attrs' } },
      )[0],
    ).toHaveProperty('attributes');
  });

  it('keeps foreign-key values intact when only names change', () => {
    const mapped = applyDatasetFieldMapping(dataset, {
      customers: { id: 'customer_key' },
      orders: { customer_id: 'buyer_key' },
    });

    expect(mapped.customers[0].customer_key).toBe('c1');
    expect(mapped.orders[0].buyer_key).toBe('c1');
  });
});

describe('field mapping validation', () => {
  it('accepts empty and valid mappings', () => {
    expect(validateFieldMapping({})).toEqual([]);
    expect(
      validateFieldMapping({
        products: { weight_kg: 'w_kg', sku: 'item_code' },
        customers: { created_at: 'joined_at' },
      }),
    ).toEqual([]);
  });

  it('rejects blank and invalid identifiers', () => {
    const issues = validateFieldMapping({
      customers: { name: '   ', email: '1email', city: 'home-city' },
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'customers',
          field: 'name',
          message: 'Field "name" cannot be blank.',
        }),
        expect.objectContaining({
          table: 'customers',
          field: 'email',
          message: 'Field "email" must be a valid identifier.',
        }),
        expect.objectContaining({
          table: 'customers',
          field: 'city',
          message: 'Field "city" must be a valid identifier.',
        }),
      ]),
    );
  });

  it('rejects collisions with unmapped canonical fields', () => {
    const issues = validateFieldMapping({
      customers: { name: 'email' },
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
          message: 'Field "name" produces duplicate name "email".',
        }),
        expect.objectContaining({
          field: 'email',
          message: 'Field "email" produces duplicate name "email".',
        }),
      ]),
    );
  });

  it('compares duplicate names case-insensitively', () => {
    const issues = validateFieldMapping({
      customers: { name: 'Email' },
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'email' }),
      ]),
    );
  });

  it('rejects unknown and fixed fields', () => {
    const issues = validateFieldMapping({
      products: { attributes: 'attrs', nickname: 'alias' },
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'attributes',
          message: 'Field "attributes" is not renameable.',
        }),
        expect.objectContaining({
          field: 'nickname',
          message: 'Unknown field "nickname" in products.',
        }),
      ]),
    );
  });

  it('rejects collisions with reserved CSV columns', () => {
    const issues = validateFieldMapping(
      { products: { sku: 'ATTR_COLOR' } },
      { reservedNames: { products: ['attr_color'] } },
    );

    expect(issues).toContainEqual(
      expect.objectContaining({
        field: 'sku',
        value: 'ATTR_COLOR',
        message: 'Field "sku" uses reserved name "ATTR_COLOR".',
      }),
    );
  });
});

describe('field mapping guards', () => {
  it('accepts mapping-shaped values', () => {
    expect(isFieldMapping({})).toBe(true);
    expect(
      isFieldMapping({
        products: { weight_kg: 'w_kg' },
        reviews: { rating: 'score' },
      }),
    ).toBe(true);
  });

  it('rejects malformed mappings', () => {
    expect(isFieldMapping(null)).toBe(false);
    expect(isFieldMapping([])).toBe(false);
    expect(isFieldMapping({ unknown: {} })).toBe(false);
    expect(isFieldMapping({ products: [] })).toBe(false);
    expect(isFieldMapping({ products: { weight_kg: 1 } })).toBe(false);
  });
});

describe('case conversion', () => {
  it.each([
    ['weight_kg', 'weight_kg', 'weightKg', 'WeightKg'],
    ['created_at', 'created_at', 'createdAt', 'CreatedAt'],
    ['customer_id', 'customer_id', 'customerId', 'CustomerId'],
    ['id', 'id', 'id', 'Id'],
    ['sku', 'sku', 'sku', 'Sku'],
    ['weightKg', 'weight_kg', 'weightKg', 'WeightKg'],
  ])(
    'converts %s consistently',
    (value, snake, camel, pascal) => {
      expect(toSnakeCase(value)).toBe(snake);
      expect(toCamelCase(value)).toBe(camel);
      expect(toPascalCase(value)).toBe(pascal);
    },
  );

  it('returns an empty string for blank input', () => {
    expect(toSnakeCase('   ')).toBe('');
    expect(toCamelCase('   ')).toBe('');
    expect(toPascalCase('   ')).toBe('');
  });
});
