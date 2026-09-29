import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { requestGeo } from './ev';

describe('requestGeo', () => {
  let originalGeolocation: Geolocation;

  beforeEach(() => {
    vi.useFakeTimers();
    originalGeolocation = navigator.geolocation;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    // restore original navigator.geolocation in case vi.unstubAllGlobals doesn't work for getters
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true,
    });
  });

  it('rejects if geolocation is not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(requestGeo()).rejects.toThrow('Geolocation not supported');
  });

  it('resolves with coordinates on success', async () => {
    const mockPosition = {
      coords: {
        latitude: 12.34,
        longitude: 56.78,
      },
    };

    const getCurrentPosition = vi.fn((success, error, options) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await requestGeo();
    expect(result).toEqual({ lat: 12.34, lng: 56.78 });
    expect(getCurrentPosition).toHaveBeenCalledOnce();
  });

  it('rejects with error message on failure', async () => {
    const getCurrentPosition = vi.fn((success, error, options) => {
      error({ message: 'User denied Geolocation' });
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition },
      writable: true,
      configurable: true,
    });

    await expect(requestGeo()).rejects.toThrow('User denied Geolocation');
  });

  it('rejects with default message if error has no message', async () => {
    const getCurrentPosition = vi.fn((success, error, options) => {
      error({}); // No message property
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition },
      writable: true,
      configurable: true,
    });

    await expect(requestGeo()).rejects.toThrow('Location permission denied');
  });

  it('rejects on timeout', async () => {
    const getCurrentPosition = vi.fn();

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition },
      writable: true,
      configurable: true,
    });

    const promise = requestGeo(5000);

    // Advance time by 5001ms
    vi.advanceTimersByTime(5001);

    await expect(promise).rejects.toThrow('Location timed out');
  });
});
