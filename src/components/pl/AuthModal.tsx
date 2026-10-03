import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { GN, GG, S2, S3, BD, TX, TS, TM, GD } from '@/lib/powerloop';
import { Spinner, CloseBtn, DInput, ErrBanner, IcUser, IcMail, IcOk, GoogleG } from '@/components/pl/Shared';
import { AuthChoose } from './auth/AuthChoose';
import { AuthEmail } from './auth/AuthEmail';
import { AuthPhone } from './auth/AuthPhone';
import { AuthOtp } from './auth/AuthOtp';
import { AuthRegister } from './auth/AuthRegister';

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

  const handleGoogleSignIn = async () => {
    setLoading(true); setErr('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Google sign-in failed');
    }
    setLoading(false);
  };

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
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Failed to send OTP'); }
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile && profile.name) {
          onSuccess(profile, data.session);
        } else {
          setStep('register');
        }
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Invalid OTP — please try again');
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

      const updateData: any = { name: name.trim() };
      if (authMethod === 'email') updateData.email = email.trim().toLowerCase();
      if (authMethod === 'phone') updateData.phone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;

      await supabase.auth.updateUser({ data: { name: name.trim() } });

      const { data: { session } } = await supabase.auth.getSession();
      onSuccess(profile, session);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Unknown error'); }
    setLoading(false);
  };

  const lbl = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t}</div>
  );

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

        {step === 'choose' && (
          <AuthChoose
            handleGoogleSignIn={handleGoogleSignIn}
            loading={loading}
            setAuthMethod={setAuthMethod}
            setStep={setStep}
            setErr={setErr}
            methodBtn={methodBtn}
          />
        )}

        {step === 'email' && (
          <AuthEmail
            email={email}
            setEmail={setEmail}
            sendOtp={sendOtp}
            loading={loading}
            setStep={setStep}
            setErr={setErr}
            lbl={lbl}
          />
        )}

        {step === 'phone' && (
          <AuthPhone
            phone={phone}
            setPhone={setPhone}
            sendOtp={sendOtp}
            loading={loading}
            setStep={setStep}
            setErr={setErr}
            lbl={lbl}
          />
        )}

        {step === 'otp' && (
          <AuthOtp
            authMethod={authMethod}
            email={email}
            phone={phone}
            shake={shake}
            digits={digits}
            boxRefs={boxRefs}
            onDigitChange={onDigitChange}
            onDigitKey={onDigitKey}
            onDigitPaste={onDigitPaste}
            loading={loading}
            verifyOtp={verifyOtp}
            countdown={countdown}
            sendOtp={sendOtp}
            setStep={setStep}
            setDigits={setDigits}
            setErr={setErr}
            setCntdn={setCntdn}
          />
        )}

        {step === 'register' && (
          <AuthRegister
            name={name}
            setName={setName}
            doRegister={doRegister}
            loading={loading}
            lbl={lbl}
          />
        )}

        <ErrBanner msg={err} />
      </div>
    </div>
  );
}
