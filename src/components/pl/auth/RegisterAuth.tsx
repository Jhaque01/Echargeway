import React from 'react';
import { Spinner, DInput, IcUser, IcOk } from '@/components/pl/Shared';
import { GN, GG, TX, TM, GD } from '@/lib/powerloop';

interface RegisterAuthProps {
  name: string;
  setName: (name: string) => void;
  loading: boolean;
  doRegister: () => void;
  lbl: (t: string) => React.ReactNode;
}

export const RegisterAuth: React.FC<RegisterAuthProps> = ({
  name,
  setName,
  loading,
  doRegister,
  lbl,
}) => {
  return (
    <>
      <div style={{
        background: GD, border: '1px solid rgba(34,197,94,.25)', borderRadius: 12,
        padding: '11px 14px', color: GN, fontSize: 13, fontWeight: 700, marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <IcOk s={16} />Verified! Set up your profile.
      </div>
      {lbl('Your Name *')}
      <DInput ph="Full Name" value={name} onChange={e => setName(e.target.value)} icon={<IcUser />} autoFocus />

      {/* Name initial preview */}
      {name.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: `linear-gradient(135deg,${GN},#16A34A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18, color: '#fff',
            boxShadow: `0 0 16px ${GG}`, border: '2.5px solid rgba(34,197,94,.4)',
          }}>
            {name.trim()[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: TX }}>{name.trim()}</div>
            <div style={{ fontSize: 11, color: TM }}>Your profile avatar</div>
          </div>
        </div>
      )}

      <button className="press" onClick={doRegister} disabled={loading} style={{
        width: '100%', padding: '14px', background: GN, color: '#fff', border: 'none',
        borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
        opacity: loading ? 0.7 : 1, boxShadow: loading ? 'none' : `0 0 22px ${GG}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit',
      }}>
        {loading ? <><Spinner sz={20} col="#fff" />Creating…</> : 'Create Account →'}
      </button>
    </>
  );
};
