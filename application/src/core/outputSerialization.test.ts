import { describe, expect, it } from 'vitest';
import type { Dataset } from '../types/dataset';
import { toCsv } from './exporters/csv';
import { toJson } from './exporters/json';
import { datasetToSql } from './exporters/sql';
import {
  serializeDatasetAsJson,
  serializeDatasetAsSql,
  serializeRowsAsCsv,
  serializeRowsAsJson,
} from './outputSerialization';
import type { FieldMapping } from './outputSchema';

const dataset = {
  products: [
    {
      id: 'p1',
      name: 'Phone',
      weight_kg: 0.4,
      attributes: { color: 'red' },
    },
  ],
  customers: [{ id: 'c1', name: 'Ada' }],
  orders: [{ id: 'o1', customer_id: 'c1' }],
  order_lines: [{ id: 'l1', order_id: 'o1', product_id: 'p1' }],
  reviews: [{ id: 'r1', product_id: 'p1', customer_id: 'c1' }],
} as unknown as Dataset;

const mapping: FieldMapping = {
  products: { name: 'product_name', weight_kg: 'w_kg' },
  customers: { id: 'customer_key' },
  orders: { id: 'order_key', customer_id: 'buyer_key' },
  order_lines: { order_id: 'order_key', product_id: 'item_key' },
  reviews: { product_id: 'item_key', customer_id: 'buyer_key' },
};

describe('mapped serialization', () => {
  it('keeps every format unchanged for an identity mapping', () => {
    expect(serializeDatasetAsJson(dataset, {})).toBe(toJson(dataset));
    expect(
      serializeRowsAsJson(dataset.products, 'products', {}),
    ).toBe(toJson(dataset.products));
    expect(
      serializeRowsAsCsv(dataset.products, 'products', {}),
    ).toBe(toCsv(dataset.products));
    expect(serializeDatasetAsSql(dataset, {})).toBe(datasetToSql(dataset));
  });

  it('renames fields in row and dataset JSON', () => {
    const rows = JSON.parse(
      serializeRowsAsJson(dataset.customers, 'customers', mapping),
    );
    const full = JSON.parse(serializeDatasetAsJson(dataset, mapping));

    expect(rows).toEqual([{ customer_key: 'c1', name: 'Ada' }]);
    expect(full.products[0]).toMatchObject({
      product_name: 'Phone',
      w_kg: 0.4,
      attributes: { color: 'red' },
    });
    expect(full.orders[0]).toEqual({
      order_key: 'o1',
      buyer_key: 'c1',
    });
    expect(full.order_lines[0]).toEqual({
      id: 'l1',
      order_key: 'o1',
      item_key: 'p1',
    });
    expect(full.reviews[0]).toEqual({
      id: 'r1',
      item_key: 'p1',
      buyer_key: 'c1',
    });
  });

  it('renames CSV headers after flattening attributes', () => {
    const csv = serializeRowsAsCsv(dataset.products, 'products', mapping);
    const headers = csv.split('\r\n')[0].split(',');

    expect(headers).toContain('product_name');
    expect(headers).toContain('w_kg');
    expect(headers).toContain('attr_color');
    expect(headers).not.toContain('name');
    expect(headers).not.toContain('weight_kg');
  });

  it('renames SQL columns but keeps canonical table names', () => {
    const sql = serializeDatasetAsSql(dataset, mapping, { seed: 42 });

    expect(sql).toContain('INSERT INTO "products"');
    expect(sql).toContain('INSERT INTO "orders"');
    expect(sql).toContain('("order_key", "buyer_key")');
    expect(sql).toContain('"product_name"');
    expect(sql).toContain('"w_kg"');
    expect(sql).not.toContain('"customer_id"');
    expect(sql).not.toContain('INSERT INTO "product_name"');
  });

  it('applies mapped column names to MySQL SQL', () => {
    const sql = serializeDatasetAsSql(dataset, mapping, {
      dialect: 'mysql',
    });

    expect(sql).toContain('INSERT INTO `orders` (`order_key`, `buyer_key`)');
  });

  it('does not mutate the source dataset', () => {
    const before = JSON.stringify(dataset);

    serializeDatasetAsJson(dataset, mapping);
    serializeRowsAsCsv(dataset.products, 'products', mapping);
    serializeDatasetAsSql(dataset, mapping);

    expect(JSON.stringify(dataset)).toBe(before);
  });
});
