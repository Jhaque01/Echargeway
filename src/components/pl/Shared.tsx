import React from 'react';
import { GN, S2, BD, TS, TX, GD, GG, RD, RM } from '@/lib/powerloop';

export const Spinner = ({ sz = 22, col }: { sz?: number; col?: string }) => (
  <div style={{
    width: sz, height: sz, borderRadius: '50%',
    border: `3px solid ${col || GN}`, borderTopColor: 'transparent',
    animation: 'spin .75s linear infinite', flexShrink: 0,
  }} />
);

export const Avatar = ({ name, img, size = 38, onClick }: { name?: string; img?: string | null; size?: number; onClick?: () => void }) => {
  const letter = (name || '?')[0].toUpperCase();
  const common: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    border: '2.5px solid rgba(34,197,94,.4)',
    cursor: onClick ? 'pointer' : 'default', outline: 'none', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  };
  if (img) return (
    <button onClick={onClick} style={{ ...common, overflow: 'hidden', background: '#111' }}>
      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
    </button>
  );
  return (
    <button onClick={onClick} style={{
      ...common, background: `linear-gradient(135deg,${GN},#16A34A)`,
      fontWeight: 900, fontSize: Math.round(size * .42), color: '#fff',
      boxShadow: `0 0 16px ${GG}`,
    }}>
      {letter}
    </button>
  );
};

export const CloseBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    background: S2, border: `1px solid ${BD}`, borderRadius: 50,
    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  }}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={TS} strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
);

export const DInput = ({ ph, value, onChange, type = 'text', disabled, icon, autoFocus }: {
  ph: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; disabled?: boolean; icon?: React.ReactNode; autoFocus?: boolean;
}) => (
  <div style={{ position: 'relative', marginBottom: 11 }}>
    {icon && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>{icon}</span>}
    <input placeholder={ph} type={type} value={value} onChange={onChange}
      disabled={disabled} autoFocus={autoFocus}
      style={{
        width: '100%', padding: `12px 14px 12px ${icon ? 40 : 14}px`,
        background: disabled ? S2 : '#222', border: `1.5px solid ${disabled ? BD : 'rgba(255,255,255,.13)'}`,
        borderRadius: 12, fontSize: 14, color: disabled ? TS : TX,
        outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
        fontFamily: 'inherit',
      }} />
  </div>
);

export const ErrBanner = ({ msg }: { msg: string }) => {
  if (!msg) return null;
  return (
    <div style={{
      background: RM, border: '1px solid rgba(239,68,68,.28)', borderRadius: 11,
      padding: '10px 14px', color: RD, fontSize: 13, fontWeight: 600, marginTop: 10,
    }}>{msg}</div>
  );
};

export const TabRow = ({ tabs, active, onChange }: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string; onChange: (id: string) => void;
}) => (
  <div style={{
    display: 'grid', gridTemplateColumns: tabs.map(() => '1fr').join(' '),
    background: S2, borderRadius: 13, padding: 3, marginBottom: 18, border: `1px solid ${BD}`,
  }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{
        padding: '10px 4px', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 13,
        cursor: 'pointer', background: active === t.id ? GN : 'transparent',
        color: active === t.id ? '#fff' : TS, transition: 'all .2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        fontFamily: 'inherit',
      }}>
        {t.icon}{t.label}
      </button>
    ))}
  </div>
);

// Icons
export const IcBolt = ({ s = 20, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M13 2L4.09 12.96a.5.5 0 00.41.78H11l-1 8.22 8.91-10.96a.5.5 0 00-.41-.78H13z" />
  </svg>
);

export const IcPin = ({ s = 20, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export const IcNav = ({ s = 17, c = '#fff' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
);

export const IcUser = ({ s = 15, c = '#fff' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

export const IcPhone = ({ s = 15, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.77 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l.91-.91a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 17z" />
  </svg>
);

export const IcMail = ({ s = 15, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

export const IcCar = ({ s = 14, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export const IcRup = ({ s = 13, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="18" y2="3" /><line x1="6" y1="8" x2="18" y2="8" />
    <line x1="15" y1="3" x2="9" y2="21" /><line x1="6" y1="13" x2="13" y2="13" />
  </svg>
);

export const IcEdit = ({ s = 15, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IcOk = ({ s = 16, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IcOut = ({ s = 16, c = RD }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IcHist = ({ s = 16, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IcSet = ({ s = 16, c = TS }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const IcLoc = ({ s = 19, c = TX }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" />
  </svg>
);

export const IcSta = ({ s = 20, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <path d="M18 12h2a2 2 0 012 2v3a2 2 0 01-2 2h-2" />
  </svg>
);

export const IcPeo = ({ s = 20, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export const IcCity = ({ s = 20, c = GN }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const GoogleG = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
