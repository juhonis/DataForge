import { describe, expect, it } from 'vitest'
import { SeededRng } from './rng'

const sample = (seed: number) => {
    const rng = new SeededRng(seed)

    return Array.from({ length: 20 }, () => ({
        int: rng.int(1, 100),
        float: rng.float(0, 1, 2),
        bool: rng.bool(),
        pick: rng.pick(['a', 'b', 'c'] as const),
        shuffle: rng.shuffle(['a', 'b', 'c']),
        uuid: rng.uuid(),
        word: rng.word(),
    }))
}

const datasetSample = (seed: number) => {
    const rng = new SeededRng(seed)
    const from = new Date('2025-01-01T00:00:00Z')
    const to = new Date('2025-12-31T23:59:59Z')

    return Array.from({ length: 5 }, () => ({
        fullName: rng.fullName(),
        email: rng.email(),
        phone: rng.phone(),
        city: rng.city(),
        country: rng.country(),
        sentence: rng.sentence(6),
        productDescription: rng.productDescription(),
        date: rng.dateBetween(from, to).toISOString(),
    }))
}

describe('SeededRng', () => {
    it('produces the same sequence for the same seed', () => {
        expect(sample(42)).toEqual(sample(42))
    })

    it('produces a different sequence for a different seed', () => {
        expect(sample(1)).not.toEqual(sample(2))
    })

    it('produces deterministic dataset fields for the same seed', () => {
        expect(datasetSample(42)).toEqual(datasetSample(42))
        expect(datasetSample(1)).not.toEqual(datasetSample(2))
    })

    it('keeps generated dates inside the requested bounds', () => {
        const rng = new SeededRng(7)
        const from = new Date('2024-01-01T00:00:00Z')
        const to = new Date('2024-12-31T23:59:59Z')

        for (let i = 0; i < 1000; i++) {
            const value = rng.dateBetween(from, to)

            expect(value.getTime()).toBeGreaterThanOrEqual(from.getTime())
            expect(value.getTime()).toBeLessThanOrEqual(to.getTime())
        }
    })

    it('generates non-empty dataset text fields', () => {
        const rng = new SeededRng(7)

        expect(rng.fullName().trim()).not.toBe('')
        expect(rng.email().trim()).not.toBe('')
        expect(rng.phone().trim()).not.toBe('')
        expect(rng.city().trim()).not.toBe('')
        expect(rng.country().trim()).not.toBe('')
        expect(rng.sentence(6).trim()).not.toBe('')
        expect(rng.productDescription().trim()).not.toBe('')
    })

    it('can be reseeded mid-stream', () => {
        const rng = new SeededRng(42)
        const first = Array.from({ length: 5 }, () => rng.int(0, 1_000_000))

        rng.seed(42)
        const second = Array.from({ length: 5 }, () => rng.int(0, 1_000_000))

        expect(second).toEqual(first)
    })

    it('keeps integers inside the requested bounds', () => {
        const rng = new SeededRng(7)

        for (let i = 0; i < 1000; i++) {
            const value = rng.int(1, 6)
            expect(value).toBeGreaterThanOrEqual(1)
            expect(value).toBeLessThanOrEqual(6)
            expect(Number.isInteger(value)).toBe(true)
        }
    })

    it('respects float bounds and fraction digits', () => {
        const rng = new SeededRng(7)

        for (let i = 0; i < 1000; i++) {
            const value = rng.float(0, 1, 2)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(1)
            expect(String(value).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2)
        }
    })

    it('honours the boolean probability extremes', () => {
        const rng = new SeededRng(7)

        for (let i = 0; i < 100; i++) {
            expect(rng.bool(0)).toBe(false)
            expect(rng.bool(1)).toBe(true)
        }
    })

    it('picks from the provided items and rejects empty input', () => {
        const rng = new SeededRng(7)
        const items = ['a', 'b', 'c'] as const

        for (let i = 0; i < 100; i++) {
            expect(items).toContain(rng.pick(items))
        }

        expect(() => rng.pick<string>([])).toThrow()
    })

    it('never returns zero-weight entries', () => {
        const rng = new SeededRng(7)

        for (let i = 0; i < 100; i++) {
            expect(rng.weighted([['never', 0], ['always', 1]] as const)).toBe('always')
        }

        expect(() => rng.weighted([['never', 0]] as const)).toThrow()
    })

    it('shuffles without mutating the input', () => {
        const rng = new SeededRng(7)
        const input = [1, 2, 3, 4, 5] as const
        const output = rng.shuffle(input)

        expect(output).toHaveLength(input.length)
        expect([...output].sort((a, b) => a - b)).toEqual([...input])
        expect(input).toEqual([1, 2, 3, 4, 5])
    })

    it('generates deterministic unique uuids', () => {
        const first = new SeededRng(7)
        const second = new SeededRng(7)

        const firstIds = Array.from({ length: 1000 }, () => first.uuid())
        const secondIds = Array.from({ length: 1000 }, () => second.uuid())

        expect(firstIds).toEqual(secondIds)
        expect(new Set(firstIds).size).toBe(firstIds.length)
    })
})