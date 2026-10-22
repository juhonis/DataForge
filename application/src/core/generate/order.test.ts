import { describe, expect, it } from 'vitest'
import type { Brand, CategoryTemplate } from '../../types/product'
import { CATEGORY_TEMPLATES } from '../categories'
import { roundMoney } from '../money'
import { SeededRng } from '../rng'
import { generateCustomers } from './customer'
import { generateOrders } from './order'
import { generateProducts } from './product'

const NOW = new Date('2026-10-21T12:00:00.000Z')
const ORDER_STATUSES = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
] as const

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

const createProducts = (seed: number, count = 12) => {
  const category = CATEGORY_TEMPLATES[0]
  const brands = makeBrands(category)

  return generateProducts(
    category,
    brands,
    brands.map((brand) => brand.id),
    count,
    new SeededRng(seed),
  )
}

const createOrders = (seed: number, ordersPerCustomer = { min: 1, max: 3 }) => {
  const customers = generateCustomers(10, new SeededRng(seed + 1), NOW)
  const products = createProducts(seed + 2)
  const result = generateOrders(
    customers,
    products,
    ordersPerCustomer,
    new SeededRng(seed),
    NOW,
  )

  return { customers, products, ...result }
}

const isWholeCents = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-9

describe('generateOrders', () => {
  it('creates orders for every customer within the configured range', () => {
    const { customers, orders } = createOrders(5, { min: 2, max: 3 })

    expect(customers).toHaveLength(10)
    expect(orders.length).toBeGreaterThanOrEqual(20)
    expect(orders.length).toBeLessThanOrEqual(30)

    for (const customer of customers) {
      const customerOrders = orders.filter(
        (order) => order.customer_id === customer.id,
      )

      expect(customerOrders.length).toBeGreaterThanOrEqual(2)
      expect(customerOrders.length).toBeLessThanOrEqual(3)
    }
  })

  it('references only generated customers and products', () => {
    const { customers, products, orders, orderLines } = createOrders(7)
    const customerIds = new Set(customers.map((customer) => customer.id))
    const productIds = new Set(products.map((product) => product.id))

    for (const order of orders) {
      expect(customerIds.has(order.customer_id)).toBe(true)
    }

    for (const line of orderLines) {
      expect(productIds.has(line.product_id)).toBe(true)
    }
  })

  it('keeps line and order totals consistent', () => {
    const { products, orders, orderLines } = createOrders(8)
    const productsById = new Map(products.map((product) => [product.id, product]))

    for (const line of orderLines) {
      expect(line.line_total).toBe(
        roundMoney(line.quantity * line.unit_price),
      )
      expect(line.unit_price).toBe(productsById.get(line.product_id)?.price)
      expect(line.quantity).toBeGreaterThanOrEqual(1)
      expect(line.quantity).toBeLessThanOrEqual(3)
    }

    for (const order of orders) {
      const lines = orderLines.filter((line) => line.order_id === order.id)

      expect(lines.length).toBeGreaterThanOrEqual(1)
      expect(lines.length).toBeLessThanOrEqual(4)
      expect(new Set(lines.map((line) => line.product_id)).size).toBe(lines.length)
      expect(order.total).toBe(
        roundMoney(lines.reduce((sum, line) => sum + line.line_total, 0)),
      )
      expect(order.currency).toBe('USD')
      expect(ORDER_STATUSES).toContain(order.status)
    }
  })

  it('rounds decimal-priced lines and totals to cents', () => {
    const category = CATEGORY_TEMPLATES.find(
      (candidate) => candidate.id === 'audio',
    )

    if (!category) throw new Error('Audio category is missing')

    const brands = makeBrands(category)
    const products = generateProducts(
      category,
      brands,
      brands.map((brand) => brand.id),
      12,
      new SeededRng(13),
    )
    const customers = generateCustomers(20, new SeededRng(14), NOW)
    const { orders, orderLines } = generateOrders(
      customers,
      products,
      { min: 1, max: 3 },
      new SeededRng(15),
      NOW,
    )

    expect(
      orderLines.some((line) => !Number.isInteger(line.unit_price)),
    ).toBe(true)

    for (const line of orderLines) {
      expect(isWholeCents(line.line_total)).toBe(true)
      expect(line.line_total).toBe(
        roundMoney(line.quantity * line.unit_price),
      )
    }

    for (const order of orders) {
      const lines = orderLines.filter((line) => line.order_id === order.id)

      expect(isWholeCents(order.total)).toBe(true)
      expect(order.total).toBe(
        roundMoney(lines.reduce((sum, line) => sum + line.line_total, 0)),
      )
    }
  })

  it('places orders after the customer was created and not in the future', () => {
    const { customers, orders } = createOrders(9)
    const customersById = new Map(
      customers.map((customer) => [customer.id, customer]),
    )

    for (const order of orders) {
      const customer = customersById.get(order.customer_id)
      const placedAt = Date.parse(order.placed_at)

      expect(customer).toBeDefined()
      if (!customer) throw new Error('Order references a missing customer')

      expect(placedAt).toBeGreaterThanOrEqual(Date.parse(customer.created_at))
      expect(placedAt).toBeLessThanOrEqual(NOW.getTime())
    }
  })

  it('generates unique order and order line ids', () => {
    const { orders, orderLines } = createOrders(10)

    expect(new Set(orders.map((order) => order.id)).size).toBe(orders.length)
    expect(new Set(orderLines.map((line) => line.id)).size).toBe(
      orderLines.length,
    )
  })

  it('is deterministic for the same seed and now', () => {
    expect(createOrders(11)).toEqual(createOrders(11))
  })

  it('returns no orders without products', () => {
    const customers = generateCustomers(5, new SeededRng(1), NOW)
    const result = generateOrders(
      customers,
      [],
      { min: 1, max: 3 },
      new SeededRng(2),
      NOW,
    )

    expect(result).toEqual({ orders: [], orderLines: [] })
  })

  it('supports a zero-order range', () => {
    const { orders, orderLines } = createOrders(12, { min: 0, max: 0 })

    expect(orders).toEqual([])
    expect(orderLines).toEqual([])
  })
})
