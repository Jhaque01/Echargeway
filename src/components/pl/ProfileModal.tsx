import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fmtAge, UPI_ID, GN, GG, GD, S2, BD, TX, TS, TM, RD, RM, GBTN, DBTN } from '@/lib/powerloop';
import { Spinner, Avatar, CloseBtn, DInput, TabRow, IcUser, IcMail, IcPhone, IcEdit, IcOk, IcOut, IcHist, IcSet, IcBolt } from '@/components/pl/Shared';
import type { Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

interface ProfileModalProps {
  user: Tables<'profiles'>;
  session: Session | null;
  onClose: () => void;
  onUpdate: (user: Tables<'profiles'>) => void;
  onLogout: () => void;
}

function downloadReport(user: Tables<'profiles'>, hist: Tables<'charging_history'>[]) {
  const rows = hist.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>'
    : hist.map(h => `<tr><td>${new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${(h.amount || 0).toFixed(0)}</td><td style="text-align:right">${h.kwh || 0} kWh</td></tr>`).join('');
  const totalAmt = hist.reduce((s: number, h: Tables<'charging_history'>) => s + (h.amount || 0), 0);
  const totalKwh = hist.reduce((s: number, h: Tables<'charging_history'>) => s + (h.kwh || 0), 0);
  const totRow = hist.length > 0 ? `<tr class="tot"><td colspan="2"><b>Total (${hist.length} sessions)</b></td><td style="text-align:right"><b>₹${totalAmt.toFixed(0)}</b></td><td style="text-align:right"><b>${totalKwh} kWh</b></td></tr>` : '';
  const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>eChargeWay Charging Report</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;color:#222;padding:0 24px}.hd{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #22C55E;padding-bottom:14px;margin-bottom:22px}.brand{font-size:26px;font-weight:900}.brand b{color:#22C55E}table{width:100%;border-collapse:collapse}th{background:#22C55E;color:#fff;padding:10px 12px;text-align:left;font-size:13px}td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}.tot td{background:#f0fdf4;border-top:2px solid #22C55E}.foot{text-align:center;color:#aaa;font-size:11px;margin-top:36px}</style></head><body><div class="hd"><div class="brand">e<b>Charge</b>Way</div><div style="text-align:right;font-size:12px;color:#666"><b>Charging Report</b><br>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><h2>${user.name || 'User'}</h2><p>📧 ${user.email || '—'}</p><table><thead><tr><th>Date</th><th>Station</th><th style="text-align:right">Amount</th><th style="text-align:right">Energy</th></tr></thead><tbody>${rows}${totRow}</tbody></table><div class="foot">eChargeWay EV Charging · © ${new Date().getFullYear()}</div></body></html>`;
  const blob = new Blob([doc], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'eChargeWay_Report_' + (user.name || 'User').replace(/\s+/g, '_') + '.html';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 800);
}

export default function ProfileModal({ user, session, onClose, onUpdate, onLogout }: ProfileModalProps) {
  const [tab, setTab] = useState('profile');
  const [editing, setEd] = useState(false);
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  const [loading, setLd] = useState(false);
  const [err, setErr] = useState('');
  const [saved, setSaved] = useState(false);
  const [hist, setHist] = useState<Tables<'charging_history'>[] | null>(null);
  const [hloading, setHl] = useState(false);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  useEffect(() => {
    if (tab !== 'history' || hist !== null) return;
    setHl(true);
    const loadHistory = async () => {
      try {
        const { data } = await supabase
          .from('charging_history')
          .select('*')
          .order('created_at', { ascending: false });
        setHist(data || []);
      } catch {
        setHist([]);
      } finally {
        setHl(false);
      }
    };
    loadHistory();
  }, [tab, hist]);

  const save = async () => {
    setLd(true); setErr('');
    try {
      const b: Partial<Tables<'profiles'>> = {};
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
    } catch (e) { setErr(e instanceof Error ? e.message : 'An error occurred'); }
    setLd(false);
  };

  const cancel = () => { setEd(false); setErr(''); setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); };
  const lbl = (t: string) => <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t}</div>;
  const TABS = [
    { id: 'profile', label: 'Profile', icon: <IcUser s={13} c={tab === 'profile' ? '#fff' : TS} /> },
    { id: 'history', label: 'History', icon: <IcHist s={13} c={tab === 'history' ? '#fff' : TS} /> },
    { id: 'settings', label: 'Settings', icon: <IcSet s={13} c={tab === 'settings' ? '#fff' : TS} /> },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.87)', backdropFilter: 'blur(10px)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', border: '1px solid rgba(255,255,255,.13)', borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 400, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', maxHeight: '94vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user.name} img={user.avatar_url} size={50} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: TM, marginTop: 2 }}>Member since {new Date(user.created_at || Date.now()).getFullYear()}</div>
            </div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <TabRow tabs={TABS} active={tab} onChange={setTab} />

        {/* Profile */}
        {tab === 'profile' && (
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
        )}

        {/* History */}
        {tab === 'history' && (
          <div>
            {!hloading && hist && hist.length > 0 && (
              <button className="press" onClick={() => downloadReport(user, hist)} style={{
                width: '100%', padding: '12px 16px', background: GD, color: GN,
                border: '1px solid rgba(34,197,94,.3)', borderRadius: 13, fontWeight: 800,
                fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 9, marginBottom: 14, fontFamily: 'inherit',
                boxShadow: '0 0 16px rgba(34,197,94,.15)',
              }}>⬇ Download Charging Report</button>
            )}
            {hloading && <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner /></div>}
            {!hloading && hist !== null && hist.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ fontSize: 46, marginBottom: 14 }}>⚡</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: TX, marginBottom: 6 }}>No sessions yet</div>
                <div style={{ color: TM, fontSize: 13 }}>Your charging history will appear here after your first session.</div>
              </div>
            )}
            {!hloading && hist && hist.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hist.map((h: Tables<'charging_history'>, i: number) => (
                  <div key={h.id || i} style={{ background: S2, borderRadius: 14, padding: '13px 16px', border: `1px solid ${BD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: TX, flex: 1, marginRight: 8, lineHeight: 1.35 }}>{h.station_name}</div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: GN, whiteSpace: 'nowrap' }}>₹{(h.amount || 0).toFixed(0)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      {h.kwh && <span style={{ fontSize: 11, color: TS, background: '#222', padding: '2px 8px', borderRadius: 20 }}>{h.kwh} kWh</span>}
                      <span style={{ fontSize: 11, color: TM }}>{fmtAge(h.created_at)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: h.status === 'paid' ? GN : RD, background: h.status === 'paid' ? GD : RM, padding: '2px 9px', borderRadius: 20 }}>
                        {(h.status || 'paid').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ background: S2, borderRadius: 15, padding: 16, border: `1px solid ${BD}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Account</div>
              {[
                { label: 'Edit Profile', desc: 'Update name, email or phone', Icon: <IcEdit s={17} c={GN} />, action: () => setTab('profile') },
                { label: 'Charging History', desc: 'View past sessions', Icon: <IcHist s={17} c={GN} />, action: () => setTab('history') },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
                  borderRadius: 11, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', marginBottom: i === 0 ? 6 : 0, fontFamily: 'inherit',
                }}>
                  <div style={{ width: 36, height: 36, background: GD, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Icon}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: TX }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: TM }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ background: S2, borderRadius: 15, padding: 16, border: `1px solid ${BD}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>App Info</div>
              {[['Version', '1.0.0'], ['UPI Beneficiary', UPI_ID], ['Support', 'support@echargeway.in']].map(([k, v], i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: i < 2 ? `1px solid ${BD}` : 'none',
                }}>
                  <span style={{ fontSize: 13, color: TS }}>{k}</span>
                  <span style={{ fontSize: 12, color: TM, fontFamily: i === 1 ? 'monospace' : 'inherit', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <button className="press" onClick={onLogout} style={{
              width: '100%', padding: 15, background: RM, color: RD,
              border: '1px solid rgba(239,68,68,.25)', borderRadius: 15,
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginTop: 4, fontFamily: 'inherit',
            }}>
              <IcOut s={18} />Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
