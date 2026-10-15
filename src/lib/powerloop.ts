import { UPI_ID, UPI_NAME } from './ev';

// Constants
export { UPI_ID, UPI_NAME };
export const KWH_SES = 30;

// Colors
export const BG = '#000000';
export const S1 = '#0A0A0A';
export const S2 = '#1A1A1A';
export const S3 = '#222222';
export const BD = 'rgba(255,255,255,.07)';
export const BM = 'rgba(255,255,255,.13)';
export const GN = '#22C56E';
export const GD = 'rgba(34,197,110,.12)';
export const GG = 'rgba(34,197,110,.28)';
export const TX = '#F4F4F5';
export const TS = '#A1A1AA';
export const TM = '#52525B';
export const RD = '#EF4444';
export const RM = 'rgba(239,68,68,.12)';

// Style objects
export const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', borderRadius: 22, padding: 18,
  border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 8px 32px rgba(0,0,0,.6)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
};
export const IBOX: React.CSSProperties = {
  width: 43, height: 43, background: 'rgba(34,197,110,.1)', borderRadius: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(34,197,110,.18)', flexShrink: 0,
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
export const SMCARD: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)', borderRadius: 13, padding: '12px 13px',
  border: '1px solid rgba(255,255,255,.08)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
};
export const GBTN: React.CSSProperties = {
  background: GN, color: '#fff', border: 'none', borderRadius: 12,
  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
};
export const DBTN: React.CSSProperties = {
  background: S2, color: TS, border: '1px solid ' + BD, borderRadius: 12,
  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
};

// Stations
export interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  av: number;
  tot: number;
  price: number;
  types: string;
  km?: number;
  distStr?: string;
  timeStr?: string;
}

export const STATIONS: Station[] = [
  { id: 1, name: 'Koramangala Station', lat: 12.9279, lng: 77.6271, av: 4, tot: 6, price: 18.5, types: 'CCS2 (50kW) & CHAdeMO' },
  { id: 2, name: 'Indiranagar Hub', lat: 12.9784, lng: 77.6408, av: 2, tot: 4, price: 16.0, types: 'CCS2 (50kW)' },
  { id: 3, name: 'HSR Layout Point', lat: 12.9116, lng: 77.6389, av: 6, tot: 6, price: 19.0, types: 'CHAdeMO & Type 2' },
  { id: 4, name: 'Whitefield Charge Hub', lat: 12.9698, lng: 77.7499, av: 3, tot: 8, price: 17.5, types: 'CCS2 (150kW)' },
  { id: 5, name: 'Marathahalli Point', lat: 12.9592, lng: 77.6974, av: 5, tot: 6, price: 18.0, types: 'CCS2 & CHAdeMO' },
  { id: 6, name: 'Electronic City Hub', lat: 12.8394, lng: 77.6769, av: 1, tot: 4, price: 15.5, types: 'Type 2 (22kW)' },
];

export const BLR = { lat: 12.9352, lng: 77.6245 };

// Utils
export function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371;
  const r = (x: number) => x * Math.PI / 180;
  const v = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}

export function fmtDist(km: number) {
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';
}

export function fmtTime(km: number) {
  const m = Math.round(km / 30 * 60);
  return m < 60 ? m + ' min' : Math.floor(m / 60) + 'h ' + m % 60 + 'm';
}

export function fmtAge(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 864e5);
  if (diff === 0) return 'Today · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Yesterday · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function sortedStations(pos: { lat: number; lng: number }): Station[] {
  return STATIONS.map(s => ({ ...s, km: haversine(pos.lat, pos.lng, s.lat, s.lng) }))
    .sort((a, b) => (a.km || 0) - (b.km || 0))
    .map(s => ({ ...s, distStr: fmtDist(s.km || 0), timeStr: fmtTime(s.km || 0) }));
}

export function sessPrice(price: number) {
  return Math.round(price * KWH_SES);
}

export function makeQrUrl(amount: string, stName: string) {
  const upi = 'upi://pay?pa=' + UPI_ID + '&pn=' + encodeURIComponent(UPI_NAME) + '&am=' + amount + '&cu=INR&tn=' + encodeURIComponent('EV Charging – ' + stName);
  return 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(upi) + '&bgcolor=ffffff&color=000000&margin=14&format=png';
}

export function makeDeepLink(amount: string, stName: string) {
  return 'upi://pay?pa=' + UPI_ID + '&pn=' + encodeURIComponent(UPI_NAME) + '&am=' + amount + '&cu=INR&tn=' + encodeURIComponent('EV Charging – ' + stName);
}

