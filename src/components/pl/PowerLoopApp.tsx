import React, { useState, useEffect, useRef } from 'react';
import {
  callApi, store, requestGeo, sortedStations, sessPrice,
  STATIONS, BG, S1, S2, BD, BM, GN, GG, GD, TX, TS, TM,
  CARD, IBOX, Station } from
'@/lib/powerloop';
import { Avatar, IcBolt, IcPin, IcNav, IcUser, IcSta, IcPeo, IcCity } from '@/components/pl/Shared';
import AuthModal from '@/components/pl/AuthModal';
import ProfileModal from '@/components/pl/ProfileModal';
import MapScreen from '@/components/pl/MapScreen';

// Counter component
function Counter({ target, suffix }: {target: number;suffix?: string;}) {
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

// Charging Card
function ChargingCard() {
  const [p, setP] = useState(false);
  useEffect(() => {const t = setInterval(() => setP((x) => !x), 900);return () => clearInterval(t);}, []);
  return (
    <div style={{
      background: 'linear-gradient(135deg,#0D0D0D,#111 50%,#0A1A0A)', borderRadius: 22,
      overflow: 'hidden', position: 'relative', height: 196,
      display: 'flex', alignItems: 'flex-end', padding: '18px 22px',
      border: '1px solid rgba(34,197,94,.15)'
    }}>
      {[0, 1, 2].map((i) =>
      <div key={i} style={{
        position: 'absolute', borderRadius: '50%',
        width: 110 + i * 80, height: 110 + i * 80,
        border: `1px solid rgba(34,197,94,${0.2 - i * .06})`,
        top: '50%', left: '63%', transform: 'translate(-50%,-50%)',
        animation: `ring 2.4s ease-in-out infinite ${i * .6}s`
      }} />
      )}
      <div style={{
        position: 'absolute', right: 32, top: '50%', transform: 'translateY(-55%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
      }}>
        <div style={{
          width: 52, height: 70, background: 'rgba(34,197,94,.06)', borderRadius: 13,
          border: `1.5px solid rgba(34,197,94,${p ? .45 : .15})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .3s'
        }}>
          <span style={{ fontSize: 28, filter: p ? 'drop-shadow(0 0 18px #22C55E)' : 'none', transition: 'filter .3s' }}>⚡</span>
        </div>
        <div style={{ width: 4, height: 20, background: 'rgba(34,197,94,.2)', borderRadius: 2 }} />
        <div style={{ width: 26, height: 6, background: 'rgba(34,197,94,.1)', borderRadius: 3 }} />
      </div>
      <div style={{ position: 'absolute', top: 18, left: 22, color: GN, fontSize: 11, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>68% · 32 min left</div>
      <div style={{ position: 'absolute', top: 34, left: 22, right: 110, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 4 }}>
        <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,#22C55E,#86EFAC)', borderRadius: 4, boxShadow: '0 0 10px #22C55E', fontWeight: 900 }} />
      </div>
      <div>
        <div style={{ color: TM, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>Up to 150 kW DC</div>
        <h3 style={{ color: TX, fontWeight: 900, fontSize: 21, margin: 0 }}>Ultra-Fast Charging</h3>
      </div>
    </div>);

}

// Milestones
function Milestones() {
  const items = [
  { Icon: IcSta, label: 'Charging Points', target: 500, suffix: '+' },
  { Icon: IcPeo, label: 'Happy Drivers', target: 2400, suffix: 'K+' },
  { Icon: IcCity, label: 'Cities Covered', target: 28, suffix: '+' },
  { Icon: IcBolt, label: 'MWh Delivered', target: 1200, suffix: 'K' }];

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 19, color: TX, marginBottom: 3 }}>Powering India's EV Revolution</h2>
      <p style={{ textAlign: 'center', color: TM, fontSize: 13, marginBottom: 13 }}>Trusted by drivers across 28+ cities</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map(({ Icon, label, target, suffix }, i) =>
        <div key={i} style={{ ...CARD, textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ width: 46, height: 46, background: GD, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '1px solid rgba(34,197,94,.2)' }}>
              <Icon s={20} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 24, color: TX, lineHeight: 1 }}><Counter target={target} suffix={suffix} /></div>
            <div style={{ fontSize: 11, color: TM, marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        )}
      </div>
    </div>);

}

// Main App
export default function PowerLoopApp() {
  const [showMap, setShowMap] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProf, setShowProf] = useState(false);
  const [user, setUser] = useState<any>(() => store.get('pl_usr'));
  const [token, setToken] = useState<string | null>(() => store.get('pl_tok'));
  const [nearest, setNearest] = useState<Station | null>(null);

  useEffect(() => {
    if (!token) return;
    callApi('/profile', 'GET', null, token).
    then((u) => {setUser(u);store.set('pl_usr', u);}).
    catch(() => {setUser(null);setToken(null);store.del('pl_tok');store.del('pl_usr');});
  }, [token]);

  useEffect(() => {
    requestGeo(
      (p) => {const s = sortedStations(p)[0];setNearest(s);},
      () => {setNearest({ ...STATIONS[0], distStr: '~1.2 km', timeStr: '~5 min' });}
    );
  }, []);

  const onAuthOk = (u: any, t: string) => {setUser(u);setToken(t);setShowAuth(false);};
  const onUpdate = (u: any) => {setUser(u);store.set('pl_usr', u);};
  const onLogout = () => {setUser(null);setToken(null);store.del('pl_tok');store.del('pl_usr');setShowProf(false);};
  const goNav = () => {
    if (!nearest) return;
    requestGeo(
      (p) => window.open(`https://www.google.com/maps/dir/?api=1&origin=${p.lat},${p.lng}&destination=${nearest.lat},${nearest.lng}&travelmode=driving`, '_blank'),
      () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${nearest.lat},${nearest.lng}&travelmode=driving`, '_blank')
    );
  };

  if (showMap) return <MapScreen onBack={() => setShowMap(false)} user={user} token={token || ''} onHistAdd={() => {}} />;

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, background: BG, minHeight: '100vh' }}>

        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 18px 12px', background: 'rgba(8,8,8,.97)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${BD}`
        }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: TX, letterSpacing: -.5 }}>
            e<span style={{ color: GN, textShadow: `0 0 22px ${GG}` }}>Charge</span>Way
          </div>
          {user ?
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: TX }}>{user.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: GN, fontWeight: 600 }}>● Active</div>
              </div>
              <Avatar name={user.name} img={user.avatar_url} size={38} onClick={() => setShowProf(true)} />
            </div> :

          <button className="press" onClick={() => setShowAuth(true)} style={{
            background: GN, color: '#fff', border: 'none', borderRadius: 50, padding: '9px 18px',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 7, boxShadow: `0 0 18px ${GG}`, fontFamily: 'inherit'
          }}>
              <IcUser /> Log In
            </button>
          }
        </header>

        {/* Hero */}
        <section className="fu" style={{ padding: '30px 20px 16px', textAlign: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 340, height: 200, background: 'radial-gradient(ellipse,rgba(34,197,94,.07),transparent 68%)',
            pointerEvents: 'none'
          }} />
          {user ?
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: GD, border: '1px solid rgba(34,197,94,.22)', borderRadius: 50,
            padding: '6px 14px', marginBottom: 16
          }}>
              <Avatar name={user.name} img={user.avatar_url} size={20} />
              <span style={{ fontSize: 12, fontWeight: 700, color: GN }}>Welcome back, {user.name?.split(' ')[0]}!</span>
            </div> :

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: GD, border: '1px solid rgba(34,197,94,.2)', borderRadius: 50,
            padding: '5px 13px', marginBottom: 14
          }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GN, boxShadow: `0 0 6px ${GN}` }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: GN, letterSpacing: .4 }}>Now live in 28+ cities</span>
            </div>
          }
          <h1 style={{ fontWeight: 900, fontSize: 32, lineHeight: 1.13, color: TX, marginBottom: 13, letterSpacing: -.5 }}>
            The Future of <span style={{ color: GN, textShadow: `0 0 28px ${GG}` }}>EV Charging</span>
          </h1>
          <p style={{ color: TS, fontSize: 14, lineHeight: 1.75, maxWidth: 300, margin: '0 auto' }}>
            Real-time station finder, instant UPI payment, and charging history — all in one tap.
          </p>
        </section>

        <div style={{ padding: '0 13px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>

          <div className="fu" style={{ animationDelay: '.06s', opacity: 0 }}><ChargingCard /></div>

          {/* Location card */}
          <div className="fu hoverable" onClick={() => setShowMap(true)}
          style={{ ...CARD, animationDelay: '.13s', opacity: 0, border: '1.5px solid rgba(34,197,94,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={IBOX}><IcPin s={22} /></div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 17, color: TX, marginBottom: 2 }}>Find Nearest Station</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: GN, boxShadow: `0 0 8px ${GN}` }} />
                  <span style={{ fontSize: 11.5, color: GN, fontWeight: 700 }}>Live GPS · Real-time availability</span>
                </div>
              </div>
            </div>
            <p style={{ color: TS, fontSize: 13.5, lineHeight: 1.65, marginBottom: 13 }}>
              Tap to open the live map, select a station, and pay instantly via UPI — GPay, PhonePe, Paytm or any app.
            </p>
            <div style={{
              background: S2, borderRadius: 14, padding: '13px 15px',
              display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${BM}`
            }}>
              <div style={{
                width: 38, height: 38, background: GD, borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid rgba(34,197,94,.25)'
              }}><IcPin s={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: TX, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nearest ? nearest.name : 'Detecting your location…'}
                </div>
                <div style={{ fontSize: 11.5, color: TM }}>
                  {nearest ? `${nearest.distStr} · ${nearest.av}/${nearest.tot} chargers free` : 'Getting GPS…'}
                </div>
              </div>
              <button className="press" onClick={(e) => {e.stopPropagation();goNav();}} style={{
                background: GN, border: 'none', borderRadius: 10, padding: '9px 14px',
                color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                boxShadow: `0 0 14px ${GG}`, flexShrink: 0, fontFamily: 'inherit'
              }}>
                <IcNav s={12} /> Go
              </button>
            </div>
            <div style={{ marginTop: 11, fontSize: 12, color: TM, textAlign: 'center' }} className="font-mono text-center text-xs font-light">Tap to open map & pay inside →</div>
          </div>

          <div className="fu" style={{ animationDelay: '.22s', opacity: 0 }}><Milestones /></div>

          {/* Footer */}
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${BD}`, marginTop: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 19, color: TX, marginBottom: 7 }}>
              e<span style={{ color: GN, textShadow: `0 0 16px ${GG}` }}>Charge</span> Way
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 10 }}>
              {['About', 'Careers', 'Contact'].map((l) =>
              <span key={l} style={{ fontSize: 12.5, color: TM, cursor: 'pointer', fontWeight: 600 }}>{l}</span>
              )}
            </div>
            <div style={{ color: TM, fontSize: 11.5 }}>© 2024 eChargeWay Inc.</div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={onAuthOk} />}
      {showProf && user &&
      <ProfileModal user={user} token={token || ''} onClose={() => setShowProf(false)} onUpdate={onUpdate} onLogout={onLogout} />
      }
    </div>);

}