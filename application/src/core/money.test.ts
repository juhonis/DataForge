import { describe, expect, it } from 'vitest';
import { roundMoney } from './money';

describe('roundMoney', () => {
  it('rounds to two decimal places', () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(1.004)).toBe(1);
    expect(roundMoney(19.99 * 3)).toBe(59.97);
  });

  it('normalizes floating-point artifacts', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('leaves non-finite values unchanged', () => {
    expect(roundMoney(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(Number.isNaN(roundMoney(Number.NaN))).toBe(true);
  });
});
