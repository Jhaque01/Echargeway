import React from 'react';
import { CARD, IBOX, TX, TM } from '@/lib/powerloop';
import { IcSta, IcPeo, IcCity } from '@/components/pl/Shared';
import Counter from './Counter';

// Milestones
export default function Milestones() {
  const items = [
    { icon: <IcSta s={22} />, label: 'Stations', value: 200, suffix: '+' },
    { icon: <IcPeo s={22} />, label: 'Users', value: 14, suffix: 'K+' },
    { icon: <IcCity s={22} />, label: 'Cities', value: 12, suffix: '' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {items.map((m, i) => (
        <div key={i} style={{ ...CARD, textAlign: 'center', padding: '18px 8px' }}>
          <div style={{ ...IBOX, margin: '0 auto 10px' }}>{m.icon}</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: TX, lineHeight: 1 }}><Counter target={m.value} suffix={m.suffix} /></div>
          <div style={{ fontSize: 11, color: TM, fontWeight: 600, marginTop: 5 }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}
