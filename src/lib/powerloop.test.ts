import { describe, it, expect } from 'vitest';
import { chkToken } from './powerloop';

describe('chkToken', () => {
  it('should parse a valid token and return its payload', () => {
    const payload = { uid: '123', exp: Date.now() + 100000 };
    const token = btoa(JSON.stringify(payload));
    const result = chkToken(token);
    expect(result).toEqual(payload);
  });

  it('should throw an error for an expired token', () => {
    const payload = { uid: '123', exp: Date.now() - 100000 };
    const token = btoa(JSON.stringify(payload));
    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });

  it('should throw an error for a malformed token (invalid base64)', () => {
    const token = 'not-base-64-!@#$';
    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });

  it('should throw an error for a malformed token (invalid JSON)', () => {
    const token = btoa('not-json');
    expect(() => chkToken(token)).toThrow('Session expired — please log in again');
  });
});
