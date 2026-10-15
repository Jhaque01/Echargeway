export const UPI_ID = '9832667682@upi';
export const UPI_NAME = 'eChargeWay';
export const PLATFORM_FEE = 10;
export const TAX_RATE = 0.18;
export const CO2_PER_KWH = 0.71;
export const BLR = { lat: 12.9352, lng: 77.6245 };

export interface Charger {
  id: string;
  station_id: string;
  charger_code: string;
  connector_type: string;
  power_kw: number;
  price_per_kwh: number;
  status: string;
  reserved_until: string | null;
  reserved_by: string | null;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  amenities: string[];
  rating: number;
  chargers?: Charger[];
  km?: number;
}

export function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371;
  const r = (x: number) => (x * Math.PI) / 180;
  const v =
    Math.sin(r(c - a) / 2) ** 2 +
    Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}

export const fmtDist = (km?: number) =>
  km == null ? '—' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

export function fmtDrive(km?: number) {
  if (km == null) return '—';
  const m = Math.max(1, Math.round((km / 30) * 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const inr = (n: number) =>
  `₹${(Math.round(n * 100) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function fmtWhen(ts: string) {
  const d = new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 864e5);
  const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `Today · ${t}`;
  if (diff === 1) return `Yesterday · ${t}`;
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDuration(mins: number) {
  const m = Math.max(0, Math.round(mins));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function availability(chargers: Charger[] = []) {
  const now = Date.now();
  const free = chargers.filter(
    (c) =>
      c.status === 'available' &&
      !(c.reserved_until && new Date(c.reserved_until).getTime() > now)
  ).length;
  return { free, total: chargers.length };
}

export function effectiveStatus(c: Charger) {
  if (c.reserved_until && new Date(c.reserved_until).getTime() > Date.now()) return 'reserved';
  return c.status;
}

export const STATUS_STYLES: Record<string, { label: string; cls: string; dot: string }> = {
  available: { label: 'Available', cls: 'text-primary bg-primary/10 border-primary/25', dot: 'bg-primary' },
  occupied: { label: 'In use', cls: 'text-warning bg-warning/10 border-warning/25', dot: 'bg-warning' },
  reserved: { label: 'Reserved', cls: 'text-warning bg-warning/10 border-warning/25', dot: 'bg-warning' },
  offline: { label: 'Offline', cls: 'text-muted-foreground bg-muted/40 border-border', dot: 'bg-muted-foreground' },
  faulted: { label: 'Faulted', cls: 'text-destructive bg-destructive/10 border-destructive/25', dot: 'bg-destructive' },
};

/** Energy (kWh) needed to move from `from`% to `to`% on a battery of `capacity` kWh. */
export function energyFor(capacity: number, from: number, to: number) {
  return Math.max(0, ((to - from) / 100) * capacity);
}

/** Minutes required, allowing for charge tapering above 80%. */
export function minutesFor(capacity: number, from: number, to: number, powerKw: number) {
  const kwh = energyFor(capacity, from, to);
  const taper = to > 80 ? 1.25 : 1;
  return Math.max(1, Math.round((kwh / Math.max(3, powerKw)) * 60 * taper));
}

export function costBreakdown(energyKwh: number, pricePerKwh: number) {
  const energyCost = energyKwh * pricePerKwh;
  const taxes = (energyCost + PLATFORM_FEE) * TAX_RATE;
  return {
    energyCost: round2(energyCost),
    platformFee: PLATFORM_FEE,
    taxes: round2(taxes),
    total: round2(energyCost + PLATFORM_FEE + taxes),
  };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function upiDeepLink(amount: number, note: string) {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount.toFixed(
    2
  )}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function upiQrUrl(amount: number, note: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    upiDeepLink(amount, note)
  )}&bgcolor=030706&color=7CFF3A&margin=10&format=png`;
}

export function txnId() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomSuffix = Math.floor((array[0] / (0xffffffff + 1)) * 900 + 100);
  return `ECW${Date.now().toString(36).toUpperCase()}${randomSuffix}`;
}

export function requestGeo(timeoutMs = 10000): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    const t = setTimeout(() => reject(new Error('Location timed out')), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(t);
        resolve({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      (e) => {
        clearTimeout(t);
        reject(new Error(e.message || 'Location permission denied'));
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 }
    );
  });
}

export const CONNECTORS = ['CCS2', 'CHAdeMO', 'Type 2'];
