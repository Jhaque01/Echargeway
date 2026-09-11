import React, { useState, useEffect, useRef } from 'react';

// Counter component
export default function Counter({ target, suffix }: {target: number;suffix?: string;}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let v = 0;
      const step = target / 55;
      const t = setInterval(() => {
        v += step;
        if (v >= target) {setN(target);clearInterval(t);} else
        setN(Math.floor(v));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{n.toLocaleString()}{suffix || ''}</span>;
}
