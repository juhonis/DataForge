import { describe, expect, it } from 'vitest'
import { toJson } from './json'

describe('toJson', () => {
  it('round-trips values with pretty formatting', () => {
    const value = {
      products: [{ id: 'p1', name: 'Phone' }],
      customers: [],
    }
    const output = toJson(value)

    expect(JSON.parse(output)).toEqual(value)
    expect(output).toContain('\n')
    expect(output).toContain('  "products"')
  })
})
