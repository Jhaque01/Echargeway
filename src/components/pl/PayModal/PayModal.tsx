import React, { useState, useEffect } from 'react';
import { sessPrice, Station } from '@/lib/powerloop';
import PaymentForm from './PaymentForm';
import PaymentConfirmed from './PaymentConfirmed';

interface PayModalProps {
  station: Station;
  user: any;
  token: string;
  onClose: () => void;
  onPaid: (h: any) => void;
}

export default function PayModal({ station, onClose, onPaid }: PayModalProps) {
  const defAmt = String(sessPrice(station.price));
  const [amt, setAmt] = useState(defAmt);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  if (paid) {
    return (
      <PaymentConfirmed
        amt={amt}
        station={station}
        onClose={onClose}
      />
    );
  }

  return (
    <PaymentForm
      station={station}
      amt={amt}
      setAmt={setAmt}
      onClose={onClose}
      onPaid={onPaid}
      setPaid={setPaid}
    />
  );
}
