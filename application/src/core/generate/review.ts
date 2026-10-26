import type { Customer, Review } from '../../types/dataset';
import type { Product } from '../../types/product';
import type { Rng } from '../rng';
import { DEFAULT_REFERENCE_TIME } from '../generationTime';

const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_WINDOW_DAYS = 365;

const RATING_WEIGHTS: ReadonlyArray<readonly [number, number]> = [
  [5, 0.55],
  [4, 0.25],
  [3, 0.12],
  [2, 0.05],
  [1, 0.03],
];

export const generateReviews = (
  count: number,
  products: readonly Product[],
  customers: readonly Customer[],
  rng: Rng,
  now: Date = new Date(DEFAULT_REFERENCE_TIME),
): Review[] => {
  const normalizedCount = Math.max(0, Math.floor(count));

  if (normalizedCount === 0 || products.length === 0 || customers.length === 0) {
    return [];
  }

  const earliest = new Date(now.getTime() - REVIEW_WINDOW_DAYS * DAY_MS);

  return Array.from({ length: normalizedCount }, () => ({
    id: rng.uuid(),
    product_id: rng.pick(products).id,
    customer_id: rng.pick(customers).id,
    rating: rng.weighted(RATING_WEIGHTS),
    title: rng.sentence(3).replace(/\.$/, ''),
    body: rng.sentence(12),
    created_at: rng.dateBetween(earliest, now).toISOString(),
  }));
};
