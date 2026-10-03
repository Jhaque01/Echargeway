import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  haversine,
  fmtDist,
  fmtTime,
  fmtAge,
  sortedStations,
  sessPrice,
  makeQrUrl,
  makeDeepLink,
  chkToken,
  requestGeo,
} from './powerloop';

describe('powerloop utilities', () => {
  describe('haversine', () => {
    it('calculates the distance between two same points as 0', () => {
      expect(haversine(12.9279, 77.6271, 12.9279, 77.6271)).toBeCloseTo(0);
    });

    it('calculates the distance between two different points correctly', () => {
      // Known distance between BLR (12.9352, 77.6245) and Koramangala Station (12.9279, 77.6271)
      const dist = haversine(12.9352, 77.6245, 12.9279, 77.6271);
      expect(dist).toBeCloseTo(0.86, 1);
    });
  });

  describe('fmtDist', () => {
    it('formats distance less than 1 km in meters', () => {
      expect(fmtDist(0.86)).toBe('860 m');
      expect(fmtDist(0.005)).toBe('5 m');
    });

    it('formats distance greater than or equal to 1 km with 1 decimal place', () => {
      expect(fmtDist(1)).toBe('1.0 km');
      expect(fmtDist(12.34)).toBe('12.3 km');
      // 12.35 rounds down to 12.3 in JS Number.prototype.toFixed(1)
      expect(fmtDist(12.35)).toBe('12.3 km');
      expect(fmtDist(12.36)).toBe('12.4 km');
    });
  });

  describe('fmtTime', () => {
    it('formats time less than 60 mins correctly', () => {
      expect(fmtTime(15)).toBe('30 min'); // 15 / 30 * 60 = 30
      expect(fmtTime(0)).toBe('0 min');
      expect(fmtTime(29)).toBe('58 min'); // 29 / 30 * 60 = 58
    });

    it('formats time 60 mins or greater in hours and minutes', () => {
      expect(fmtTime(30)).toBe('1h 0m'); // 30 / 30 * 60 = 60 mins -> 1h 0m
      expect(fmtTime(45)).toBe('1h 30m'); // 45 / 30 * 60 = 90 mins -> 1h 30m
      expect(fmtTime(75)).toBe('2h 30m'); // 75 / 30 * 60 = 150 mins -> 2h 30m
    });
  });

  describe('fmtAge', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set fixed time to 2024-01-10T12:00:00.000Z
      vi.setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats today', () => {
      // 2 hours ago
      const d = new Date('2024-01-10T10:00:00.000Z');
      expect(fmtAge(d.toISOString())).toBe('Today · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    });

    it('formats yesterday', () => {
      // Yesterday same time
      const d = new Date('2024-01-09T10:00:00.000Z');
      expect(fmtAge(d.toISOString())).toBe('Yesterday · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    });

    it('formats older dates with short month and year', () => {
      // 3 days ago
      const d = new Date('2024-01-07T12:00:00.000Z');
      expect(fmtAge(d.toISOString())).toBe(d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }));
    });
  });

  describe('sortedStations', () => {
    it('returns stations sorted by distance from given position with added fields', () => {
      const pos = { lat: 12.9352, lng: 77.6245 }; // BLR
      const sorted = sortedStations(pos);

      expect(sorted.length).toBeGreaterThan(0);
      expect(sorted[0].id).toBe(1); // Koramangala Station should be closest

      expect(sorted[0]).toHaveProperty('km');
      expect(sorted[0]).toHaveProperty('distStr');
      expect(sorted[0]).toHaveProperty('timeStr');

      // Ensure sorted by km
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].km).toBeGreaterThanOrEqual(sorted[i - 1].km!);
      }
    });
  });

  describe('sessPrice', () => {
    it('calculates session price by multiplying with KWH_SES (30) and rounding', () => {
      expect(sessPrice(18.5)).toBe(Math.round(18.5 * 30));
      expect(sessPrice(10)).toBe(300);
    });
  });

  describe('makeQrUrl', () => {
    it('generates correct QR URL for a given amount and station name', () => {
      const url = makeQrUrl('150.50', 'Test Station');
      expect(url).toContain('api.qrserver.com');
      expect(url).toContain('150.50');
      // In makeQrUrl, the inner string is double encoded because it's encoded once for upi string, and then the entire upi string is encoded for the data param
      expect(url).toContain(encodeURIComponent(encodeURIComponent('EV Charging – Test Station')));
      expect(url).toContain(encodeURIComponent('9832667682@upi'));
      expect(url).toContain(encodeURIComponent(encodeURIComponent('eChargeWay')));
    });
  });

  describe('makeDeepLink', () => {
    it('generates correct deep link for a given amount and station name', () => {
      const link = makeDeepLink('200', 'Hub A');
      expect(link).toContain('upi://pay');
      expect(link).toContain('200');
      expect(link).toContain(encodeURIComponent('EV Charging – Hub A'));
      expect(link).toContain('9832667682@upi');
      expect(link).toContain(encodeURIComponent('eChargeWay'));
    });
  });

  describe('chkToken', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns parsed payload if token is valid and not expired', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const payload = { uid: 'u123', exp: now + 10000 };
      const token = btoa(JSON.stringify(payload));

      const res = chkToken(token);
      expect(res.uid).toBe('u123');
      expect(res.exp).toBe(payload.exp);
    });

    it('throws error if token is expired', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const payload = { uid: 'u123', exp: now - 10000 };
      const token = btoa(JSON.stringify(payload));

      expect(() => chkToken(token)).toThrow('Session expired — please log in again');
    });

    it('throws error if token is invalid format', () => {
      expect(() => chkToken('invalid-token-format')).toThrow('Session expired — please log in again');
    });
  });

  describe('requestGeo', () => {
    let onOk: ReturnType<typeof vi.fn>;
    let onFail: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.useFakeTimers();
      onOk = vi.fn();
      onFail = vi.fn();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('calls onFail if geolocation is not supported', () => {
      // ensure geolocation is undefined
      Object.defineProperty(global.navigator, 'geolocation', { value: undefined, configurable: true });

      requestGeo(onOk, onFail);

      expect(onFail).toHaveBeenCalledWith('Geolocation not supported');
      expect(onOk).not.toHaveBeenCalled();
    });

    it('calls onOk on successful geolocation', () => {
      const mockPosition = {
        coords: {
          latitude: 12.9352,
          longitude: 77.6245
        }
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success, _error, _options) => {
          success(mockPosition);
        })
      };

      Object.defineProperty(global.navigator, 'geolocation', { value: mockGeolocation, configurable: true });

      requestGeo(onOk, onFail);

      expect(onOk).toHaveBeenCalledWith({ lat: 12.9352, lng: 77.6245 });
      expect(onFail).not.toHaveBeenCalled();
    });

    it('calls onFail on geolocation error', () => {
      const mockError = { message: 'User denied Geolocation' };

      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((_success, error, _options) => {
          error(mockError);
        })
      };

      Object.defineProperty(global.navigator, 'geolocation', { value: mockGeolocation, configurable: true });

      requestGeo(onOk, onFail);

      expect(onFail).toHaveBeenCalledWith('User denied Geolocation');
      expect(onOk).not.toHaveBeenCalled();
    });

    it('calls onFail if location times out', () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn() // Does not call success or error
      };

      Object.defineProperty(global.navigator, 'geolocation', { value: mockGeolocation, configurable: true });

      requestGeo(onOk, onFail, 5000);

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(5000);

      expect(onFail).toHaveBeenCalledWith('Location timed out');
      expect(onOk).not.toHaveBeenCalled();
    });
  });
});
