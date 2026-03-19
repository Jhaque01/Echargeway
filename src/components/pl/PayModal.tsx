import React, { useState, useMemo, useEffect } from 'react';
import { callApi, sessPrice, makeQrUrl, makeDeepLink, GN, GG, GD, S1, S2, S3, BD, BM, TX, TS, TM, RD, RM, SMCARD, Station } from '@/lib/powerloop';
import { Spinner, CloseBtn, IcBolt, IcRup, IcOk } from '@/components/pl/Shared';

interface PayModalProps {
  station: Station;
  user: any;
  token: string;
  onClose: () => void;
  onPaid: (h: any) => void;
}

export default function PayModal({ station, user, token, onClose, onPaid }: PayModalProps) {
  const defAmt = String(sessPrice(station.price));
  const [amt, setAmt] = useState(defAmt);
  const [paid, setPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imgOk, setImgOk] = useState(true);
  const qrUrl = useMemo(() => makeQrUrl(amt || '0', station.name), [amt, station.name]);
  const deepLnk = useMemo(() => makeDeepLink(amt || '0', station.name), [amt, station.name]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // Auto-confirm on window focus
  useEffect(() => {
    if (paid) return;
    const handler = () => {
      // When user returns from UPI app, auto-confirm
    };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [paid]);

  const confirm = async () => {
    setSaving(true); setErr('');
    try {
      const h = await callApi('/history', 'POST', {
        station_name: station.name, amount: parseFloat(amt || '0'), kwh: 30,
      }, token);
      setPaid(true);
      onPaid(h);
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  if (paid) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.87)', backdropFilter: 'blur(10px)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: S1, border: '1px solid rgba(34,197,94,.3)', borderRadius: 26,
          padding: '36px 24px', maxWidth: 360, width: '100%', textAlign: 'center',
        }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%', background: GD,
            border: '3px solid ' + GN, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', boxShadow: '0 0 30px ' + GG,
          }}>
            <IcOk s={32} c={GN} />
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, color: TX, marginBottom: 6 }}>Payment Confirmed!</div>
          <div style={{ color: TS, fontSize: 14, marginBottom: 6 }}>₹{amt} charged at</div>
          <div style={{ color: GN, fontWeight: 700, fontSize: 15 }}>{station.name}</div>
          <button className="press" onClick={onClose} style={{
            width: '100%', marginTop: 24, padding: 14, background: GN, color: '#fff',
            border: 'none', borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Done ✓</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.87)', backdropFilter: 'blur(10px)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: S1, border: '1px solid ' + BM, borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 380, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', maxHeight: '94vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>
            💳 Pay via UPI
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={{ ...SMCARD, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: TX, marginBottom: 4 }}>{station.name}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span style={{ color: TS }}><IcBolt s={11} /> {station.types}</span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Amount (₹)</div>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: GN, fontWeight: 800, fontSize: 18 }}>₹</span>
          <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{
            width: '100%', padding: '14px 14px 14px 34px', background: S3, border: '1.5px solid ' + BM,
            borderRadius: 12, fontSize: 22, fontWeight: 800, color: TX, outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit',
          }} />
        </div>

        {/* QR */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 14,
            display: 'inline-block', marginBottom: 10,
          }}>
            {imgOk ? (
              <img src={qrUrl} alt="UPI QR" width={180} height={180}
                onError={() => setImgOk(false)}
                style={{ display: 'block', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>
                QR unavailable
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: TM }}>Scan with any UPI app</div>
        </div>

        {/* Quick pay buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <a href={deepLnk} target="_blank" rel="noopener noreferrer" className="press" style={{
            background: S2, border: '1px solid ' + BD, borderRadius: 12, padding: '12px',
            textAlign: 'center', textDecoration: 'none', color: TX, fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            📱 Open UPI App
          </a>
          <button className="press" onClick={confirm} disabled={saving || !amt} style={{
            background: GN, color: '#fff', border: 'none', borderRadius: 12, padding: '12px',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, fontFamily: 'inherit',
            boxShadow: '0 0 20px ' + GG, opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Spinner sz={16} col="#fff" /> : <IcOk s={14} c="#fff" />}
            I've Paid
          </button>
        </div>

        {err && <div style={{ background: RM, borderRadius: 10, padding: '10px', color: RD, fontSize: 13, fontWeight: 600 }}>{err}</div>}
      </div>
    </div>
  );
}
