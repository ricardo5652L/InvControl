import { describe, expect, it } from 'vitest';
import { formatCurrency } from './utils.js';

describe('formatCurrency', () => {
  it('formats MXN values', () => {
    expect(formatCurrency(28.5)).toContain('28.50');
  });
});
