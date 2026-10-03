import React from 'react';
import { UPI_ID, GN, GD, S2, BD, TX, TS, TM, RD, RM } from '@/lib/powerloop';
import { IcEdit, IcOut, IcHist } from '@/components/pl/Shared';

interface SettingsTabProps {
  onSetTab: (tab: string) => void;
  onLogout: () => void;
}

export default function SettingsTab({ onSetTab, onLogout }: SettingsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div style={{ background: S2, borderRadius: 15, padding: 16, border: `1px solid ${BD}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Account</div>
        {[
          { label: 'Edit Profile', desc: 'Update name, email or phone', Icon: <IcEdit s={17} c={GN} />, action: () => onSetTab('profile') },
          { label: 'Charging History', desc: 'View past sessions', Icon: <IcHist s={17} c={GN} />, action: () => onSetTab('history') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{
            width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
            borderRadius: 11, display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', marginBottom: i === 0 ? 6 : 0, fontFamily: 'inherit',
          }}>
            <div style={{ width: 36, height: 36, background: GD, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Icon}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: TX }}>{item.label}</div>
              <div style={{ fontSize: 11, color: TM }}>{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ background: S2, borderRadius: 15, padding: 16, border: `1px solid ${BD}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>App Info</div>
        {[['Version', '1.0.0'], ['UPI Beneficiary', UPI_ID], ['Support', 'support@echargeway.in']].map(([k, v], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: i < 2 ? `1px solid ${BD}` : 'none',
          }}>
            <span style={{ fontSize: 13, color: TS }}>{k}</span>
            <span style={{ fontSize: 12, color: TM, fontFamily: i === 1 ? 'monospace' : 'inherit', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <button className="press" onClick={onLogout} style={{
        width: '100%', padding: 15, background: RM, color: RD,
        border: '1px solid rgba(239,68,68,.25)', borderRadius: 15,
        fontWeight: 700, fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginTop: 4, fontFamily: 'inherit',
      }}>
        <IcOut s={18} />Log Out
      </button>
    </div>
  );
}
