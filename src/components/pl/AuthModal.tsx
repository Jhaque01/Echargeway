import React, { useState, useEffect, useRef } from 'react';
import { callApi, GN, GG, S2, S3, BD, TX, TS, TM, GD } from '@/lib/powerloop';
import { Spinner, CloseBtn, DInput, ErrBanner, IcPhone, IcUser, IcMail, IcOk, GoogleG } from '@/components/pl/Shared';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'phone' | 'google'>('phone');
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [countdown, setCntdn] = useState(0);
  const [vtoken, setVtoken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCntdn(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  const sendOtp = async (resend = false) => {
    const ph = phone.trim();
    if (!ph) { setErr('Please enter your mobile number'); return; }
    if (!/^[+]?[\d\s\-]{10,15}$/.test(ph)) { setErr('Enter a valid 10-digit mobile number'); return; }
    setLoading(true); setErr('');
    try {
      const d = await callApi('/auth/send-otp', 'POST', { phone: ph });
      if (d.dev_otp) {
        const arr = d.dev_otp.toString().split('').slice(0, 6);
        while (arr.length < 6) arr.push('');
        setDigits(arr);
      } else {
        setDigits(Array(6).fill(''));
      }
      setStep('otp');
      setCntdn(60);
      setTimeout(() => { if (d.dev_otp) return; boxRefs.current[0]?.focus(); }, 120);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  const onDigitChange = (i: number, val: string) => {
    const v = (val.replace(/\D/g, '') || '').slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next);
    if (v && i < 5) boxRefs.current[i + 1]?.focus();
    if (next.every((d: string) => d)) verifyOtp(next.join(''));
  };

  const onDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) { next[i] = ''; setDigits(next); }
      else if (i > 0) { next[i - 1] = ''; setDigits(next); boxRefs.current[i - 1]?.focus(); }
    }
    if (e.key === 'ArrowLeft' && i > 0) boxRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) boxRefs.current[i + 1]?.focus();
  };

  const onDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;
    const arr = Array(6).fill('').map((_, i) => txt[i] || '');
    setDigits(arr);
    if (arr.every(d => d)) verifyOtp(txt);
    else boxRefs.current[Math.min(txt.length, 5)]?.focus();
  };

  const verifyOtp = async (code?: string) => {
    setLoading(true); setErr('');
    try {
      const d = await callApi('/auth/verify-otp', 'POST', { phone: phone.trim(), otp: code || digits.join('') });
      if (d.status === 'LOGIN') {
        localStorage.setItem('pl_tok', JSON.stringify(d.token));
        localStorage.setItem('pl_usr', JSON.stringify(d.user));
        onSuccess(d.user, d.token);
      } else if (d.status === 'NEW_USER') {
        setVtoken(d.verify_token);
        setStep('register');
      }
    } catch (e: any) {
      setErr(e.message);
      setShake(true); setDigits(Array(6).fill(''));
      setTimeout(() => { setShake(false); boxRefs.current[0]?.focus(); }, 400);
    }
    setLoading(false);
  };

  const doRegister = async () => {
    if (!name.trim()) { setErr('Your name is required'); return; }
    setLoading(true); setErr('');
    try {
      const d = await callApi('/auth/register', 'POST', { verify_token: vtoken, name: name.trim(), email: email.trim() || undefined });
      localStorage.setItem('pl_tok', JSON.stringify(d.token));
      localStorage.setItem('pl_usr', JSON.stringify(d.user));
      onSuccess(d.user, d.token);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  const lbl = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t}</div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.87)',
      backdropFilter: 'blur(10px)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', border: '1px solid rgba(255,255,255,.13)', borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 370, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', maxHeight: '94vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 900, fontSize: 22, color: TX }}>Power<span style={{ color: GN }}>Loop</span></span>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Tab bar */}
        {step === 'phone' && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', background: S2, borderRadius: 13,
            padding: 3, marginBottom: 20, border: `1px solid ${BD}`,
          }}>
            <button onClick={() => { setTab('phone'); setErr(''); }} style={{
              padding: '10px', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', background: tab === 'phone' ? GN : 'transparent',
              color: tab === 'phone' ? '#fff' : TS, transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              <IcPhone s={14} c={tab === 'phone' ? '#fff' : TS} /> Mobile Number
            </button>
            <button onClick={() => { setTab('google'); setErr(''); }} style={{
              padding: '10px', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', background: tab === 'google' ? GN : 'transparent',
              color: tab === 'google' ? '#fff' : TS, transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit',
            }}>
              <GoogleG s={16} /> Google
            </button>
          </div>
        )}

        {/* Phone tab content */}
        {tab === 'phone' && (
          <div>
            {step === 'phone' && (
              <>
                <p style={{ color: TS, fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>
                  Enter your mobile number. We'll send a 6-digit OTP — no password needed.
                </p>
                <DInput ph="+91 Mobile Number" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)} icon={<IcPhone />} autoFocus />
                <button className="press" onClick={() => sendOtp(false)} disabled={loading} style={{
                  width: '100%', padding: '14px', background: GN, color: '#fff', border: 'none',
                  borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                  opacity: loading ? 0.7 : 1, marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: loading ? 'none' : `0 0 24px ${GG}`, fontFamily: 'inherit',
                }}>
                  {loading ? <><Spinner sz={20} col="#fff" />Send OTP…</> : 'Send OTP →'}
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: TX, marginBottom: 5 }}>Enter the 6-digit OTP</div>
                  <div style={{ fontSize: 13, color: TS }}>Sent to <span style={{ color: GN, fontWeight: 700 }}>{phone}</span></div>
                  <div style={{
                    background: GD, border: '1px solid rgba(34,197,94,.2)', borderRadius: 9,
                    padding: '7px 12px', marginTop: 10, color: GN, fontSize: 12, fontWeight: 700,
                  }}>
                    ✅ OTP auto-filled below — this app is in demo mode
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

                <button onClick={() => { setStep('phone'); setDigits(Array(6).fill('')); setErr(''); setCntdn(0); }} style={{
                  width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
                  border: `1px solid ${BD}`, color: TS, borderRadius: 11, fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>← Change Number</button>
              </>
            )}

            {step === 'register' && (
              <>
                <div style={{
                  background: GD, border: '1px solid rgba(34,197,94,.25)', borderRadius: 12,
                  padding: '11px 14px', color: GN, fontSize: 13, fontWeight: 700, marginBottom: 18,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <IcOk s={16} />Phone verified! Set up your account.
                </div>
                {lbl('Your Name *')}
                <DInput ph="Full Name" value={name} onChange={e => setName(e.target.value)} icon={<IcUser />} autoFocus />
                {lbl('Email (optional)')}
                <DInput ph="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<IcMail />} />
                <button className="press" onClick={doRegister} disabled={loading} style={{
                  width: '100%', padding: '14px', background: GN, color: '#fff', border: 'none',
                  borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                  opacity: loading ? 0.7 : 1, boxShadow: loading ? 'none' : `0 0 22px ${GG}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit',
                }}>
                  {loading ? <><Spinner sz={20} col="#fff" />Creating…</> : 'Create Account →'}
                </button>
              </>
            )}

            <ErrBanner msg={err} />
          </div>
        )}

        {/* Google tab */}
        {tab === 'google' && (
          <div>
            <p style={{ color: TS, fontSize: 13.5, marginBottom: 22, lineHeight: 1.7, textAlign: 'center' }}>
              Sign in instantly with your Google account.<br />No password, no OTP needed.
            </p>
            <div style={{
              background: S2, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14,
              padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: TX, marginBottom: 6 }}>Google Sign-In Unavailable</div>
              <div style={{ color: TM, fontSize: 12.5, lineHeight: 1.6, marginBottom: 14 }}>
                This app runs fully offline using your device's local storage.<br />
                Google Sign-In requires a backend server — please use <b style={{ color: GN }}>Mobile OTP</b> instead.
              </div>
              <button className="press" onClick={() => { setTab('phone'); setErr(''); }} style={{
                background: GN, color: '#fff', border: 'none', borderRadius: 11, padding: '11px 20px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'inherit',
              }}>
                <IcPhone s={15} c="#fff" /> Switch to Mobile OTP
              </button>
            </div>
            <ErrBanner msg={err} />
          </div>
        )}
      </div>
    </div>
  );
}
