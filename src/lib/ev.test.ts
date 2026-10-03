import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UPI_ID,
  UPI_NAME,
  PLATFORM_FEE,
  TAX_RATE,
  CO2_PER_KWH,
  BLR,
  haversine,
  fmtDist,
  fmtDrive,
  inr,
  fmtWhen,
  fmtDuration,
  availability,
  effectiveStatus,
  STATUS_STYLES,
  energyFor,
  minutesFor,
  costBreakdown,
  round2,
  upiDeepLink,
  upiQrUrl,
  txnId,
  requestGeo,
  CONNECTORS,
  type Charger
} from './ev';

describe('ev.ts', () => {
  describe('Constants', () => {
    it('exports expected constants', () => {
      expect(UPI_ID).toBe('9832667682@upi');
      expect(UPI_NAME).toBe('eChargeWay');
      expect(PLATFORM_FEE).toBe(10);
      expect(TAX_RATE).toBe(0.18);
      expect(CO2_PER_KWH).toBe(0.71);
      expect(BLR).toEqual({ lat: 12.9352, lng: 77.6245 });
      expect(CONNECTORS).toContain('CCS2');
      expect(STATUS_STYLES.available).toBeDefined();
    });
  });

  describe('haversine', () => {
    it('calculates distance between two points', () => {
      // BLR to a point slightly offset
      const dist = haversine(12.9352, 77.6245, 12.9360, 77.6250);
      expect(dist).toBeCloseTo(0.104, 2);
    });

    it('returns 0 for identical points', () => {
      expect(haversine(12.9352, 77.6245, 12.9352, 77.6245)).toBe(0);
    });
  });

  describe('fmtDist', () => {
    it('formats distances correctly', () => {
      expect(fmtDist()).toBe('—');
      expect(fmtDist(0.5)).toBe('500 m');
      expect(fmtDist(0.99)).toBe('990 m');
      expect(fmtDist(1)).toBe('1.0 km');
      expect(fmtDist(1.23)).toBe('1.2 km');
      expect(fmtDist(10.55)).toBe('10.6 km');
    });
  });

  describe('fmtDrive', () => {
    it('formats drive times correctly', () => {
      expect(fmtDrive()).toBe('—');
      expect(fmtDrive(0)).toBe('1 min'); // min is 1
      expect(fmtDrive(0.5)).toBe('1 min');
      expect(fmtDrive(15)).toBe('30 min'); // 15km / 30km/h = 0.5h = 30m
      expect(fmtDrive(30)).toBe('1h 0m'); // 60 min
      expect(fmtDrive(45)).toBe('1h 30m'); // 90 min
    });
  });

  describe('inr', () => {
    it('formats INR correctly', () => {
      // Note: locale formatting depends on environment, but we can check basics
      const result = inr(1234.567);
      expect(result).toMatch(/₹1,?234\.57/);
      expect(inr(0)).toBe('₹0');
    });
  });

  describe('fmtWhen', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats "Today" correctly', () => {
      // Set to 2023-10-15 12:00:00 UTC
      vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
      const d = new Date('2023-10-15T10:00:00Z');
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      expect(fmtWhen(d.toISOString())).toBe(`Today · ${timeStr}`);
    });

    it('formats "Yesterday" correctly', () => {
      vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
      const d = new Date('2023-10-14T10:00:00Z');
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      expect(fmtWhen(d.toISOString())).toBe(`Yesterday · ${timeStr}`);
    });

    it('formats older dates correctly', () => {
      vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
      const d = new Date('2023-10-10T10:00:00Z');
      const dateStr = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
      expect(fmtWhen(d.toISOString())).toBe(dateStr);
    });
  });

  describe('fmtDuration', () => {
    it('formats durations correctly', () => {
      expect(fmtDuration(-5)).toBe('0 min');
      expect(fmtDuration(0)).toBe('0 min');
      expect(fmtDuration(45)).toBe('45 min');
      expect(fmtDuration(60)).toBe('1h 0m');
      expect(fmtDuration(65)).toBe('1h 5m');
      expect(fmtDuration(125)).toBe('2h 5m');
    });
  });

  describe('availability', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('handles empty chargers array', () => {
      expect(availability()).toEqual({ free: 0, total: 0 });
    });

    it('counts available chargers correctly', () => {
      const chargers = [
        { status: 'available' },
        { status: 'occupied' },
        { status: 'available', reserved_until: '2023-10-15T11:00:00Z' }, // Past reservation
        { status: 'available', reserved_until: '2023-10-15T13:00:00Z' }, // Future reservation
        { status: 'faulted' }
      ] as Charger[];

      const { free, total } = availability(chargers);
      expect(free).toBe(2); // The first one and the third one
      expect(total).toBe(5);
    });
  });

  describe('effectiveStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns reserved if reservation is in the future', () => {
      const charger = { status: 'available', reserved_until: '2023-10-15T13:00:00Z' } as Charger;
      expect(effectiveStatus(charger)).toBe('reserved');
    });

    it('returns actual status if reservation is in the past', () => {
      const charger = { status: 'available', reserved_until: '2023-10-15T11:00:00Z' } as Charger;
      expect(effectiveStatus(charger)).toBe('available');
    });

    it('returns actual status if no reservation', () => {
      const charger = { status: 'occupied', reserved_until: null } as Charger;
      expect(effectiveStatus(charger)).toBe('occupied');
    });
  });

  describe('energyFor', () => {
    it('calculates energy required', () => {
      expect(energyFor(50, 20, 80)).toBe(30); // 60% of 50kWh
      expect(energyFor(50, 80, 20)).toBe(0); // Cannot go negative
    });
  });

  describe('minutesFor', () => {
    it('calculates charging time correctly', () => {
      // 50kWh battery, 20% to 80% (60% = 30kWh) at 50kW power
      // 30 / 50 * 60 = 36 minutes
      expect(minutesFor(50, 20, 80, 50)).toBe(36);

      // 50kWh battery, 20% to 90% (70% = 35kWh) at 50kW power
      // taper applies (>80%): 35 / 50 * 60 * 1.25 = 52.5 -> 53 minutes
      expect(minutesFor(50, 20, 90, 50)).toBe(53);
    });
  });

  describe('costBreakdown', () => {
    it('calculates cost breakdown accurately', () => {
      // 30 kWh * ₹20 = ₹600
      // Platform Fee = ₹10
      // Taxes = (600 + 10) * 0.18 = ₹109.80
      // Total = 600 + 10 + 109.80 = ₹719.80
      const br = costBreakdown(30, 20);
      expect(br.energyCost).toBe(600);
      expect(br.platformFee).toBe(10);
      expect(br.taxes).toBe(109.8);
      expect(br.total).toBe(719.8);
    });
  });

  describe('round2', () => {
    it('rounds numbers to 2 decimal places', () => {
      expect(round2(1.234)).toBe(1.23);
      expect(round2(1.235)).toBe(1.24);
      expect(round2(1.2)).toBe(1.2);
    });
  });

  describe('UPI URLs', () => {
    it('generates upiDeepLink', () => {
      const link = upiDeepLink(150.5, 'Test Charge');
      expect(link).toContain(`pa=${UPI_ID}`);
      expect(link).toContain(`pn=${encodeURIComponent(UPI_NAME)}`);
      expect(link).toContain('am=150.50');
      expect(link).toContain('cu=INR');
      expect(link).toContain(`tn=${encodeURIComponent('Test Charge')}`);
    });

    it('generates upiQrUrl', () => {
      const url = upiQrUrl(150.5, 'Test Charge');
      expect(url).toContain('https://api.qrserver.com/v1/create-qr-code/');
      expect(url).toContain('data=upi%3A%2F%2Fpay');
    });
  });

  describe('txnId', () => {
    it('generates a transaction ID with ECW prefix', () => {
      const id = txnId();
      expect(id.startsWith('ECW')).toBe(true);
      expect(id.length).toBeGreaterThan(5);
    });
  });

  describe('requestGeo', () => {
    const originalGeolocation = global.navigator?.geolocation;

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      if (originalGeolocation) {
        Object.defineProperty(global.navigator, 'geolocation', {
          value: originalGeolocation,
          configurable: true,
          writable: true
        });
      } else {
        // @ts-ignore
        delete global.navigator.geolocation;
      }
    });

    it('rejects if geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
        writable: true
      });

      await expect(requestGeo()).rejects.toThrow('Geolocation not supported');
    });

    it('resolves with coordinates on success', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn().mockImplementation((success) => {
            success({ coords: { latitude: 12.34, longitude: 56.78 } });
          })
        },
        configurable: true,
        writable: true
      });

      const pos = await requestGeo();
      expect(pos).toEqual({ lat: 12.34, lng: 56.78 });
    });

    it('rejects on error', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn().mockImplementation((success, error) => {
            error({ message: 'User denied' });
          })
        },
        configurable: true,
        writable: true
      });

      await expect(requestGeo()).rejects.toThrow('User denied');
    });

    it('rejects on timeout', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn().mockImplementation(() => {
            // Do not call success or error to simulate timeout
          })
        },
        configurable: true,
        writable: true
      });

      const promise = requestGeo(100);
      vi.advanceTimersByTime(150);
      await expect(promise).rejects.toThrow('Location timed out');
    });
  });
});
