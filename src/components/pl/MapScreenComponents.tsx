import React from 'react';
import {
  Station, sessPrice,
  GN, TX, TS, TM, RD, S1, S2, S3, BD, BM, GG, GD, SMCARD
} from '@/lib/powerloop';
import { Avatar, Spinner, IcBolt, IcCar, IcNav, IcRup, IcLoc } from '@/components/pl/Shared';
import upiLogo from '@/assets/upi-official.jpeg';

export const MapTopBar = ({ onBack, user }: { onBack: () => void; user: any }) => (
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
);

export const MapLocationStatus = ({ locSt, locMsg }: { locSt: 'loading' | 'ok' | 'error'; locMsg: string }) => (
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
);

export const MapControls = ({ recenter, zoomIn, zoomOut }: { recenter: () => void; zoomIn: () => void; zoomOut: () => void }) => (
  <div style={{ position: 'absolute', right: 14, top: 66, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[
      { icon: <IcLoc />, action: recenter },
      { icon: '＋', action: zoomIn },
      { icon: '－', action: zoomOut },
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
);

export const StationPanel = ({
  stations, sel, clickChip, openNav, setShowPay
}: {
  stations: Station[];
  sel: Station | null;
  clickChip: (s: Station) => void;
  openNav: () => void;
  setShowPay: (v: boolean) => void;
}) => (
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
);
