// A stable UTC anchor keeps seeded generation independent of the system clock.
export const DEFAULT_REFERENCE_TIME = '2026-01-01T00:00:00.000Z';

export const isReferenceTime = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
};
