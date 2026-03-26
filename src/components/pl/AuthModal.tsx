import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GN, GG, S2, S3, BD, TX, TS, TM, GD } from '@/lib/powerloop';
import { Spinner, CloseBtn, DInput, ErrBanner, IcUser, IcMail, IcOk } from '@/components/pl/Shared';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any, session: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'choose' | 'email' | 'phone' | 'otp' | 'register'>('choose');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [countdown, setCntdn] = useState(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
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
    setLoading(true); setErr('');
    try {
      if (authMethod === 'email') {
        const em = email.trim().toLowerCase();
        if (!em) { setErr('Please enter your email address'); setLoading(false); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErr('Enter a valid email address'); setLoading(false); return; }
        const { error } = await supabase.auth.signInWithOtp({
          email: em,
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
      } else {
        const ph = phone.trim();
        if (!ph || ph.length < 10) { setErr('Enter a valid phone number with country code'); setLoading(false); return; }
        const formattedPhone = ph.startsWith('+') ? ph : `+91${ph}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) throw error;
      }
      setStep('otp');
      setCntdn(60);
      setDigits(Array(6).fill(''));
      setTimeout(() => { boxRefs.current[0]?.focus(); }, 120);
    } catch (e: any) { setErr(e.message || 'Failed to send OTP'); }
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
      const otpPayload = authMethod === 'email'
        ? { email: email.trim().toLowerCase(), token: code || digits.join(''), type: 'email' as const }
        : { phone: (phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`), token: code || digits.join(''), type: 'sms' as const };
      const { data, error } = await supabase.auth.verifyOtp(otpPayload);
      if (error) throw error;
      if (data.session && data.user) {
        // Check if profile has a name set
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile && profile.name) {
          // Existing user with profile
          onSuccess(profile, data.session);
        } else {
          // New user — need to set name
          setIsNewUser(true);
          setStep('register');
        }
      }
    } catch (e: any) {
      setErr(e.message || 'Invalid OTP — please try again');
      setShake(true); setDigits(Array(6).fill(''));
      setTimeout(() => { setShake(false); boxRefs.current[0]?.focus(); }, 400);
    }
    setLoading(false);
  };

  const doRegister = async () => {
    if (!name.trim()) { setErr('Your name is required'); return; }
    setLoading(true); setErr('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile with name
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), email: email.trim().toLowerCase() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;

      // Update user metadata
      await supabase.auth.updateUser({ data: { name: name.trim() } });

      const { data: { session } } = await supabase.auth.getSession();
      onSuccess(profile, session);
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
          <span style={{ fontWeight: 900, fontSize: 22, color: TX }}>e<span style={{ color: GN }}>Charge</span>Way</span>
          <CloseBtn onClick={onClose} />
        </div>

        {step === 'email' && (
          <>
            <p style={{ color: TS, fontSize: 13.5, lineHeight: 1.7, marginBottom: 16 }}>
              Enter your email address. We'll send a 6-digit OTP — no password needed.
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
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: TX, marginBottom: 5 }}>Enter the 6-digit OTP</div>
              <div style={{ fontSize: 13, color: TS }}>Sent to <span style={{ color: GN, fontWeight: 700 }}>{email}</span></div>
              <div style={{
                background: GD, border: '1px solid rgba(34,197,94,.2)', borderRadius: 9,
                padding: '7px 12px', marginTop: 10, color: GN, fontSize: 12, fontWeight: 700,
              }}>
                📧 Check your email inbox for the OTP code
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

            <button onClick={() => { setStep('email'); setDigits(Array(6).fill('')); setErr(''); setCntdn(0); }} style={{
              width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
              border: `1px solid ${BD}`, color: TS, borderRadius: 11, fontWeight: 600, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>← Change Email</button>
          </>
        )}

        {step === 'register' && (
          <>
            <div style={{
              background: GD, border: '1px solid rgba(34,197,94,.25)', borderRadius: 12,
              padding: '11px 14px', color: GN, fontSize: 13, fontWeight: 700, marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <IcOk s={16} />Email verified! Set up your profile.
            </div>
            {lbl('Your Name *')}
            <DInput ph="Full Name" value={name} onChange={e => setName(e.target.value)} icon={<IcUser />} autoFocus />
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
    </div>
  );
}
