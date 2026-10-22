export interface NumberInputNormalizationOptions {
  value: number;
  min?: number;
  max?: number;
  integer?: boolean;
}

export const normalizeNumberInput = (
  rawValue: string,
  { value, min, max, integer = false }: NumberInputNormalizationOptions,
): number => {
  const parsed = Number.parseFloat(rawValue);

  if (!Number.isFinite(parsed)) return value;

  let next = integer ? Math.trunc(parsed) : parsed;

  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);

  return next;
};
