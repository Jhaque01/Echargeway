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
