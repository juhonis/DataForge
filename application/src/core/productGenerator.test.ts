import { describe, expect, it } from 'vitest'
import { generateId, generateSKU, generateSlug } from './productGenerator'

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
