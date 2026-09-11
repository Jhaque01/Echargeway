import React from 'react';
import { Spinner, DInput, IcMail } from '@/components/pl/Shared';
import { GN, GG, BD, TM, TS } from '@/lib/powerloop';

interface EmailAuthProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  sendOtp: (resend: boolean) => void;
  setStep: (step: 'choose' | 'email' | 'phone' | 'otp' | 'register') => void;
  setErr: (err: string) => void;
  lbl: (t: string) => React.ReactNode;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  email,
  setEmail,
  loading,
  sendOtp,
  setStep,
  setErr,
  lbl,
}) => {
  return (
    <>
      <p style={{ color: TS, fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>
        Enter your email. We'll send a 6-digit OTP — works for both new and existing accounts.
      </p>
      {lbl('Email Address')}
      <DInput ph="you@email.com" type="email" value={email}
        onChange={e => setEmail(e.target.value)} icon={<IcMail />} autoFocus />
      <button className="press" onClick={() => sendOtp(false)} disabled={loading} style={{
        width: '100%', padding: '14px', background: GN, color: '#fff', border: 'none',
        borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
        opacity: loading ? 0.7 : 1, marginTop: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: loading ? 'none' : `0 0 24px ${GG}`, fontFamily: 'inherit',
      }}>
        {loading ? <><Spinner sz={20} col="#fff" />Sending OTP…</> : 'Send OTP →'}
      </button>
      <button onClick={() => { setStep('choose'); setErr(''); }} style={{
        width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
        border: `1px solid ${BD}`, color: TS, borderRadius: 11, fontWeight: 600, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>← Back</button>
    </>
  );
};
