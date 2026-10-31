import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Tables } from '@/integrations/supabase/types';
import {
  Station, sortedStations, sessPrice, requestGeo, BLR,
  GN, GG, GD, S1, S2, S3, BD, BM, TX, TS, TM, RD, SMCARD,
} from '@/lib/powerloop';
import { Avatar, Spinner, IcBolt, IcCar, IcNav, IcRup, IcLoc } from '@/components/pl/Shared';
import PayModal from '@/components/pl/PayModal';
import upiLogo from '@/assets/upi-official.jpeg';

interface MapScreenProps {
  onBack: () => void;
  user: Tables<'profiles'> | null;
  token: string;
  onHistAdd?: (h: Tables<'charging_history'>) => void;
}

export default function MapScreen({ onBack, user, token, onHistAdd }: MapScreenProps) {
  const [pos, setPos] = useState(BLR);
  const [stations, setStns] = useState<Station[]>([]);
  const [sel, setSel] = useState<Station | null>(null);
  const [locSt, setLocSt] = useState<'loading' | 'ok' | 'error'>('loading');
  const [locMsg, setLocMsg] = useState('Detecting your location…');
  const [showPay, setShowPay] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mkRef = useRef<Record<number, L.Marker>>({});
  const uMkRef = useRef<L.Marker | null>(null);
  const stRef = useRef<Station[]>([]);

  useEffect(() => { stRef.current = stations; }, [stations]);

  const redrawMarkers = useCallback((sorted: Station[], selSta: Station | null) => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(mkRef.current).forEach(m => { try { m.remove(); } catch (e) { /* ignore */ } });
    mkRef.current = {};
    sorted.forEach(s => {
      const isSel = selSta && s.id === selSta.id;
      const col = isSel ? '#22C55E' : '#1C1C1C';
      const bord = isSel ? '#050505' : 'rgba(34,197,94,.4)';
      const glow = isSel ? '0 0 20px rgba(34,197,94,.9)' : 'none';
      const icon = L.divIcon({
        className: '',
        iconSize: [38, 46],
        iconAnchor: [19, 46],
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${col};border:2.5px solid ${bord};display:flex;align-items:center;justify-content:center;box-shadow:${glow};cursor:pointer"><span style="transform:rotate(45deg);color:#fff;font-size:9px;font-weight:900">CW</span></div>`,
      });
      const mk = L.marker([s.lat, s.lng], { icon }).addTo(map);
      mk.on('click', () => {
        setSel(s);
        redrawMarkers(stRef.current, s);
        map.panTo([s.lat, s.lng], { animate: true, duration: 0.4 } as L.PanOptions);
      });
      mkRef.current[s.id] = mk;
    });
  }, []);

  useEffect(() => {
    const tid = setTimeout(() => {
      const el = document.getElementById('pl-map-container');
      if (!el || mapRef.current) return;

      const map = L.map(el, {
        center: [12.9352, 77.6245],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = map;

      const userIcon = L.divIcon({
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html: '<div style="position:relative;width:20px;height:20px"><div style="width:14px;height:14px;background:#22C55E;border-radius:50%;border:3px solid #080808;box-shadow:0 0 14px rgba(34,197,94,.9);position:absolute;top:3px;left:3px;z-index:2"></div><div style="width:36px;height:36px;border-radius:50%;background:rgba(34,197,94,.15);position:absolute;top:-8px;left:-8px;animation:pulse-dot 2s ease infinite"></div></div>',
      });

      requestGeo(
        p => {
          setPos(p); setLocSt('ok');
          const sorted = sortedStations(p);
          setStns(sorted); setSel(sorted[0]);
          map.setView([p.lat, p.lng], 14, { animate: true });
          if (uMkRef.current) try { uMkRef.current.remove(); } catch (e) { /* ignore */ }
          uMkRef.current = L.marker([p.lat, p.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          redrawMarkers(sorted, sorted[0]);
        },
        e => {
          setLocSt('error'); setLocMsg(e);
          const sorted = sortedStations(BLR);
          setPos(BLR); setStns(sorted); setSel(sorted[0]);
          redrawMarkers(sorted, sorted[0]);
        },
        12000
      );
    }, 80);

    return () => {
      clearTimeout(tid);
      if (mapRef.current) { try { mapRef.current.remove(); } catch (e) { /* ignore */ } mapRef.current = null; }
    };
  }, [redrawMarkers]);

  const clickChip = (s: Station) => {
    setSel(s);
    redrawMarkers(stations, s);
    if (mapRef.current) mapRef.current.panTo([s.lat, s.lng], { animate: true, duration: 0.4 } as L.PanOptions);
  };

  const openNav = () => {
    if (!sel) return;
    const o = pos ? `&origin=${pos.lat},${pos.lng}` : '';
    window.open(`https://www.google.com/maps/dir/?api=1${o}&destination=${sel.lat},${sel.lng}&travelmode=driving`, '_blank');
  };

  const recenter = () => {
    if (mapRef.current && pos) mapRef.current.setView([pos.lat, pos.lng], 14, { animate: true });
  };

  const mapH = Math.max(300, window.innerHeight - 290);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0D0D0D',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Map */}
      <div style={{ position: 'relative', height: mapH, flexShrink: 0 }}>
        <div id="pl-map-container" style={{ width: '100%', height: '100%', background: '#111' }} />

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 14, left: 14, right: 14, zIndex: 500,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button onClick={onBack} style={{
            background: 'rgba(8,8,8,.95)', border: '1px solid rgba(255,255,255,.15)',
            backdropFilter: 'blur(16px)', borderRadius: 22, padding: '9px 16px',
            fontWeight: 800, fontSize: 15, color: TX, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 2px 20px rgba(0,0,0,.8)', fontFamily: 'inherit',
          }}>
            <span>←</span> <span>e<span style={{ color: GN }}>Charge</span>Way</span>
          </button>
          {user && <Avatar name={user.name} img={user.avatar_url} size={38} />}
        </div>

        {/* Location status */}
        {locSt !== 'ok' && (
          <div style={{
            position: 'absolute', top: 66, left: 14, right: 14, zIndex: 500,
            background: 'rgba(8,8,8,.95)', backdropFilter: 'blur(14px)',
            border: `1px solid ${locSt === 'error' ? 'rgba(239,68,68,.35)' : 'rgba(255,255,255,.13)'}`,
            borderRadius: 14, padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              {locSt === 'loading' ? <Spinner sz={13} /> : <span style={{ fontSize: 16 }}>⚠️</span>}
              <span style={{ fontSize: 12.5, color: locSt === 'error' ? RD : TS, fontWeight: 500 }}>{locMsg}</span>
            </div>
          </div>
        )}

        {/* Map controls */}
        <div style={{ position: 'absolute', right: 14, top: 66, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: <IcLoc />, action: recenter },
            { icon: '＋', action: () => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1); } },
            { icon: '－', action: () => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1); } },
          ].map((b, i) => (
            <button key={i} onClick={b.action} style={{
              background: 'rgba(8,8,8,.95)', border: '1px solid rgba(255,255,255,.13)',
              backdropFilter: 'blur(14px)', borderRadius: 50, width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: TX, fontSize: 20, fontWeight: 300,
              boxShadow: '0 2px 12px rgba(0,0,0,.6)', fontFamily: 'inherit',
            }}>{b.icon}</button>
          ))}
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        background: S1, borderRadius: '22px 22px 0 0',
        boxShadow: '0 -6px 40px rgba(0,0,0,.95)',
        flex: 1, overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: S3, borderRadius: 4, margin: '10px auto 0' }} />

        {/* Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 14px 0', scrollbarWidth: 'none' }}>
          {stations.length === 0
            ? [1, 2, 3].map(i => <div key={i} style={{ flexShrink: 0, width: 90, height: 30, background: S2, borderRadius: 50, border: `1px solid ${BD}` }} />)
            : stations.map(s => (
              <button key={s.id} onClick={() => clickChip(s)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 50, cursor: 'pointer',
                whiteSpace: 'nowrap', fontWeight: 700, fontSize: 11, transition: 'all .18s',
                border: `1px solid ${s.id === sel?.id ? GN : BD}`,
                background: s.id === sel?.id ? GN : S2,
                color: s.id === sel?.id ? '#fff' : TS,
                boxShadow: s.id === sel?.id ? `0 0 14px ${GG}` : 'none',
                fontFamily: 'inherit',
              }}>
                {s.av > 0 ? '⚡ ' : '○ '}{s.name.split(' ')[0]}
              </button>
            ))
          }
        </div>

        {/* Selected station detail */}
        {sel && (
          <div style={{ padding: '14px 16px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                <h2 style={{ margin: '0 0 5px', fontWeight: 800, fontSize: 19, color: TX, lineHeight: 1.2 }}>{sel.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IcCar s={13} />
                  <span style={{ color: GN, fontWeight: 700, fontSize: 13 }}>{sel.distStr || '~1 km'}</span>
                  <span style={{ color: TM, fontSize: 12 }}>· {sel.timeStr || '~3 min'} drive</span>
                </div>
              </div>
              <div style={{
                background: GD, border: '1px solid rgba(34,197,94,.2)', borderRadius: 9,
                padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: sel.av > 0 ? GN : RD,
                  boxShadow: `0 0 6px ${sel.av > 0 ? GN : RD}`,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: sel.av > 0 ? GN : RD }}>
                  {sel.av > 0 ? 'Open' : 'Full'}
                </span>
              </div>
            </div>

            <div style={{ height: 1, background: BD, marginBottom: 12 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ ...SMCARD }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <IcBolt s={11} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase' }}>Chargers</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: TX, lineHeight: 1 }}>
                  {sel.av}<span style={{ fontWeight: 400, color: TM, fontSize: 12 }}>/{sel.tot} free</span>
                </div>
                <div style={{ fontSize: 11, color: TS, marginTop: 4, lineHeight: 1.4 }}>{sel.types}</div>
              </div>
              <div style={{ ...SMCARD }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <IcRup s={13} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase' }}>Price</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: TX, lineHeight: 1 }}>
                  ₹{sel.price}<span style={{ fontWeight: 400, color: TM, fontSize: 11 }}>/kWh</span>
                </div>
                <div style={{ fontSize: 11, color: GN, fontWeight: 600, marginTop: 4 }}>≈ ₹{sessPrice(sel.price)}/session</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <button onClick={openNav} style={{
                background: S2, color: TX, border: `1px solid ${BM}`,
                borderRadius: 14, padding: '14px 8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IcNav c={TX} s={14} /> Navigate
              </button>
              <button className="press" onClick={() => setShowPay(true)} style={{
                background: GN, color: '#fff', border: 'none',
                borderRadius: 14, padding: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, fontSize: 15, fontWeight: 900, cursor: 'pointer',
                boxShadow: '0 0 28px rgba(34,197,94,.55)',
                animation: 'glow 3s ease infinite', fontFamily: 'inherit',
              }}>
                <img src={upiLogo} alt="UPI" style={{ height: 22, objectFit: 'contain' }} /> Pay ₹{sessPrice(sel.price)} via UPI
              </button>
            </div>
          </div>
        )}
      </div>

      {showPay && sel && (
        <PayModal
          station={sel} user={user} token={token}
          onClose={() => setShowPay(false)}
          onPaid={h => { if (onHistAdd) onHistAdd(h); }}
        />
      )}
    </div>
  );
}
