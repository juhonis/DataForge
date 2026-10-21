import { describe, expect, it } from 'vitest'
import type {
  AttributeDefinition,
  Brand,
  CategoryTemplate,
  DimensionKey,
} from '../../types/product'
import { CATEGORY_TEMPLATES } from '../categories'
import {
  generateId,
  generateProduct,
  generateProducts,
  generateSKU,
  generateSlug,
} from './product'
import { SeededRng } from '../rng'

const DIMENSION_KEYS: DimensionKey[] = [
  'weight_kg',
  'length_cm',
  'width_cm',
  'height_cm',
]

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

const makeBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: 'test-brand',
  name: 'Test Brand',
  models: ['Test Model'],
  selectedModels: ['Test Model'],
  modelPrices: {},
  ...overrides,
})

const makeCategory = (
  overrides: Partial<CategoryTemplate> = {},
): CategoryTemplate => ({
  ...CATEGORY_TEMPLATES[0],
  ...overrides,
})

const templateTokens = (template: string): string[] =>
  [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1])

const generateWithSeed = (seed: number): string => {
  const category = CATEGORY_TEMPLATES[0]
  const brands = makeBrands(category)
  const products = generateProducts(
    category,
    brands,
    brands.map((brand) => brand.id),
    25,
    new SeededRng(seed),
  )

  return JSON.stringify(products)
}

describe('product identifiers', () => {
  it('builds an SKU from the prefix and first id segment', () => {
    expect(generateSKU('PH', 'abc-123')).toBe('PH-ABC')
  })

  it('builds a slug from the name and first id segment', () => {
    expect(generateSlug('Test Product', 'abc-123')).toBe('test-product-abc')
  })

  it('uses the provided index for sequential ids', () => {
    expect(generateId('sequential', undefined, 5)).toBe('5')
  })

  it('prefixes custom ids', () => {
    expect(generateId('custom', 'PROD-', 7)).toBe('PROD-7')
  })
})

describe('deterministic generation', () => {
  it('produces byte-identical output for the same seed and config', () => {
    expect(generateWithSeed(1234)).toBe(generateWithSeed(1234))
  })

  it('produces different output for a different seed', () => {
    expect(generateWithSeed(1234)).not.toBe(generateWithSeed(5678))
  })
})

describe('price precedence', () => {
  const category = makeCategory({ priceRange: { min: 100_000, max: 100_001 } })

  it('prefers an exact model price', () => {
    const brand = makeBrand({
      priceRange: { min: 500, max: 501 },
      modelPrices: { 'Test Model': 42 },
    })

    expect(generateProduct(category, brand, new SeededRng(1)).price).toBe(42)
  })

  it('falls back to the brand price range', () => {
    const brand = makeBrand({ priceRange: { min: 500, max: 501 } })
    const price = generateProduct(category, brand, new SeededRng(2)).price

    expect(price).toBeGreaterThanOrEqual(500)
    expect(price).toBeLessThanOrEqual(501)
  })

  it('falls back to the category price range', () => {
    const price = generateProduct(category, makeBrand(), new SeededRng(3)).price

    expect(price).toBeGreaterThanOrEqual(100_000)
    expect(price).toBeLessThanOrEqual(100_001)
  })
})

describe('generation constraints', () => {
  it('creates 10,000 products with unique ids, skus, and slugs', () => {
    const category = CATEGORY_TEMPLATES[0]
    const brands = makeBrands(category)
    const products = generateProducts(
      category,
      brands,
      brands.map((brand) => brand.id),
      10_000,
      new SeededRng(42),
    )

    expect(products).toHaveLength(10_000)
    expect(new Set(products.map((product) => product.id)).size).toBe(10_000)
    expect(new Set(products.map((product) => product.sku)).size).toBe(10_000)
    expect(new Set(products.map((product) => product.slug)).size).toBe(10_000)
  }, 20_000)

  it('can set dimensions to null according to the profile', () => {
    const category = makeCategory({
      dimensions: {
        ...CATEGORY_TEMPLATES[0].dimensions,
        length_cm: { min: 1, max: 2, nullableProbability: 1 },
      },
    })

    const product = generateProduct(category, makeBrand(), new SeededRng(4))

    expect(product.length_cm).toBeNull()
  })
})

describe('category presets', () => {
  it('generates valid products for every preset', () => {
    for (const category of CATEGORY_TEMPLATES) {
      const brands = makeBrands(category)
      const products = generateProducts(
        category,
        brands,
        brands.map((brand) => brand.id),
        25,
        new SeededRng(7),
      )

      expect(products, category.id).toHaveLength(25)

      for (const product of products) {
        expect(product.name.trim(), category.id).not.toBe('')
        expect(product.name, category.id).not.toMatch(/[{}]/)
        expect(product.description.trim(), category.id).not.toBe('')
        expect(product.slug.trim(), category.id).not.toBe('')
        expect(product.sku.startsWith(`${category.skuPrefix}-`), category.id).toBe(true)
        expect(product.images, category.id).toHaveLength(1)
        expect(category.unsplashIds, category.id).toContain(product.images[0])

        for (const key of DIMENSION_KEYS) {
          const range = category.dimensions[key]
          const value = product[key]

          if (value === null) {
            expect(range.nullableProbability, `${category.id}.${key}`).toBeDefined()
            continue
          }

          expect(value, `${category.id}.${key}`).toBeGreaterThanOrEqual(range.min)
          expect(value, `${category.id}.${key}`).toBeLessThanOrEqual(range.max)
        }
      }
    }
  })

  it('resolves template tokens from attributes, variants, and nameParts', () => {
    for (const category of CATEGORY_TEMPLATES) {
      const brands = makeBrands(category)
      const [product] = generateProducts(
        category,
        brands,
        brands.map((brand) => brand.id),
        1,
        new SeededRng(9),
      )

      expect(product, category.id).toBeDefined()

      for (const token of templateTokens(category.nameTemplate)) {
        if (token === 'brand') {
          expect(product.name, `${category.id}.${token}`).toContain(product.brand)
        } else if (token === 'variant') {
          expect(
            category.variants?.some((variant) => product.name.includes(variant)),
            `${category.id}.${token}`,
          ).toBe(true)
        } else if (category.nameParts?.[token]) {
          expect(
            category.nameParts[token].some((part) => product.name.includes(part)),
            `${category.id}.${token}`,
          ).toBe(true)
        } else if (token in product.attributes) {
          expect(product.name, `${category.id}.${token}`).toContain(
            String(product.attributes[token]),
          )
        }
      }
    }
  })
})

describe('attributes', () => {
  it('generates values for every attribute type', () => {
    const definitions: AttributeDefinition[] = [
      { key: 'select', type: 'select', options: ['a', 'b'] },
      { key: 'number', type: 'number', min: 5, max: 7 },
      { key: 'boolean', type: 'boolean' },
      { key: 'text', type: 'text' },
      { key: 'emptySelect', type: 'select' },
    ]
    const category = makeCategory({ attributes: definitions })
    const product = generateProduct(category, makeBrand(), new SeededRng(10))

    expect(['a', 'b']).toContain(product.attributes.select)
    expect(product.attributes.number).toBeGreaterThanOrEqual(5)
    expect(product.attributes.number).toBeLessThanOrEqual(7)
    expect(product.attributes.boolean).toBeTypeOf('boolean')
    expect(product.attributes.text).toBeTypeOf('string')
    expect(product.attributes.text.length).toBeGreaterThan(0)
    expect(product.attributes.emptySelect).toBeNull()
  })
})
