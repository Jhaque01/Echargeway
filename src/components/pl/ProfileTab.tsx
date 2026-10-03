import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GN, GD, RM, RD, TM, TS, GBTN, DBTN } from '@/lib/powerloop';
import { Spinner, DInput, IcUser, IcMail, IcPhone, IcEdit, IcOk } from '@/components/pl/Shared';

interface ProfileTabProps {
  user: any;
  onUpdate: (user: any) => void;
  onClose: () => void;
}

export default function ProfileTab({ user, onUpdate, onClose }: ProfileTabProps) {
  const [editing, setEd] = useState(false);
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  const [loading, setLd] = useState(false);
  const [err, setErr] = useState('');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setLd(true); setErr('');
    try {
      const b: any = {};
      if (form.name !== (user.name || '')) b.name = form.name;
      if (form.email !== (user.email || '')) b.email = form.email;
      if (form.phone !== (user.phone || '')) b.phone = form.phone;
      if (!Object.keys(b).length) { setEd(false); setLd(false); return; }

      const { data, error } = await supabase
        .from('profiles')
        .update(b)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      onUpdate(data); setSaved(true);
      setTimeout(() => { setSaved(false); setEd(false); }, 1500);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr('An unknown error occurred');
      }
    }
    setLd(false);
  };

  const cancel = () => { setEd(false); setErr(''); setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); };
  const lbl = (t: string) => <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t}</div>;

  return (
    <div>
      <div style={{ width: 38, height: 3, background: GN, borderRadius: 2, marginBottom: 18 }} />
      {lbl('Full Name')}
      <DInput ph="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} icon={<IcUser s={15} c={TS} />} />
      {lbl('Email')}
      <DInput ph="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!editing} icon={<IcMail />} />
      {lbl('Phone')}
      <DInput ph="Phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} icon={<IcPhone />} />

      {err && <div style={{ background: RM, border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '10px 13px', color: RD, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{err}</div>}
      {saved && <div style={{ background: GD, border: '1px solid rgba(34,197,94,.25)', borderRadius: 10, padding: '10px 13px', color: GN, fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><IcOk />Profile updated!</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {!editing
          ? <>
            <button onClick={() => setEd(true)} style={{ ...GBTN, fontFamily: 'inherit' }}><IcEdit s={14} c="#fff" />Edit</button>
            <button onClick={onClose} style={{ ...DBTN, fontFamily: 'inherit' }}>Close</button>
          </>
          : <>
            <button onClick={save} disabled={loading} style={{ ...GBTN, opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? <Spinner sz={18} col="#fff" /> : <><IcOk s={15} c="#fff" />Save</>}
            </button>
            <button onClick={cancel} style={{ ...DBTN, fontFamily: 'inherit' }}>Cancel</button>
          </>
        }
      </div>
    </div>
  );
}
