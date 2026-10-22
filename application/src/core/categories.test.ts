import { describe, expect, it } from 'vitest'
import { CATEGORY_TEMPLATES } from './categories'
import type { DimensionKey } from '../types/product'

const DIMENSION_KEYS: DimensionKey[] = [
  'weight_kg',
  'length_cm',
  'width_cm',
  'height_cm',
]

const templateTokens = (template: string): string[] =>
  [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1])

describe('category templates', () => {
  it('declare naming metadata that resolves', () => {
    for (const category of CATEGORY_TEMPLATES) {
      expect(category.nameTemplate.trim(), category.id).not.toBe('')

      const available = new Set([
        'brand',
        'model',
        'variant',
        ...category.attributes.map((attribute) => attribute.key),
        ...Object.keys(category.nameParts ?? {}),
      ])

      for (const token of templateTokens(category.nameTemplate)) {
        expect(
          available.has(token),
          `${category.id} uses unknown {${token}}`,
        ).toBe(true)
      }

      if (category.usesVariantInName) {
        expect(templateTokens(category.nameTemplate), category.id).toContain('variant')
        expect(category.variants?.length ?? 0, category.id).toBeGreaterThan(0)
      } else {
        expect(templateTokens(category.nameTemplate), category.id).not.toContain('variant')
      }
    }
  })

  it('declare complete, valid dimension ranges', () => {
    for (const category of CATEGORY_TEMPLATES) {
      for (const key of DIMENSION_KEYS) {
        const range = category.dimensions[key]

        expect(range, `${category.id}.${key}`).toBeDefined()
        expect(range.max, `${category.id}.${key}`).toBeGreaterThanOrEqual(range.min)

        if (range.fractionDigits !== undefined) {
          expect(Number.isInteger(range.fractionDigits), `${category.id}.${key}`).toBe(true)
          expect(range.fractionDigits, `${category.id}.${key}`).toBeGreaterThanOrEqual(0)
        }

        if (range.nullableProbability !== undefined) {
          expect(range.nullableProbability, `${category.id}.${key}`).toBeGreaterThan(0)
          expect(range.nullableProbability, `${category.id}.${key}`).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('declares positive default brand weights', () => {
    for (const category of CATEGORY_TEMPLATES) {
      for (const brand of category.defaultBrands) {
        const weight = category.brandWeights?.[brand] ?? 1

        expect(weight, `${category.id}.${brand}`).toBeGreaterThan(0)
        expect(Number.isFinite(weight), `${category.id}.${brand}`).toBe(true)
      }
    }
  })

  it('opts only the retail-style categories into decimal prices', () => {
    const decimalCategories = new Set([
      'audio',
      'accessories',
      'books',
      'clothing',
    ])

    for (const category of CATEGORY_TEMPLATES) {
      const expected = decimalCategories.has(category.id) ? 2 : 0

      expect(
        category.priceRange.decimalPlaces ?? 0,
        category.id,
      ).toBe(expected)
    }
  })

  it('declares the expected image count and stock ranges', () => {
    const expected: Record<
      string,
      {
        images: { min: number; max: number }
        stock: { min: number; max: number }
      }
    > = {
      smartphones: {
        images: { min: 1, max: 3 },
        stock: { min: 5, max: 250 },
      },
      laptops: {
        images: { min: 1, max: 4 },
        stock: { min: 2, max: 80 },
      },
      audio: {
        images: { min: 1, max: 4 },
        stock: { min: 10, max: 300 },
      },
      accessories: {
        images: { min: 1, max: 3 },
        stock: { min: 20, max: 500 },
      },
      books: {
        images: { min: 1, max: 2 },
        stock: { min: 10, max: 400 },
      },
      clothing: {
        images: { min: 1, max: 2 },
        stock: { min: 5, max: 350 },
      },
    }

    for (const category of CATEGORY_TEMPLATES) {
      const ranges = expected[category.id]

      if (!ranges) throw new Error(`Missing expected ranges for ${category.id}`)

      expect(category.imageCountRange, category.id).toEqual(ranges.images)
      expect(category.stockRange, category.id).toEqual(ranges.stock)
      expect(category.imageCountRange?.max, category.id).toBeLessThanOrEqual(
        category.unsplashIds.length,
      )
    }
  })

  it('keeps variant lists only where variants are used in names', () => {
    for (const category of CATEGORY_TEMPLATES) {
      if (category.usesVariantInName) {
        expect(category.variants, category.id).toBeDefined()
      } else {
        expect(category.variants, category.id).toBeUndefined()
      }
    }
  })

  it('declares the accessories device types as name parts', () => {
    const withDeviceTypes = CATEGORY_TEMPLATES.filter(
      (category) => category.nameParts?.deviceType !== undefined,
    )

    expect(withDeviceTypes).toHaveLength(1)
    expect(withDeviceTypes[0].nameParts?.deviceType).toEqual(['Cable', 'Hub', 'Adapter'])
  })
})
