import { test, expect } from 'vitest';
import { callApi } from '../lib/powerloop';

test('callApi /auth/send-otp generates a secure 6-digit OTP', async () => {
  const result = await callApi('/auth/send-otp', 'POST', { phone: '1234567890' });
  expect(result.dev_otp).toBeDefined();
  expect(typeof result.dev_otp).toBe('string');
  expect(result.dev_otp.length).toBe(6);
  // Ensure it's a number string between 100000 and 999999
  const otpNumber = parseInt(result.dev_otp, 10);
  expect(otpNumber).toBeGreaterThanOrEqual(100000);
  expect(otpNumber).toBeLessThanOrEqual(999999);
});
