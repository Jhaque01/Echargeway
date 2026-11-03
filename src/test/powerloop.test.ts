import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestGeo } from '../lib/powerloop';

describe('requestGeo', () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // @ts-expect-error Resetting readonly property for testing
    navigator.geolocation = originalGeolocation;
  });

  it('should call onFail if geolocation is not supported', () => {
    // @ts-expect-error Modifying readonly property for testing
    delete navigator.geolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail);

    expect(onFail).toHaveBeenCalledWith('Geolocation not supported');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('should call onOk with correct position if getCurrentPosition succeeds', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      }),
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail);

    expect(onOk).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 });
    expect(onFail).not.toHaveBeenCalled();
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('should call onFail if getCurrentPosition fails', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({ message: 'User denied Geolocation' });
      }),
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail);

    expect(onFail).toHaveBeenCalledWith('User denied Geolocation');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('should call onFail if getCurrentPosition fails with default message', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({});
      }),
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail);

    expect(onFail).toHaveBeenCalledWith('Permission denied');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('should call onFail if getCurrentPosition times out', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn(), // never calls callbacks
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    vi.advanceTimersByTime(4999);
    expect(onFail).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onFail).toHaveBeenCalledWith('Location timed out');
    expect(onOk).not.toHaveBeenCalled();
  });

  it('should clear timeout if getCurrentPosition succeeds', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: { latitude: 10, longitude: 20 },
        });
      }),
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    // After success, wait for timeout and ensure onFail isn't called due to timeout
    vi.advanceTimersByTime(5000);
    expect(onFail).not.toHaveBeenCalled();
    expect(onOk).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });

  it('should clear timeout if getCurrentPosition fails', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({ message: 'Failed' });
      }),
    };
    // @ts-expect-error Modifying readonly property for testing
    navigator.geolocation = mockGeolocation;

    const onOk = vi.fn();
    const onFail = vi.fn();

    requestGeo(onOk, onFail, 5000);

    // Initial fail should be called once
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith('Failed');

    // Fast forward to trigger timeout
    vi.advanceTimersByTime(5000);
    // Shouldn't be called again for timeout
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });
});
