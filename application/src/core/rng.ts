import { Faker, en } from '@faker-js/faker';

export interface Rng {
    seed(n: number): void;
    int(min: number, max: number): number;
    float(min: number, max: number, fractionDigits?: number): number;
    bool(probability?: number): boolean;
    pick<T>(items: readonly T[]): T;
    weighted<T>(entries: readonly (readonly [T, number])[]): T;
    shuffle<T>(items: readonly T[]): T[];
    uuid(): string;
    word(): string;
}

export class SeededRng implements Rng {
    private readonly faker: Faker;

    constructor(seed?: number) {
        this.faker = new Faker({ 
            locale: [en],
            ... (seed === undefined ? {} : { seed }),
        });
    }

    seed(n: number): void {
        this.faker.seed(n);
    }

    int(min: number, max: number): number {
        return this.faker.number.int({ min, max });
    }

    float(min: number, max: number, fractionDigits?: number): number {
        return this.faker.number.float({ min, max, fractionDigits });
    } 

    bool(probability = 0.5): boolean {
        return this.faker.datatype.boolean({ probability });
    }

    pick<T>(items: readonly T[]): T {
        if (items.length === 0) {
            throw new Error('Cannot pick from an empty array');
        }
        return this.faker.helpers.arrayElement(items);
    }

    weighted<T>(entries: readonly (readonly [T, number])[]): T {
        const positive = entries.filter(([, weight]) => weight > 0);

        if (positive.length === 0) {
            throw new Error('Weighted pick requires at least one positive weight');
        }

        return this.faker.helpers.weightedArrayElement(
            positive.map(([value, weight]) => ({ value, weight })),
        );
    }

    shuffle<T>(items: readonly T[]): T[] {
        return this.faker.helpers.shuffle(items);
    }

    uuid(): string {
        return this.faker.string.uuid();
    }

    word(): string {
        return this.faker.lorem.word();
    }
}