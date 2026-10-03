import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Station, sortedStations, requestGeo, BLR,
  TX, TS, RD
} from '@/lib/powerloop';
import { Spinner } from '@/components/pl/Shared';
import PayModal from '@/components/pl/PayModal';
import { MapTopBar, MapLocationStatus, MapControls, StationPanel } from './MapScreenComponents';

interface MapScreenProps {
  onBack: () => void;
  user: any;
  token: string;
  onHistAdd?: (h: any) => void;
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
    Object.values(mkRef.current).forEach(m => { try { m.remove(); } catch {} });
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
        map.panTo([s.lat, s.lng], { animate: true, duration: 0.4 } as any);
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
          if (uMkRef.current) try { uMkRef.current.remove(); } catch {}
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
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
  }, [redrawMarkers]);

  const clickChip = (s: Station) => {
    setSel(s);
    redrawMarkers(stations, s);
    if (mapRef.current) mapRef.current.panTo([s.lat, s.lng], { animate: true, duration: 0.4 } as any);
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

        <MapTopBar onBack={onBack} user={user} />

        {locSt !== 'ok' && <MapLocationStatus locSt={locSt} locMsg={locMsg} />}

        <MapControls
          recenter={recenter}
          zoomIn={() => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1); }}
          zoomOut={() => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1); }}
        />
      </div>

      <StationPanel
        stations={stations}
        sel={sel}
        clickChip={clickChip}
        openNav={openNav}
        setShowPay={setShowPay}
      />

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
