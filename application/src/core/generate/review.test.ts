import { describe, expect, it } from 'vitest'
import { generateReviews } from './review'
import { SeededRng } from '../rng'
import { generateCustomers } from './customer'
import { generateProducts } from './product'
import type { Brand, CategoryTemplate } from '../../types/product'
import { CATEGORY_TEMPLATES } from '../categories'

const NOW = new Date('2026-10-21T12:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

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

const createInputs = (seed: number) => {
  const category = CATEGORY_TEMPLATES[0]
  const brands = makeBrands(category)
  const products = generateProducts(
    category,
    brands,
    brands.map((brand) => brand.id),
    10,
    new SeededRng(seed),
  )
  const customers = generateCustomers(10, new SeededRng(seed + 1), NOW)

  return { products, customers }
}

describe('generateReviews', () => {
  it('creates the requested number of reviews', () => {
    const { products, customers } = createInputs(1)
    const reviews = generateReviews(
      25,
      products,
      customers,
      new SeededRng(2),
      NOW,
    )

    expect(reviews).toHaveLength(25)
  })

  it('references only generated products and customers', () => {
    const { products, customers } = createInputs(2)
    const reviews = generateReviews(
      50,
      products,
      customers,
      new SeededRng(3),
      NOW,
    )
    const productIds = new Set(products.map((product) => product.id))
    const customerIds = new Set(customers.map((customer) => customer.id))

    for (const review of reviews) {
      expect(productIds.has(review.product_id)).toBe(true)
      expect(customerIds.has(review.customer_id)).toBe(true)
    }
  })

  it('fills review fields with valid values', () => {
    const { products, customers } = createInputs(4)
    const earliest = NOW.getTime() - 365 * DAY_MS

    for (const review of generateReviews(
      50,
      products,
      customers,
      new SeededRng(5),
      NOW,
    )) {
      expect(review.id.trim()).not.toBe('')
      expect(review.title.trim()).not.toBe('')
      expect(review.body.trim()).not.toBe('')
      expect(Number.isInteger(review.rating)).toBe(true)
      expect(review.rating).toBeGreaterThanOrEqual(1)
      expect(review.rating).toBeLessThanOrEqual(5)

      const createdAt = Date.parse(review.created_at)
      expect(createdAt).toBeGreaterThanOrEqual(earliest)
      expect(createdAt).toBeLessThanOrEqual(NOW.getTime())
    }
  })

  it('generates unique ids', () => {
    const { products, customers } = createInputs(6)
    const reviews = generateReviews(
      1000,
      products,
      customers,
      new SeededRng(7),
      NOW,
    )

    expect(new Set(reviews.map((review) => review.id)).size).toBe(
      reviews.length,
    )
  })

  it('is deterministic for the same seed and now', () => {
    const { products, customers } = createInputs(8)

    expect(
      generateReviews(20, products, customers, new SeededRng(9), NOW),
    ).toEqual(
      generateReviews(20, products, customers, new SeededRng(9), NOW),
    )
  })

  it('returns no reviews without products or customers', () => {
    const { products, customers } = createInputs(10)

    expect(generateReviews(10, [], customers, new SeededRng(1), NOW)).toEqual([])
    expect(generateReviews(10, products, [], new SeededRng(1), NOW)).toEqual([])
  })

  it('normalizes the review count', () => {
    const { products, customers } = createInputs(11)

    expect(
      generateReviews(-5, products, customers, new SeededRng(1), NOW),
    ).toEqual([])
    expect(
      generateReviews(2.9, products, customers, new SeededRng(1), NOW),
    ).toHaveLength(2)
  })
})
