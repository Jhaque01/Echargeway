import { describe, it, expect } from 'vitest';
import { makeQrUrl, makeDeepLink, UPI_ID, UPI_NAME } from './powerloop';

describe('UPI Link Generators', () => {
  describe('makeDeepLink', () => {
    it('should correctly format a standard UPI deep link', () => {
      const amount = '100.50';
      const stName = 'Main St Station';
      const result = makeDeepLink(amount, stName);

      expect(result).toBe(
        `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('EV Charging – ' + stName)}`
      );
    });

    it('should correctly encode special characters in station name', () => {
      const amount = '50';
      const stName = 'Cafe & Charge!';
      const result = makeDeepLink(amount, stName);

      const expectedTn = encodeURIComponent('EV Charging – Cafe & Charge!');
      expect(result).toContain(`&tn=${expectedTn}`);
    });
  });

  describe('makeQrUrl', () => {
    it('should correctly wrap the deep link into a QR code API URL', () => {
      const amount = '100.50';
      const stName = 'Main St Station';
      const expectedDeepLink = makeDeepLink(amount, stName);

      const result = makeQrUrl(amount, stName);

      expect(result).toBe(
        `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(expectedDeepLink)}&bgcolor=ffffff&color=000000&margin=14&format=png`
      );
    });

    it('should produce a valid URL string without breaking on special characters', () => {
      const amount = '20.00';
      const stName = 'Test & "Station" / ?';
      const result = makeQrUrl(amount, stName);

      const expectedDeepLink = makeDeepLink(amount, stName);
      expect(result).toContain(encodeURIComponent(expectedDeepLink));

      // Ensure the base URL is correct
      expect(result.startsWith('https://api.qrserver.com/v1/create-qr-code/')).toBe(true);
    });
  });
});
