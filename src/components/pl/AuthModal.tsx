import React, { useEffect } from 'react';
import { GN, TX, TM } from '@/lib/powerloop';
import { CloseBtn, ErrBanner } from '@/components/pl/Shared';
import { useAuthModal } from './useAuthModal';
import { ChooseAuth } from './auth/ChooseAuth';
import { EmailAuth } from './auth/EmailAuth';
import { PhoneAuth } from './auth/PhoneAuth';
import { OtpAuth } from './auth/OtpAuth';
import { RegisterAuth } from './auth/RegisterAuth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any, session: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const auth = useAuthModal(onSuccess);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

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

        {auth.step === 'choose' && (
          <ChooseAuth
            loading={auth.loading}
            handleGoogleSignIn={auth.handleGoogleSignIn}
            setAuthMethod={auth.setAuthMethod}
            setStep={auth.setStep}
            setErr={auth.setErr}
          />
        )}

        {auth.step === 'email' && (
          <EmailAuth
            email={auth.email}
            setEmail={auth.setEmail}
            loading={auth.loading}
            sendOtp={auth.sendOtp}
            setStep={auth.setStep}
            setErr={auth.setErr}
            lbl={lbl}
          />
        )}

        {auth.step === 'phone' && (
          <PhoneAuth
            phone={auth.phone}
            setPhone={auth.setPhone}
            loading={auth.loading}
            sendOtp={auth.sendOtp}
            setStep={auth.setStep}
            setErr={auth.setErr}
            lbl={lbl}
          />
        )}

        {auth.step === 'otp' && (
          <OtpAuth
            authMethod={auth.authMethod}
            email={auth.email}
            phone={auth.phone}
            digits={auth.digits}
            shake={auth.shake}
            loading={auth.loading}
            countdown={auth.countdown}
            boxRefs={auth.boxRefs}
            onDigitChange={auth.onDigitChange}
            onDigitKey={auth.onDigitKey}
            onDigitPaste={auth.onDigitPaste}
            verifyOtp={auth.verifyOtp}
            sendOtp={auth.sendOtp}
            setStep={auth.setStep}
            setDigits={auth.setDigits}
            setErr={auth.setErr}
            setCntdn={auth.setCntdn}
          />
        )}

        {auth.step === 'register' && (
          <RegisterAuth
            name={auth.name}
            setName={auth.setName}
            loading={auth.loading}
            doRegister={auth.doRegister}
            lbl={lbl}
          />
        )}

        <ErrBanner msg={auth.err} />
      </div>
    </div>
  );
}
