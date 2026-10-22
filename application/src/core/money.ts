const CENTS_PER_UNIT = 100;

export const roundMoney = (value: number): number => {
  if (!Number.isFinite(value)) return value;

  return Math.round((value + Number.EPSILON) * CENTS_PER_UNIT) / CENTS_PER_UNIT;
};
