import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { chkToken } from './powerloop';

describe('chkToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns parsed payload for a valid and non-expired token', () => {
    const now = new Date('2023-01-01T12:00:00Z').getTime();
    vi.setSystemTime(now);

    const payload = { uid: 'user123', exp: now + 3600000 }; // Expires in 1 hour
    const token = btoa(JSON.stringify(payload));

    const result = chkToken(token);
    expect(result).toEqual(payload);
  });

  it('throws "Session expired — please log in again" for an expired token', () => {
    const now = new Date('2023-01-01T12:00:00Z').getTime();
    vi.setSystemTime(now);

    const payload = { uid: 'user123', exp: now - 1000 }; // Expired 1 second ago
    const token = btoa(JSON.stringify(payload));

    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });

  it('throws "Session expired — please log in again" for invalid base64 string', () => {
    const token = 'not-a-valid-base64-string!@#';

    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });

  it('throws "Session expired — please log in again" for valid base64 but invalid JSON', () => {
    const token = btoa('invalid-json');

    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });
});
