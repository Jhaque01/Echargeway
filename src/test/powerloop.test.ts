import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../lib/powerloop';

describe('store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('encrypts and decrypts simple strings', () => {
    store.set('test_str', 'hello world');
    expect(localStorage.getItem('test_str')).toMatch(/^enc:/);
    expect(store.get('test_str')).toBe('hello world');
  });

  it('encrypts and decrypts objects', () => {
    const obj = { id: 1, name: 'Alice' };
    store.set('test_obj', obj);
    expect(localStorage.getItem('test_obj')).toMatch(/^enc:/);
    expect(store.get('test_obj')).toEqual(obj);
  });

  it('falls back to plaintext if data is not encrypted', () => {
    const obj = { id: 2, name: 'Bob' };
    localStorage.setItem('old_data', JSON.stringify(obj));
    expect(store.get('old_data')).toEqual(obj);
  });

  it('returns null if key does not exist', () => {
    expect(store.get('missing')).toBeNull();
  });
});
