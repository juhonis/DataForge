import { describe, expect, it } from 'vitest';
import { CATEGORY_TEMPLATES } from './categories';
import { BUNDLED_PRESETS } from './builtInPresets';

describe('bundled presets', () => {
  it('has a preset for every built-in category', () => {
    const categoryIds = new Set(CATEGORY_TEMPLATES.map((category) => category.id));

    expect(BUNDLED_PRESETS).toHaveLength(CATEGORY_TEMPLATES.length);
    for (const preset of BUNDLED_PRESETS) {
      expect(categoryIds.has(preset.categoryId)).toBe(true);
    }
  });

  it('uses unique preset ids', () => {
    const ids = BUNDLED_PRESETS.map((preset) => preset.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses valid demo settings', () => {
    for (const preset of BUNDLED_PRESETS) {
      const { settings } = preset;

      expect(Number.isSafeInteger(settings.seed)).toBe(true);
      expect(settings.seed).toBeGreaterThanOrEqual(0);
      expect(settings.productCount).toBeGreaterThan(0);
      expect(settings.customerCount).toBeGreaterThanOrEqual(0);
      expect(settings.reviewCount).toBeGreaterThanOrEqual(0);
      expect(settings.ordersPerCustomer.min).toBeLessThanOrEqual(
        settings.ordersPerCustomer.max,
      );
    }
  });
});
