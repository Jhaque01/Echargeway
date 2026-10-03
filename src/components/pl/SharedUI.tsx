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
