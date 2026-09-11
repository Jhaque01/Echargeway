import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsePaymentOptions {
  stationName: string;
  amt: string;
  tab: string;
  userUpiId: string;
  onPaid: (h: any) => void;
}

export function usePayment({ stationName, amt, tab, userUpiId, onPaid }: UsePaymentOptions) {
  const [paid, setPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const confirm = async () => {
    setSaving(true);
    setErr('');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Please sign in first');

      const insertData: any = {
        user_id: authUser.id,
        station_name: stationName,
        amount: parseFloat(amt || '0'),
        kwh: 30,
      };
      if (tab === 'upiid' && userUpiId.trim()) {
        insertData.upi_id = userUpiId.trim();
      }
      const { data: h, error } = await supabase
        .from('charging_history')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      setPaid(true);
      onPaid(h);
    } catch (e: any) {
      setErr(e.message);
    }
    setSaving(false);
  };

  return { paid, saving, err, confirm };
}
