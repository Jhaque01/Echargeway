import { describe, it, expect } from 'vitest';
import { txnId } from './ev';

describe('ev utilities', () => {
  describe('txnId', () => {
    it('should generate a transaction ID starting with ECW', () => {
      const id = txnId();
      expect(id.startsWith('ECW')).toBe(true);
    });

    it('should generate a string of reasonable length', () => {
      const id = txnId();
      // Length is 3 (ECW) + 8-9 (timestamp base36) + 3 (random 100-999) = 14 to 15
      expect(id.length).toBeGreaterThanOrEqual(14);
      expect(id.length).toBeLessThanOrEqual(16);
    });

    it('should end with a number between 100 and 999', () => {
      const id = txnId();
      const lastThreeDigits = id.slice(-3);
      const num = parseInt(lastThreeDigits, 10);
      expect(num).toBeGreaterThanOrEqual(100);
      expect(num).toBeLessThanOrEqual(999);
    });

    it('should generate reasonably unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(txnId());
      }
      // Since it uses millisecond timestamp and 900 possible random values,
      // generating 1000 in a tight loop will have some collisions.
      expect(ids.size).toBeGreaterThan(900);
    });
  });
});
