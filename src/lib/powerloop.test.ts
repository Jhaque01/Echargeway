import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestGeo } from './powerloop';

describe('requestGeo', () => {
  let originalGeolocation: any;

  beforeEach(() => {
    vi.useFakeTimers();
    // Save the original geolocation object
    originalGeolocation = global.navigator.geolocation;
  });

  afterEach(() => {
    // Restore the original geolocation object
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
      writable: true
    });
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('calls onFail when geolocation is not supported', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail);

    expect(onFail).toHaveBeenCalledWith('Geolocation not supported');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onFail when location times out', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn()
      },
      configurable: true,
      writable: true
    });

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(5000);

    expect(onFail).toHaveBeenCalledWith('Location timed out');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('calls onOk and clears timeout when geolocation succeeds', () => {
    const mockPosition = {
      coords: {
        latitude: 12.9279,
        longitude: 77.6271
      }
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((successCallback) => {
          successCallback(mockPosition);
        })
      },
      configurable: true,
      writable: true
    });

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    expect(onOk).toHaveBeenCalledWith({ lat: 12.9279, lng: 77.6271 });
    expect(onFail).not.toHaveBeenCalled();

    // Fast-forward time to ensure timeout was cleared
    vi.advanceTimersByTime(5000);
    expect(onFail).not.toHaveBeenCalled();
  });

  it('calls onFail and clears timeout when geolocation fails with message', () => {
    const mockError = {
      message: 'Custom error message'
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((successCallback, errorCallback) => {
          errorCallback(mockError);
        })
      },
      configurable: true,
      writable: true
    });

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    expect(onFail).toHaveBeenCalledWith('Custom error message');
    expect(onOk).not.toHaveBeenCalled();

    // Fast-forward time to ensure timeout was cleared
    vi.advanceTimersByTime(5000);
    expect(onFail).toHaveBeenCalledTimes(1); // Only called once, not by timeout
  });

  it('calls onFail and clears timeout when geolocation fails without message', () => {
    const mockError = {}; // No message property

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((successCallback, errorCallback) => {
          errorCallback(mockError);
        })
      },
      configurable: true,
      writable: true
    });

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    expect(onFail).toHaveBeenCalledWith('Permission denied');
    expect(onOk).not.toHaveBeenCalled();

    // Fast-forward time to ensure timeout was cleared
    vi.advanceTimersByTime(5000);
    expect(onFail).toHaveBeenCalledTimes(1); // Only called once, not by timeout
  });
});
