import { describe, expect, it } from 'vitest'
import { generateCustomers } from './customer'
import { SeededRng } from '../rng'

const NOW = new Date('2026-10-21T12:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

describe('generateCustomers', () => {
  it('creates the requested number of customers', () => {
    const customers = generateCustomers(50, new SeededRng(42), NOW)

    expect(customers).toHaveLength(50)
  })

  it('fills every customer field', () => {
    for (const customer of generateCustomers(50, new SeededRng(42), NOW)) {
      expect(customer.id.trim()).not.toBe('')
      expect(customer.name.trim()).not.toBe('')
      expect(customer.email.trim()).not.toBe('')
      expect(customer.phone.trim()).not.toBe('')
      expect(customer.city.trim()).not.toBe('')
      expect(customer.country.trim()).not.toBe('')
      expect(Number.isNaN(Date.parse(customer.created_at))).toBe(false)
    }
  })

  it('creates customers between two years and thirty days before now', () => {
    const earliest = NOW.getTime() - 2 * 365 * DAY_MS
    const latest = NOW.getTime() - 30 * DAY_MS

    for (const customer of generateCustomers(100, new SeededRng(7), NOW)) {
      const createdAt = Date.parse(customer.created_at)

      expect(createdAt).toBeGreaterThanOrEqual(earliest)
      expect(createdAt).toBeLessThanOrEqual(latest)
    }
  })

  it('generates unique ids', () => {
    const customers = generateCustomers(1000, new SeededRng(9), NOW)
    const ids = new Set(customers.map((customer) => customer.id))

    expect(ids.size).toBe(customers.length)
  })

  it('is deterministic for the same seed and now', () => {
    expect(generateCustomers(20, new SeededRng(11), NOW)).toEqual(
      generateCustomers(20, new SeededRng(11), NOW),
    )
  })

  it('changes when the seed changes', () => {
    expect(generateCustomers(20, new SeededRng(11), NOW)).not.toEqual(
      generateCustomers(20, new SeededRng(12), NOW),
    )
  })

  it('normalizes invalid counts', () => {
    expect(generateCustomers(-5, new SeededRng(1), NOW)).toEqual([])
    expect(generateCustomers(2.9, new SeededRng(1), NOW)).toHaveLength(2)
  })
})
