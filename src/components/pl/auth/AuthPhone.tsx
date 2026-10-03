import React from 'react';
import { DInput, Spinner } from '@/components/pl/Shared';
import { GN, GG, S3, BD, TS } from '@/lib/powerloop';

interface AuthPhoneProps {
  phone: string;
  setPhone: (p: string) => void;
  sendOtp: (r: boolean) => void;
  loading: boolean;
  setStep: (s: 'choose' | 'email' | 'phone' | 'otp' | 'register') => void;
  setErr: (e: string) => void;
  lbl: (t: string) => React.ReactNode;
}

export const AuthPhone: React.FC<AuthPhoneProps> = ({
  phone,
  setPhone,
  sendOtp,
  loading,
  setStep,
  setErr,
  lbl,
}) => {
  return (
    <>
      <p style={{ color: TS, fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>
        Enter your mobile number. Works for both new and existing accounts.
      </p>
      {lbl('Phone Number')}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{
          background: S3, border: `1.5px solid ${BD}`, borderRadius: 12,
          padding: '12px', color: GN, fontWeight: 800, fontSize: 15, minWidth: 56, textAlign: 'center',
        }}>+91</div>
        <DInput ph="9876543210" type="tel" value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} autoFocus />
      </div>
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
