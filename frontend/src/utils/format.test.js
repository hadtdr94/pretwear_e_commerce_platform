import { describe, it, expect } from 'vitest';
import { formatDZD, cn } from './format';

describe('formatDZD', () => {
  it('formats DZD values', () => {
    expect(formatDZD(1500)).toContain('DZD');
    expect(formatDZD(0)).toBe('Sur devis');
    expect(formatDZD(null)).toBe('—');
  });
});

describe('cn', () => {
  it('joins truthy classes', () => {
    expect(cn('a', false, null, 'b')).toBe('a b');
  });
});
