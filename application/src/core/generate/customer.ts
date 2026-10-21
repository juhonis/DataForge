import type { Customer } from '../../types/dataset';
import type { Rng } from '../rng';

const DAY_MS = 24 * 60 * 60 * 1000;
const EARLIEST_DAYS_AGO = 365 * 2;
const LATEST_DAYS_AGO = 30;

export const generateCustomer = (rng: Rng, now: Date): Customer => {
  const earliest = new Date(now.getTime() - EARLIEST_DAYS_AGO * DAY_MS);
  const latest = new Date(now.getTime() - LATEST_DAYS_AGO * DAY_MS);
  const createdAt = rng.dateBetween(earliest, latest);

  return {
    id: rng.uuid(),
    name: rng.fullName(),
    email: rng.email(),
    phone: rng.phone(),
    city: rng.city(),
    country: rng.country(),
    created_at: createdAt.toISOString(),
  };
};

export const generateCustomers = (
  count: number,
  rng: Rng,
  now: Date = new Date(),
): Customer[] => {
  const normalizedCount = Math.max(0, Math.floor(count));

  return Array.from({ length: normalizedCount }, () =>
    generateCustomer(rng, now),
  );
};
