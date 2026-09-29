import { test, expect } from 'vitest';
test('crypto', () => {
  expect(typeof crypto).toBe('object');
  expect(typeof crypto.getRandomValues).toBe('function');
});
