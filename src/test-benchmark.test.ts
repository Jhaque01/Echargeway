import { describe, it } from 'vitest';
import L from 'leaflet';

describe('Performance benchmark', () => {
  it('measures marker creation', () => {
    // We can simulate the loop
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const isSel = i === 0;
      const col = isSel ? '#22C55E' : '#1C1C1C';
      const bord = isSel ? '#050505' : 'rgba(34,197,94,.4)';
      const glow = isSel ? '0 0 20px rgba(34,197,94,.9)' : 'none';
      const icon = L.divIcon({
        className: '',
        iconSize: [38, 46],
        iconAnchor: [19, 46],
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${col};border:2.5px solid ${bord};display:flex;align-items:center;justify-content:center;box-shadow:${glow};cursor:pointer"><span style="transform:rotate(45deg);color:#fff;font-size:9px;font-weight:900">CW</span></div>`,
      });
    }
    const end = performance.now();
    console.log(`Unoptimized took: ${end - start} ms`);

    const start2 = performance.now();
    const selIcon = L.divIcon({
      className: '',
      iconSize: [38, 46],
      iconAnchor: [19, 46],
      html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#22C55E;border:2.5px solid #050505;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(34,197,94,.9);cursor:pointer"><span style="transform:rotate(45deg);color:#fff;font-size:9px;font-weight:900">CW</span></div>`,
    });
    const unselIcon = L.divIcon({
      className: '',
      iconSize: [38, 46],
      iconAnchor: [19, 46],
      html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1C1C1C;border:2.5px solid rgba(34,197,94,.4);display:flex;align-items:center;justify-content:center;box-shadow:none;cursor:pointer"><span style="transform:rotate(45deg);color:#fff;font-size:9px;font-weight:900">CW</span></div>`,
    });

    for (let i = 0; i < iterations; i++) {
      const isSel = i === 0;
      const icon = isSel ? selIcon : unselIcon;
    }
    const end2 = performance.now();
    console.log(`Optimized took: ${end2 - start2} ms`);
  });
});
