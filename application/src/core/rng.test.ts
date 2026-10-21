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

describe('SeededRng', () => {
    it('produces the same sequence for the same seed', () => {
        expect(sample(42)).toEqual(sample(42))
    })

    it('produces a different sequence for a different seed', () => {
        expect(sample(1)).not.toEqual(sample(2))
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