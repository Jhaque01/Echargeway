import { useState, useEffect } from 'react';

const speedDurations = { slow: 12000, fast: 6000, rapid: 3000 };
const speedLabels = { slow: '🐢 Slow (3.3 kW)', fast: '⚡ Fast (22 kW)', rapid: '🚀 Rapid (50 kW)' };
const speedTimes = { slow: '~3h 20m', fast: '~1h 10m', rapid: '~30 min' };

export function useChargeSimulation(paid: boolean) {
  const [chargePercent, setChargePercent] = useState(0);
  const [chargeSpeed, setChargeSpeed] = useState<'slow' | 'fast' | 'rapid'>('fast');

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

  return { chargePercent, chargeSpeed, setChargeSpeed, speedTimes, speedLabels };
}
