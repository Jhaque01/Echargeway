import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { GN, GG, GD, S1, S3, BD, TX, TS, TM, Station } from '@/lib/powerloop';
import { IcBolt, IcOk } from '@/components/pl/Shared';

interface PaymentConfirmedProps {
  amt: string;
  station: Station;
  onClose: () => void;
}

export default function PaymentConfirmed({ amt, station, onClose }: PaymentConfirmedProps) {
  const [chargePercent, setChargePercent] = useState(0);
  const [chargeSpeed, setChargeSpeed] = useState<'slow' | 'fast' | 'rapid'>('fast');

  const speedTimes = { slow: '~3h 20m', fast: '~1h 10m', rapid: '~30 min' };

  const chargePercentRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const speedDurations = { slow: 12000, fast: 6000, rapid: 3000 };

    setChargePercent(0);
    chargePercentRef.current = 0;
    const target = 100;
    const duration = speedDurations[chargeSpeed];
    const startTime = performance.now();

    const updateProgress = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * target, target);

      const newPercent = Math.round(progress);
      if (newPercent !== chargePercentRef.current) {
        chargePercentRef.current = newPercent;
        setChargePercent(newPercent);
      }

      if (progress < target) {
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [chargeSpeed]);

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
