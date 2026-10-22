import { describe, expect, it } from 'vitest';
import { normalizeNumberInput } from './normalizeNumberInput';

describe('normalizeNumberInput', () => {
  it('preserves decimal drafts instead of truncating them', () => {
    expect(normalizeNumberInput('0.5', { value: 1 })).toBe(0.5);
    expect(normalizeNumberInput('12.75', { value: 0 })).toBe(12.75);
  });

  it('treats zero as a valid value', () => {
    expect(normalizeNumberInput('0', { value: 10 })).toBe(0);
  });

  it('falls back to the current value for invalid or empty drafts', () => {
    expect(normalizeNumberInput('', { value: 7 })).toBe(7);
    expect(normalizeNumberInput('not a number', { value: 7 })).toBe(7);
  });

  it('truncates and clamps integer values', () => {
    expect(normalizeNumberInput('12.9', { value: 0, integer: true })).toBe(12);
    expect(
      normalizeNumberInput('1500', {
        value: 1,
        min: 1,
        max: 1000,
        integer: true,
      }),
    ).toBe(1000);
    expect(
      normalizeNumberInput('-5', {
        value: 1,
        min: 0,
        max: 10,
        integer: true,
      }),
    ).toBe(0);
  });
});
