import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui';

describe('translations', () => {
  it('has the same keys in every language, none empty', () => {
    const keys = Object.keys(ui.en).sort();
    for (const strings of Object.values(ui)) {
      expect(Object.keys(strings).sort()).toEqual(keys);
      for (const value of Object.values(strings)) expect(value.trim()).not.toBe('');
    }
  });
});
