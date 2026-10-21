import { describe, expect, it } from 'vitest'
import type { Dataset } from '../../types/dataset'
import { datasetToSql, toSqlInsert } from './sql'

describe('toSqlInsert', () => {
  it('writes postgres identifiers and escaped string values', () => {
    const sql = toSqlInsert(
      'products',
      [
        {
          id: 'p1',
          name: "O'Brien",
          price: 42,
          active: true,
          note: null,
        },
      ],
      { dialect: 'postgres' },
    )

    expect(sql).toBe(
      `INSERT INTO "products" ("id", "name", "price", "active", "note") VALUES ('p1', 'O''Brien', 42, TRUE, NULL);`,
    )
  })

  it('uses mysql identifier quoting', () => {
    const sql = toSqlInsert(
      'order_lines',
      [{ id: 'l1', order_id: 'o1' }],
      { dialect: 'mysql' },
    )

    expect(sql).toBe(
      "INSERT INTO `order_lines` (`id`, `order_id`) VALUES ('l1', 'o1');",
    )
  })

  it('uses the union of columns and fills missing values with NULL', () => {
    const sql = toSqlInsert('customers', [{ a: 1 }, { b: 2 }])

    expect(sql).toContain('("a", "b")')
    expect(sql).toContain('VALUES (1, NULL);')
    expect(sql).toContain('VALUES (NULL, 2);')
  })

  it('serializes nested values as JSON strings', () => {
    const sql = toSqlInsert('products', [
      { id: 'p1', attributes: { color: 'red', wireless: true } },
    ])

    expect(sql).toContain(`'{"color":"red","wireless":true}'`)
  })

  it('returns an empty string for rows without columns', () => {
    expect(toSqlInsert('products', [])).toBe('')
    expect(toSqlInsert('products', [{}])).toBe('')
  })
})

describe('datasetToSql', () => {
  const dataset = {
    products: [{ id: 'p1', attributes: { color: 'red' } }],
    customers: [{ id: 'c1' }],
    orders: [{ id: 'o1', customer_id: 'c1' }],
    order_lines: [{ id: 'l1', order_id: 'o1', product_id: 'p1' }],
    reviews: [{ id: 'r1', product_id: 'p1', customer_id: 'c1' }],
  } as unknown as Dataset

  it('emits the seed and config header', () => {
    const sql = datasetToSql(dataset, {
      seed: 42,
      configSummary: '1 product, 1 customer, 1 order, 1 line, 1 review',
    })

    expect(sql).toContain(
      '-- DataForge\n-- Seed: 42\n-- Config: 1 product, 1 customer, 1 order, 1 line, 1 review',
    )
  })

  it('derives a config summary when none is supplied', () => {
    const sql = datasetToSql(dataset, { seed: 7 })

    expect(sql).toContain(
      '-- Config: 1 products, 1 customers, 1 orders, 1 order lines, 1 reviews',
    )
  })

  it('writes tables in foreign-key order', () => {
    const sql = datasetToSql(dataset)
    const tables = [
      'products',
      'customers',
      'orders',
      'order_lines',
      'reviews',
    ]
    const positions = tables.map((table) =>
      sql.indexOf(`INSERT INTO "${table}"`),
    )

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('applies the dialect to every table', () => {
    const sql = datasetToSql(dataset, { dialect: 'mysql' })

    expect(sql).toContain('INSERT INTO `products` (`id`, `attributes`)')
    expect(sql).not.toContain('INSERT INTO "products"')
  })

  it('still writes a header for an empty dataset', () => {
    const empty = {
      products: [],
      customers: [],
      orders: [],
      order_lines: [],
      reviews: [],
    } as Dataset
    const sql = datasetToSql(empty)

    expect(sql).toContain('-- DataForge')
    expect(sql).toContain('-- Seed: n/a')
    expect(sql).not.toContain('INSERT INTO')
  })
})
