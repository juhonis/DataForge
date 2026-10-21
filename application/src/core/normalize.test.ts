import { describe, expect, it } from 'vitest'
import {
  isValidPriceRange,
  normalizeAttributeKey,
  normalizeSkuPrefix,
  slugify,
} from './normalize'

describe('slugify', () => {
    it('lowercases and joins words with hyphens', () => {
        expect(slugify('Test Product')).toBe('test-product')
    })

    it('strips punctuation and accents', () => {
        expect(slugify('  Café & Co!  ')).toBe('cafe-co')
    })

    it('collapses separators and trims dashes', () => {
        expect(slugify('--Hello   World--')).toBe('hello-world')
    })

    it('returns an empty string for blank input', () => {
        expect(slugify('   ')).toBe('')
    })
})

describe('normalizeAttributeKey', () => {
    it('trims, lowercases and replaces whitespace', () => {
        expect(normalizeAttributeKey('  Screen Size  ')).toBe('screen_size')
    })

    it('collapses runs of whitespace', () => {
        expect(normalizeAttributeKey('battery   life')).toBe('battery_life')
    })
})

describe('normalizeSkuPrefix', () => {
    it('trims and uppercases', () => {
        expect(normalizeSkuPrefix(' phn ')).toBe('PHN')
    })
})

describe('isValidPriceRange', () => {
    it('accepts a positive range', () => {
        expect(isValidPriceRange(10, 20)).toBe(true)
    })

    it('accepts a zero minimum', () => {
        expect(isValidPriceRange(0, 20)).toBe(true)
    })

    it('rejects an inverted or empty range', () => {
        expect(isValidPriceRange(20, 20)).toBe(false)
        expect(isValidPriceRange(20, 10)).toBe(false)
    })

    it('rejects negative or non-finite values', () => {
        expect(isValidPriceRange(-1, 10)).toBe(false)
        expect(isValidPriceRange(0, Number.POSITIVE_INFINITY)).toBe(false)
        expect(isValidPriceRange(Number.NaN, 10)).toBe(false)
    })
})