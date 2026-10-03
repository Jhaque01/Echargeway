import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import { makeQrUrl, makeDeepLink, UPI_ID, GN, GG, GD, S1, S2, S3, BD, BM, TX, TS, TM, RD, RM, SMCARD, Station } from '@/lib/powerloop';
import { Spinner, CloseBtn, IcBolt, IcOk } from '@/components/pl/Shared';
import upiLogo from '@/assets/upi-official.jpeg';
import ecwLogo from '@/assets/echargeway-logo.png';

const UpiIcon = ({ size = 24 }: { size?: number }) => (
  <img src={upiLogo} alt="UPI" style={{ height: size, objectFit: 'contain' }} />
);

const ScanIcon = ({ color = GN }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

type PayTab = 'qr' | 'upiid' | 'app';

interface PaymentFormProps {
  station: Station;
  amt: string;
  setAmt: (amt: string) => void;
  onClose: () => void;
  onPaid: (h: any) => void;
  setPaid: (paid: boolean) => void;
}

export default function PaymentForm({ station, amt, setAmt, onClose, onPaid, setPaid }: PaymentFormProps) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imgOk, setImgOk] = useState(true);
  const [tab, setTab] = useState<PayTab>('qr');
  const [copied, setCopied] = useState(false);
  const [userUpiId, setUserUpiId] = useState('');

  const qrUrl = useMemo(() => makeQrUrl(amt || '0', station.name), [amt, station.name]);
  const deepLnk = useMemo(() => makeDeepLink(amt || '0', station.name), [amt, station.name]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const confirm = async () => {
    setSaving(true); setErr('');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Please sign in first');
      
      const insertData: any = {
          user_id: authUser.id,
          station_name: station.name,
          amount: Number(amt || '0'),
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr('An unknown error occurred');
      }
    }
    setSaving(false);
  };

  const tabs: { id: PayTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'qr', label: 'Scan QR', icon: (active) => <ScanIcon color={active ? '#000' : GN} /> },
    { id: 'upiid', label: 'UPI ID', icon: () => <UpiIcon size={14} /> },
    { id: 'app', label: 'UPI App', icon: () => null },
  ];

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: '#080808',
      zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px 16px', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: S1, border: '1px solid ' + BM, borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 400, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', margin: 'auto 0',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: TX, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UpiIcon size={28} /> Pay via UPI
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: S3, border: '1.5px solid ' + BM, borderRadius: 12,
          padding: '14px', marginBottom: 14,
        }}>
          <span style={{ color: GN, fontWeight: 800, fontSize: 22 }}>₹</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: TX }}>{amt}</span>
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
              color: tab === t.id ? '#000' : TS, transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: 'inherit',
            }}>
              {t.icon(tab === t.id)} {t.label}
            </button>
          ))}
        </div>

        {/* QR Tab */}
        {tab === 'qr' && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              background: 'linear-gradient(145deg, #0a0a0a, #111)',
              borderRadius: 22, padding: 22,
              border: '1.5px solid rgba(34,197,94,.25)',
              boxShadow: '0 0 40px rgba(34,197,94,.1), inset 0 1px 0 rgba(255,255,255,.04)',
              display: 'inline-block',
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: '#fff', borderRadius: 16, padding: 14,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 0 20px rgba(34,197,94,.15)',
                }}>
                  {/* Green corner scan marks */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '4px solid ' + GN, borderLeft: '4px solid ' + GN, borderRadius: '16px 0 0 0' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '4px solid ' + GN, borderRight: '4px solid ' + GN, borderRadius: '0 16px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '4px solid ' + GN, borderLeft: '4px solid ' + GN, borderRadius: '0 0 0 16px' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '4px solid ' + GN, borderRight: '4px solid ' + GN, borderRadius: '0 0 16px 0' }} />
                  {imgOk ? (
                    <div style={{ position: 'relative' }}>
                      <img src={qrUrl} alt="UPI QR" width={200} height={200}
                        onError={() => setImgOk(false)}
                        style={{ display: 'block', borderRadius: 6, filter: 'hue-rotate(90deg) saturate(1.5)' }} />
                      {/* Company name overlay in center */}
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        background: '#fff', borderRadius: 8, padding: '3px',
                        boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img src={ecwLogo} alt="eChargeWay" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>
                      QR unavailable
                    </div>
                  )}
                </div>
              </div>
              {/* UPI badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 16, background: GD, borderRadius: 12, padding: '10px 16px',
                border: '1px solid rgba(34,197,94,.2)',
              }}>
                <UpiIcon size={20} />
                <span style={{ fontSize: 14, fontWeight: 900, color: GN, letterSpacing: .3 }}>Scan & Pay ₹{amt}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: TM, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GN, animation: 'pulse-dot 2s infinite' }} />
              Scan with GPay, PhonePe, Paytm or any UPI app
            </div>
          </div>
        )}

        {/* UPI ID Tab */}
        {tab === 'upiid' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Enter your UPI ID to pay ₹{amt || '0'}
            </div>
            <div style={{
              background: S2, border: '1.5px solid ' + BM, borderRadius: 14, padding: '14px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            }}>
              <UpiIcon size={20} />
              <input
                type="text"
                placeholder="yourname@upi"
                value={userUpiId}
                onChange={e => setUserUpiId(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: TX, fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{
              background: GD, borderRadius: 12, padding: '12px 14px',
              border: '1px solid rgba(15,255,80,.15)',
            }}>
              <div style={{ fontSize: 12, color: GN, fontWeight: 600, lineHeight: 1.5 }}>
                💡 Enter your UPI ID (e.g. name@paytm, name@okaxis) and click "I've Paid" to confirm payment.
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
    </div>,
    document.body
  );
}
