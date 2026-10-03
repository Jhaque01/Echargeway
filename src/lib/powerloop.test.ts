import { describe, it, expect } from 'vitest';
import { sessPrice, KWH_SES } from './powerloop';

describe('sessPrice', () => {
  it('calculates price correctly for integer inputs', () => {
    expect(sessPrice(10)).toBe(10 * KWH_SES);
    expect(sessPrice(5)).toBe(5 * KWH_SES);
  });

  it('calculates price correctly for float inputs and rounds to nearest integer', () => {
    // 10.5 * 30 = 315
    expect(sessPrice(10.5)).toBe(315);

    // 10.51 * 30 = 315.3 (rounds to 315)
    expect(sessPrice(10.51)).toBe(315);

    // 10.52 * 30 = 315.6 (rounds to 316)
    expect(sessPrice(10.52)).toBe(316);
  });

  it('returns 0 for 0 input', () => {
    expect(sessPrice(0)).toBe(0);
  });

  it('handles negative inputs', () => {
    expect(sessPrice(-10)).toBe(-10 * KWH_SES);
    expect(sessPrice(-10.5)).toBe(-315);
  });

  it('handles small float inputs correctly', () => {
    // 0.01 * 30 = 0.3 (rounds to 0)
    expect(sessPrice(0.01)).toBe(0);

    // 0.02 * 30 = 0.6 (rounds to 1)
    expect(sessPrice(0.02)).toBe(1);
  });
});
