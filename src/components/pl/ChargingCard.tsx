import React, { useState, useEffect } from 'react';
import { GN, GG, TX } from '@/lib/powerloop';
import { IcBolt } from '@/components/pl/Shared';

// Charging Card
export default function ChargingCard() {
  const [p, setP] = useState(false);
  useEffect(() => {const t = setInterval(() => setP((x) => !x), 900);return () => clearInterval(t);}, []);
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,.03), rgba(34,197,110,.04) 50%, rgba(0,0,0,.4))',
      borderRadius: 22, overflow: 'hidden', position: 'relative', height: 196,
      display: 'flex', alignItems: 'flex-end', padding: '18px 22px',
      border: '1px solid rgba(34,197,110,.12)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,.5)',
    }}>
      {[0, 1, 2].map((i) =>
      <div key={i} style={{
        position: 'absolute', borderRadius: '50%',
        width: 110 + i * 80, height: 110 + i * 80,
        border: `1px solid rgba(34,197,94,${0.2 - i * .06})`,
        top: '50%', left: '63%', transform: 'translate(-50%,-50%)',
      }} />
      )}
      <div style={{ position: 'absolute', top: '50%', left: '63%', transform: 'translate(-50%,-50%)' }}>
        <div style={{
          width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: p ? `radial-gradient(circle,rgba(34,197,94,.35),transparent 70%)` : 'transparent',
          transition: 'background .5s',
        }}>
          <IcBolt s={32} />
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
          color: GN, marginBottom: 6,
        }}>SMART EV CHARGING</div>
        <div style={{ fontWeight: 900, fontSize: 24, color: TX, lineHeight: 1.2 }}>
          Find & Charge<br />in <span style={{ color: GN, textShadow: `0 0 18px ${GG}` }}>Seconds</span>
        </div>
      </div>
    </div>
  );
}
