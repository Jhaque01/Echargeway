import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { callApi, sessPrice, makeQrUrl, makeDeepLink, UPI_ID, GN, GG, GD, S1, S2, S3, BD, BM, TX, TS, TM, RD, RM, SMCARD, Station } from '@/lib/powerloop';
import { Spinner, CloseBtn, IcBolt, IcRup, IcOk } from '@/components/pl/Shared';

interface PayModalProps {
  station: Station;
  user: any;
  token: string;
  onClose: () => void;
  onPaid: (h: any) => void;
}

type PayTab = 'qr' | 'upiid' | 'app';

export default function PayModal({ station, user, token, onClose, onPaid }: PayModalProps) {
  const defAmt = String(sessPrice(station.price));
  const [amt, setAmt] = useState(defAmt);
  const [paid, setPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imgOk, setImgOk] = useState(true);
  const [tab, setTab] = useState<PayTab>('qr');
  const [copied, setCopied] = useState(false);
  const qrUrl = useMemo(() => makeQrUrl(amt || '0', station.name), [amt, station.name]);
  const deepLnk = useMemo(() => makeDeepLink(amt || '0', station.name), [amt, station.name]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

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
    return ReactDOM.createPortal(
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: '#080808',
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

  const tabs: { id: PayTab; label: string; icon: string }[] = [
    { id: 'qr', label: 'Scan QR', icon: '📷' },
    { id: 'upiid', label: 'UPI ID', icon: '🆔' },
    { id: 'app', label: 'UPI App', icon: '📱' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: '#080808',
      zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px 16px', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: S1, border: '1px solid ' + BM, borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 400, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', margin: 'auto 0',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>
            💳 Pay via UPI
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Station info */}
        <div style={{ ...SMCARD, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: TX, marginBottom: 4 }}>{station.name}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span style={{ color: TS }}><IcBolt s={11} /> {station.types}</span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Amount (₹)</div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: GN, fontWeight: 800, fontSize: 18 }}>₹</span>
          <input type="number" value={amt} onChange={e => setAmt(e.target.value)} style={{
            width: '100%', padding: '14px 14px 14px 34px', background: S3, border: '1.5px solid ' + BM,
            borderRadius: 12, fontSize: 22, fontWeight: 800, color: TX, outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit',
          }} />
        </div>

        {/* Payment method tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: S2, borderRadius: 13, padding: 3, marginBottom: 16, border: '1px solid ' + BD,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 4px', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 12,
              cursor: 'pointer', background: tab === t.id ? GN : 'transparent',
              color: tab === t.id ? '#fff' : TS, transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: 'inherit',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* QR Tab */}
        {tab === 'qr' && (
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
        )}

        {/* UPI ID Tab */}
        {tab === 'upiid' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Send ₹{amt || '0'} to this UPI ID
            </div>
            <div style={{
              background: S2, border: '1.5px solid ' + BM, borderRadius: 14, padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: GN, letterSpacing: .5 }}>{UPI_ID}</div>
                <div style={{ fontSize: 12, color: TS, marginTop: 4 }}>eCharge Way</div>
              </div>
              <button onClick={copyUpiId} style={{
                background: copied ? GD : S3, border: '1px solid ' + (copied ? GN : BD),
                borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                fontWeight: 700, fontSize: 12, color: copied ? GN : TX,
                transition: 'all .2s', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {copied ? <><IcOk s={12} c={GN} /> Copied</> : '📋 Copy'}
              </button>
            </div>
            <div style={{
              background: GD, borderRadius: 12, padding: '12px 14px', marginTop: 12,
              border: '1px solid rgba(34,197,94,.15)',
            }}>
              <div style={{ fontSize: 12, color: GN, fontWeight: 600, lineHeight: 1.5 }}>
                💡 Steps: Open any UPI app → Send Money → Enter UPI ID → Enter ₹{amt || '0'} → Pay
              </div>
            </div>
          </div>
        )}

        {/* UPI App Tab */}
        {tab === 'app' && (
          <div style={{ marginBottom: 16 }}>
            <a href={deepLnk} target="_blank" rel="noopener noreferrer" className="press" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: S2, border: '1.5px solid ' + BM, borderRadius: 14, padding: '18px',
              textAlign: 'center', textDecoration: 'none', color: TX, fontWeight: 800, fontSize: 15,
              marginBottom: 10,
            }}>
              📱 Open UPI App to Pay ₹{amt || '0'}
            </a>
            <div style={{ fontSize: 12, color: TM, textAlign: 'center' }}>
              This will open your default UPI app (GPay, PhonePe, Paytm etc.)
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button className="press" onClick={confirm} disabled={saving || !amt} style={{
          width: '100%', background: GN, color: '#fff', border: 'none', borderRadius: 14, padding: '15px',
          fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, fontFamily: 'inherit',
          boxShadow: '0 0 24px ' + GG, opacity: saving ? 0.7 : 1,
        }}>
          {saving ? <Spinner sz={16} col="#fff" /> : <IcOk s={14} c="#fff" />}
          I've Paid ₹{amt || '0'}
        </button>

        {err && <div style={{ background: RM, borderRadius: 10, padding: '10px', color: RD, fontSize: 13, fontWeight: 600, marginTop: 10 }}>{err}</div>}
      </div>
    </div>
  );
}
