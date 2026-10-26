import { describe, expect, it, vi } from 'vitest'
import type { Brand, CategoryTemplate } from '../../types/product'
import { CATEGORY_TEMPLATES } from '../categories'
import { roundMoney } from '../money'
import { DEFAULT_REFERENCE_TIME } from '../generationTime'
import { SeededRng } from '../rng'
import { generateDataset, type DatasetConfig } from './index'

const NOW = new Date('2026-10-21T12:00:00.000Z')

const makeBrands = (category: CategoryTemplate): Brand[] =>
  category.defaultBrands.slice(0, 2).map((name, index) => {
    const models = category.brandModels[name] ?? category.models

    return {
      id: `brand-${index}`,
      name,
      models,
      selectedModels: models,
      modelPrices: {},
    }
  })

const createDataset = (
  seed: number,
  overrides: Partial<DatasetConfig> = {},
  now?: Date,
) => {
  const category = CATEGORY_TEMPLATES[0]
  const brands = makeBrands(category)
  const config: DatasetConfig = {
    productCount: 25,
    customerCount: 10,
    ordersPerCustomer: { min: 1, max: 3 },
    reviewCount: 20,
    ...overrides,
  }

  return generateDataset(
    category,
    brands,
    brands.map((brand) => brand.id),
    config,
    new SeededRng(seed),
    now,
  )
}

describe('generateDataset', () => {
  it('assembles every dataset with the requested sizes', () => {
    const dataset = createDataset(42)

    expect(dataset.products).toHaveLength(25)
    expect(dataset.customers).toHaveLength(10)
    expect(dataset.orders.length).toBeGreaterThanOrEqual(10)
    expect(dataset.orders.length).toBeLessThanOrEqual(30)
    expect(dataset.order_lines.length).toBeGreaterThanOrEqual(
      dataset.orders.length,
    )
    expect(dataset.reviews).toHaveLength(20)
  })

  it('maintains referential integrity across every table', () => {
    const dataset = createDataset(43)
    const productIds = new Set(dataset.products.map((product) => product.id))
    const customerIds = new Set(
      dataset.customers.map((customer) => customer.id),
    )
    const orderIds = new Set(dataset.orders.map((order) => order.id))

    for (const order of dataset.orders) {
      expect(customerIds.has(order.customer_id)).toBe(true)
    }

    for (const line of dataset.order_lines) {
      expect(orderIds.has(line.order_id)).toBe(true)
      expect(productIds.has(line.product_id)).toBe(true)
    }

    for (const review of dataset.reviews) {
      expect(productIds.has(review.product_id)).toBe(true)
      expect(customerIds.has(review.customer_id)).toBe(true)
    }
  })

  it('keeps line totals and order totals consistent', () => {
    const dataset = createDataset(44)

    for (const order of dataset.orders) {
      const lines = dataset.order_lines.filter(
        (line) => line.order_id === order.id,
      )

      expect(order.total).toBe(
        roundMoney(lines.reduce((sum, line) => sum + line.line_total, 0)),
      )
    }
  })

  it('keeps decimal category prices and totals at cent precision', () => {
    const category = CATEGORY_TEMPLATES.find(
      (candidate) => candidate.id === 'audio',
    )

    if (!category) throw new Error('Audio category is missing')

    const brands = makeBrands(category)
    const dataset = generateDataset(
      category,
      brands,
      brands.map((brand) => brand.id),
      {
        productCount: 25,
        customerCount: 10,
        ordersPerCustomer: { min: 1, max: 3 },
        reviewCount: 20,
      },
      new SeededRng(49),
      NOW,
    )

    expect(
      dataset.products.some((product) => !Number.isInteger(product.price)),
    ).toBe(true)

    for (const line of dataset.order_lines) {
      expect(line.line_total).toBe(
        roundMoney(line.quantity * line.unit_price),
      )
    }

    for (const order of dataset.orders) {
      const lines = dataset.order_lines.filter(
        (line) => line.order_id === order.id,
      )
      const total = roundMoney(
        lines.reduce((sum, line) => sum + line.line_total, 0),
      )

      expect(order.total).toBe(total)
    }
  })

  it('is deterministic for the same seed and config', () => {
    expect(createDataset(45)).toEqual(createDataset(45))
  })

  it.each([undefined, '2025-06-15T13:45:12.123Z'])(
    'ignores the system clock with reference time %s',
    (referenceTime) => {
      vi.useFakeTimers()
      try {
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
        const first = createDataset(45, { referenceTime })
        vi.setSystemTime(new Date('2030-07-01T00:00:00Z'))
        expect(JSON.stringify(createDataset(45, { referenceTime }))).toBe(
          JSON.stringify(first),
        )
      } finally {
        vi.useRealTimers()
      }
    },
  )

  it('shifts timestamps by the reference time change while preserving other values', () => {
    const first = createDataset(45, { referenceTime: DEFAULT_REFERENCE_TIME })
    const delta = 24 * 60 * 60 * 1000
    const shifted = new Date(new Date(DEFAULT_REFERENCE_TIME).getTime() + delta)
    const second = createDataset(45, { referenceTime: shifted.toISOString() })

    expect(second).toEqual({
      ...first,
      customers: first.customers.map((row) => ({
        ...row,
        created_at: new Date(new Date(row.created_at).getTime() + delta).toISOString(),
      })),
      orders: first.orders.map((row) => ({
        ...row,
        placed_at: new Date(new Date(row.placed_at).getTime() + delta).toISOString(),
      })),
      reviews: first.reviews.map((row) => ({
        ...row,
        created_at: new Date(new Date(row.created_at).getTime() + delta).toISOString(),
      })),
    })
  })

  it('still accepts an explicit time override', () => {
    expect(createDataset(45, {}, NOW)).toEqual(
      createDataset(45, { referenceTime: NOW.toISOString() }),
    )
  })

  it('changes when the seed changes', () => {
    expect(createDataset(45)).not.toEqual(createDataset(46))
  })

  it('supports empty related datasets', () => {
    const dataset = createDataset(47, {
      customerCount: 0,
      reviewCount: 0,
    })

    expect(dataset.products).toHaveLength(25)
    expect(dataset.customers).toEqual([])
    expect(dataset.orders).toEqual([])
    expect(dataset.order_lines).toEqual([])
    expect(dataset.reviews).toEqual([])
  })

  it('skips orders and reviews when there are no products', () => {
    const dataset = createDataset(48, {
      productCount: 0,
      customerCount: 5,
      reviewCount: 10,
    })

    expect(dataset.products).toEqual([])
    expect(dataset.customers).toHaveLength(5)
    expect(dataset.orders).toEqual([])
    expect(dataset.order_lines).toEqual([])
    expect(dataset.reviews).toEqual([])
  })
})
