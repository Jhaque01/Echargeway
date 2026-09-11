import React from 'react';
import { Spinner, GoogleG, IcMail } from '@/components/pl/Shared';
import { GN, S2, TX, BD, TM, TS } from '@/lib/powerloop';

interface ChooseAuthProps {
  loading: boolean;
  handleGoogleSignIn: () => void;
  setAuthMethod: (method: 'email' | 'phone') => void;
  setStep: (step: 'choose' | 'email' | 'phone' | 'otp' | 'register') => void;
  setErr: (err: string) => void;
}

export const ChooseAuth: React.FC<ChooseAuthProps> = ({
  loading,
  handleGoogleSignIn,
  setAuthMethod,
  setStep,
  setErr,
}) => {
  const methodBtn = (label: string, icon: React.ReactNode, onClick: () => void) => (
    <button className="press" onClick={onClick} style={{
      width: '100%', padding: '15px', background: S2, color: TX, border: `1.5px solid ${BD}`,
      borderRadius: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit',
    }}>
      {icon} {label}
    </button>
  );

  return (
    <>
      <p className="text-center" style={{ color: TS, fontSize: 13.5, lineHeight: 1.7, marginBottom: 18 }}>
        Sign in or create an account
      </p>

      {/* Google Sign-In */}
      <button className="press" onClick={handleGoogleSignIn} disabled={loading} style={{
        width: '100%', padding: '15px', background: '#fff', color: '#222', border: 'none',
        borderRadius: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit',
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? <Spinner sz={18} col="#222" /> : <GoogleG s={20} />} Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: BD }} />
        <span style={{ fontSize: 11, color: TM, fontWeight: 600 }}>or</span>
        <div style={{ flex: 1, height: 1, background: BD }} />
      </div>

      {methodBtn('Continue with Email', <IcMail />, () => { setAuthMethod('email'); setStep('email'); setErr(''); })}
      {methodBtn('Continue with Phone', <span></span>, () => { setAuthMethod('phone'); setStep('phone'); setErr(''); })}
    </>
  );
};
