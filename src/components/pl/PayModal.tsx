import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import { sessPrice, makeQrUrl, makeDeepLink, UPI_ID, GN, GG, GD, S1, S2, S3, BD, BM, TX, TS, TM, RD, RM, SMCARD, Station } from '@/lib/powerloop';
import { Spinner, CloseBtn, IcBolt, IcRup, IcOk } from '@/components/pl/Shared';
import upiLogo from '@/assets/upi-official.jpeg';

const UpiIcon = ({ size = 24 }: { size?: number }) => (
  <img src={upiLogo} alt="UPI" style={{ height: size, objectFit: 'contain' }} />
);

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
  const [userUpiId, setUserUpiId] = useState('');
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Please sign in first');
      
      const insertData: any = {
          user_id: authUser.id,
          station_name: station.name,
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
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const [chargePercent, setChargePercent] = useState(0);
  const [chargeSpeed, setChargeSpeed] = useState<'slow' | 'fast' | 'rapid'>('fast');
  const speedDurations = { slow: 12000, fast: 6000, rapid: 3000 };
  const speedLabels = { slow: '🐢 Slow (3.3 kW)', fast: '⚡ Fast (22 kW)', rapid: '🚀 Rapid (50 kW)' };
  const speedTimes = { slow: '~3h 20m', fast: '~1h 10m', rapid: '~30 min' };

  useEffect(() => {
    if (!paid) return;
    setChargePercent(0);
    const target = 100;
    const duration = speedDurations[chargeSpeed];
    const stepTime = 50;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setChargePercent(Math.round(current));
    }, stepTime);
    return () => clearInterval(timer);
  }, [paid, chargeSpeed]);

  if (paid) {
    return ReactDOM.createPortal(
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: '#080808',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
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
          <div style={{ color: GN, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{station.name}</div>

          {/* Charging speed selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: TM, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Charging Speed</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {(['slow', 'fast', 'rapid'] as const).map(s => (
                <button key={s} onClick={() => setChargeSpeed(s)} style={{
                  padding: '10px 6px', border: `1.5px solid ${chargeSpeed === s ? GN : BD}`,
                  borderRadius: 12, background: chargeSpeed === s ? GD : S3,
                  color: chargeSpeed === s ? GN : TS, fontWeight: 700, fontSize: 11,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                  textAlign: 'center',
                }}>
                  <div>{s === 'slow' ? '🐢' : s === 'fast' ? '⚡' : '🚀'}</div>
                  <div style={{ marginTop: 2, textTransform: 'capitalize' }}>{s}</div>
                  <div style={{ fontSize: 9, color: TM, marginTop: 2 }}>{speedTimes[s]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Charging progress bar */}
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: TX, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IcBolt s={14} /> Charging
            </span>
            <span style={{ fontSize: 15, fontWeight: 900, color: GN }}>{chargePercent}%</span>
          </div>
          <div style={{
            width: '100%', height: 18, borderRadius: 12,
            background: S3, border: '1.5px solid ' + BD,
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              height: '100%', borderRadius: 12,
              width: `${chargePercent}%`,
              background: `linear-gradient(90deg, ${GN}, #4ade80)`,
              boxShadow: `0 0 16px ${GG}`,
              transition: 'width 0.15s linear',
            }} />
          </div>
          <div style={{ fontSize: 11, color: TM, marginTop: 6, fontWeight: 600 }}>
            {chargePercent < 100 ? `⚡ Charging in progress… (${speedTimes[chargeSpeed]} est.)` : '✅ Charge complete!'}
          </div>

          <button className="press" onClick={onClose} style={{
            width: '100%', marginTop: 20, padding: 14, background: GN, color: '#fff',
            border: 'none', borderRadius: 13, fontWeight: 800, fontSize: 15, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Done ✓</button>
        </div>
      </div>,
      document.body
    );
  }

  const ScanIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );

  const tabs: { id: PayTab; label: string; icon: React.ReactNode }[] = [
    { id: 'qr', label: 'Scan QR', icon: <ScanIcon /> },
    { id: 'upiid', label: 'UPI ID', icon: <UpiIcon size={14} /> },
    { id: 'app', label: 'UPI App', icon: null },
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
              Send ₹{amt || '0'} to this UPI ID
            </div>
            <div style={{
              background: S2, border: '1.5px solid ' + BM, borderRadius: 14, padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: GN, letterSpacing: .5 }}>{UPI_ID}</div>
                <div style={{ fontSize: 12, color: TS, marginTop: 4 }}>eChargeWay</div>
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
    </div>,
    document.body
  );
}
