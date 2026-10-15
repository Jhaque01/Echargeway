import { describe, it, expect, vi, afterEach } from 'vitest';
import { chkToken } from './powerloop';

describe('chkToken', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return payload for a valid token', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));

    // Create a valid token with expiry in the future
    const payload = { uid: 'u123', exp: Date.now() + 3600000 };
    const token = btoa(JSON.stringify(payload));

    const result = chkToken(token);
    expect(result).toEqual(payload);
  });

  it('should throw an error for an expired token', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));

    // Create an expired token
    const payload = { uid: 'u123', exp: Date.now() - 3600000 };
    const token = btoa(JSON.stringify(payload));

    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });

  it('should throw an error for a malformed token (invalid base64)', () => {
    expect(() => chkToken('invalid-base64-!@#')).toThrow('Session expired — please log in again');
  });

  it('should throw an error for a malformed token (invalid JSON)', () => {
    const token = btoa('invalid-json');
    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });
});
