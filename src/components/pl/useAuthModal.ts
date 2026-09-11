import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

export function useAuthModal(onSuccess: (user: any, session: any) => void) {
  const [step, setStep] = useState<'choose' | 'email' | 'phone' | 'otp' | 'register'>('choose');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
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

  const handleGoogleSignIn = async () => {
    setLoading(true); setErr('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (e: any) {
      setErr(e.message || 'Google sign-in failed');
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
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  return {
    step, setStep,
    authMethod, setAuthMethod,
    email, setEmail,
    phone, setPhone,
    digits, setDigits,
    countdown, setCntdn,
    name, setName,
    loading, setLoading,
    err, setErr,
    shake, setShake,
    boxRefs,
    handleGoogleSignIn,
    sendOtp,
    onDigitChange,
    onDigitKey,
    onDigitPaste,
    verifyOtp,
    doRegister,
  };
}
