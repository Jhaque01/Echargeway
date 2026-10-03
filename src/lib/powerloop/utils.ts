import { Station, STATIONS } from './stations';
import { KWH_SES, UPI_ID, UPI_NAME } from './constants';

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