// Storage
export const store = {
  get: (k: string) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set: (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k: string) => localStorage.removeItem(k),
};

// Local DB
export const DB = {
  users: { get: () => store.get('pl_db_usr') || [], save: (v: any) => store.set('pl_db_usr', v) },
  otps: { get: () => store.get('pl_db_otp') || {}, save: (v: any) => store.set('pl_db_otp', v) },
  hist: { get: (uid: string) => store.get('pl_hist_' + uid) || [], save: (uid: string, v: any) => store.set('pl_hist_' + uid, v) },
};

function mkToken(uid: string) { return btoa(JSON.stringify({ uid, exp: Date.now() + 30 * 24 * 3600000 })); }

export function chkToken(tok: string) {
  try {
    const p = JSON.parse(atob(tok));
    if (p.exp < Date.now()) throw new Error('expired');
    return p;
  } catch {
    throw new Error('Session expired — please log in again');
  }
}

// Local API
export async function callApi(path: string, method?: string, body?: any, token?: string): Promise<any> {
  await new Promise(r => setTimeout(r, 340));
  method = method || 'GET';

  if (path === '/auth/send-otp') {
    const ph = (body.phone || '').trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = DB.otps.get();
    otps[ph] = { otp, exp: Date.now() + 300000 };
    DB.otps.save(otps);
    return { dev_otp: otp, message: 'OTP sent' };
  }

  if (path === '/auth/verify-otp') {
    const { phone: ph, otp } = body;
    const otps = DB.otps.get();
    const e = otps[ph];
    if (!e || e.exp < Date.now()) { if (e) { delete otps[ph]; DB.otps.save(otps); } throw new Error('OTP expired — request a new one'); }
    if (e.otp !== otp) throw new Error('Invalid OTP — please try again');
    delete otps[ph]; DB.otps.save(otps);
    const users = DB.users.get();
    const u = users.find((x: any) => x.phone === ph);
    if (u) return { status: 'LOGIN', token: mkToken(u.id), user: u };
    return { status: 'NEW_USER', verify_token: btoa(JSON.stringify({ phone: ph, exp: Date.now() + 600000 })) };
  }

  if (path === '/auth/register') {
    const { verify_token: vt, name, email } = body;
    let v: any;
    try { v = JSON.parse(atob(vt)); } catch { throw new Error('Invalid token'); }
    if (v.exp < Date.now()) throw new Error('Session expired');
    const users = DB.users.get();
    const nu = { id: 'u' + Date.now(), name, phone: v.phone, email: email || '', avatar_url: null, created_at: new Date().toISOString() };
    users.push(nu); DB.users.save(users);
    return { token: mkToken(nu.id), user: nu };
  }

  if (path === '/auth/google') throw new Error('Google Sign-In is not available in offline mode — please use Mobile OTP.');

  if (path === '/profile' && method === 'GET') {
    const p = chkToken(token!);
    const u = DB.users.get().find((x: any) => x.id === p.uid);
    if (!u) throw new Error('User not found');
    return u;
  }

  if (path === '/profile' && method === 'PUT') {
    const p = chkToken(token!);
    const arr = DB.users.get();
    const i = arr.findIndex((x: any) => x.id === p.uid);
    if (i === -1) throw new Error('User not found');
    arr[i] = { ...arr[i], ...body }; DB.users.save(arr);
    return arr[i];
  }

  if (path === '/history' && method === 'GET') {
    const p = chkToken(token!);
    return DB.hist.get(p.uid);
  }

  if (path === '/history' && method === 'POST') {
    const p = chkToken(token!);
    const h = DB.hist.get(p.uid);
    const e = { id: 'h' + Date.now(), ...body, status: 'paid', created_at: new Date().toISOString() };
    h.unshift(e); if (h.length > 50) h.splice(50);
    DB.hist.save(p.uid, h);
    return e;
  }

  throw new Error('Unknown endpoint: ' + path);
}

// Geolocation
export function requestGeo(onOk: (pos: { lat: number; lng: number }) => void, onFail: (msg: string) => void, timeoutMs?: number) {
  if (!navigator.geolocation) { onFail('Geolocation not supported'); return; }
  const timer = setTimeout(() => onFail('Location timed out'), timeoutMs || 10000);
  navigator.geolocation.getCurrentPosition(
    pos => { clearTimeout(timer); onOk({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
    err => { clearTimeout(timer); onFail(err.message || 'Permission denied'); },
    { enableHighAccuracy: true, timeout: timeoutMs || 10000, maximumAge: 0 }
  );
}
