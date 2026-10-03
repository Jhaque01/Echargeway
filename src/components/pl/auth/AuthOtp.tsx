import React from 'react';
import { Spinner } from '@/components/pl/Shared';
import { GN, GG, S3, GD, TX, TS, TM, BD } from '@/lib/powerloop';

interface AuthOtpProps {
  authMethod: 'email' | 'phone';
  email: string;
  phone: string;
  shake: boolean;
  digits: string[];
  boxRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onDigitChange: (i: number, v: string) => void;
  onDigitKey: (i: number, e: React.KeyboardEvent) => void;
  onDigitPaste: (e: React.ClipboardEvent) => void;
  loading: boolean;
  verifyOtp: () => void;
  countdown: number;
  sendOtp: (r: boolean) => void;
  setStep: (s: 'choose' | 'email' | 'phone' | 'otp' | 'register') => void;
  setDigits: (d: string[]) => void;
  setErr: (e: string) => void;
  setCntdn: (c: number) => void;
}

export const AuthOtp: React.FC<AuthOtpProps> = ({
  authMethod,
  email,
  phone,
  shake,
  digits,
  boxRefs,
  onDigitChange,
  onDigitKey,
  onDigitPaste,
  loading,
  verifyOtp,
  countdown,
  sendOtp,
  setStep,
  setDigits,
  setErr,
  setCntdn,
}) => {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: TX, marginBottom: 5 }}>Enter the 6-digit OTP</div>
        <div style={{ fontSize: 13, color: TS }}>Sent to <span style={{ color: GN, fontWeight: 700 }}>{authMethod === 'email' ? email : `+91 ${phone}`}</span></div>
        <div style={{
          background: GD, border: '1px solid rgba(34,197,94,.2)', borderRadius: 9,
          padding: '7px 12px', marginTop: 10, color: GN, fontSize: 12, fontWeight: 700,
        }}>
          {authMethod === 'email' ? '📧 Check your email inbox for the OTP code' : '📱 Check your SMS for the OTP code'}
        </div>
      </div>

      <div className={shake ? 'shake' : ''} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {digits.map((d: string, i: number) => (
          <input key={i} ref={el => { boxRefs.current[i] = el; }}
            style={{
              width: 44, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 800,
              borderRadius: 13, border: `2px solid ${d ? 'rgba(34,197,94,.45)' : 'rgba(255,255,255,.12)'}`,
              background: '#222', color: TX, outline: 'none',
              transition: 'border-color .15s, box-shadow .15s', caretColor: 'transparent',
              fontFamily: 'inherit',
            }}
            type="tel" inputMode="numeric" maxLength={1} value={d}
            onChange={e => onDigitChange(i, e.target.value)}
            onKeyDown={e => onDigitKey(i, e)}
            onPaste={i === 0 ? onDigitPaste : undefined}
            disabled={loading}
          />
        ))}
      </div>

      <button className="press" onClick={() => verifyOtp()} disabled={loading || digits.some((d: string) => !d)} style={{
        width: '100%', padding: '14px',
        background: digits.every((d: string) => d) ? GN : S3,
        color: digits.every((d: string) => d) ? '#fff' : TM,
        border: 'none', borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
        transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: digits.every((d: string) => d) ? `0 0 22px ${GG}` : 'none', fontFamily: 'inherit',
      }}>
        {loading ? <><Spinner sz={20} col="#fff" />Verifying…</> : 'Verify OTP →'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        {countdown > 0
          ? <span style={{ fontSize: 13, color: TM }}>Resend OTP in <b style={{ color: GN }}>0:{String(countdown).padStart(2, '0')}</b></span>
          : <button onClick={() => sendOtp(true)} disabled={loading} style={{
            background: 'transparent', border: 'none', color: GN, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'inherit',
          }}>Resend OTP</button>
        }
      </div>

      <button onClick={() => { setStep(authMethod === 'email' ? 'email' : 'phone'); setDigits(Array(6).fill('')); setErr(''); setCntdn(0); }} style={{
        width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
        border: `1px solid ${BD}`, color: TS, borderRadius: 11, fontWeight: 600, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>← Change {authMethod === 'email' ? 'Email' : 'Phone'}</button>
    </>
  );
};
