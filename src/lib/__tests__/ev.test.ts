import { describe, it, expect } from 'vitest';
import { upiDeepLink, UPI_ID, UPI_NAME } from '../ev';

describe('upiDeepLink', () => {
  it('should generate a correct UPI deep link with basic inputs', () => {
    const amount = 100;
    const note = 'Test Payment';
    const result = upiDeepLink(amount, note);
    expect(result).toBe(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=100.00&cu=INR&tn=Test%20Payment`);
  });

  it('should correctly format amount to 2 decimal places', () => {
    expect(upiDeepLink(100.5, 'Test')).toContain('am=100.50');
    expect(upiDeepLink(100.123, 'Test')).toContain('am=100.12');
    expect(upiDeepLink(100.128, 'Test')).toContain('am=100.13');
  });

  it('should URI encode the note correctly', () => {
    const note = 'Charge @ Station 1 & 2!';
    const result = upiDeepLink(50, note);
    expect(result).toContain(`tn=${encodeURIComponent(note)}`);
    expect(result).toContain('tn=Charge%20%40%20Station%201%20%26%202!');
  });
});
