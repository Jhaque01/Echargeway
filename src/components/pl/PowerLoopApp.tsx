import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ecwLogo from '@/assets/echargeway-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import {
  requestGeo, sortedStations, sessPrice,
  STATIONS, BG, S1, S2, BD, BM, GN, GG, GD, TX, TS, TM,
  CARD, IBOX, Station } from
'@/lib/powerloop';
import { Avatar, IcBolt, IcPin, IcNav, IcUser, IcSta, IcPeo, IcCity } from '@/components/pl/Shared';
import AuthModal from '@/components/pl/AuthModal';
import ProfileModal from '@/components/pl/ProfileModal';
import SiteFooter from '@/components/pl/SiteFooter';

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

// Milestones
function Milestones() {
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


// Charging Status Bar - shows real data from DB
function ChargingStatusBar({ user }: { user: any }) {
  const [lastSession, setLastSession] = useState<any>(null);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchLast = async () => {
      const { data } = await supabase
        .from('charging_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setLastSession(data);
      setLoading(false);
    };
    fetchLast();
  }, [user]);

  // Animate the bar when session exists
  useEffect(() => {
    if (!lastSession) return;
    setPercent(0);
    let current = 0;
    const timer = setInterval(() => {
      current += 1.5;
      if (current >= 100) { current = 100; clearInterval(timer); }
      setPercent(Math.round(current));
    }, 40);
    return () => clearInterval(timer);
  }, [lastSession]);

  if (loading) return null;

  // If no session, show a placeholder
  const hasSession = !!lastSession;
  const stationName = lastSession?.station_name || 'No recent session';
  const amount = lastSession?.amount || 0;
  const kwh = lastSession?.kwh || 0;
  const status = lastSession?.status || 'none';
  const createdAt = lastSession?.created_at ? new Date(lastSession.created_at) : null;
  const timeAgo = createdAt ? getTimeAgo(createdAt) : '';

  return (
    <div style={{
      ...CARD, padding: '16px 18px',
      border: '1px solid rgba(34,197,94,.25)',
      background: 'linear-gradient(135deg, rgba(34,197,94,.06), rgba(10,10,10,.9))',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...IBOX, width: 32, height: 32 }}><IcBolt s={16} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: TX }}>
              {hasSession ? stationName : 'No Charging Session'}
            </div>
            <div style={{ fontSize: 10, color: GN, fontWeight: 700 }}>
              {hasSession
                ? (percent < 100 ? '● Charging' : `✅ ${status === 'paid' ? 'Completed' : status}`)
                : '○ Start charging to see status'}
            </div>
          </div>
        </div>
        {hasSession && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: GN }}>{percent}%</div>
            <div style={{ fontSize: 10, color: TM, fontWeight: 600 }}>
              {percent < 100 ? `${kwh} kWh` : `₹${amount} · ${kwh} kWh`}
            </div>
          </div>
        )}
      </div>
      {hasSession && (
        <>
          <div style={{
            width: '100%', height: 14, borderRadius: 10,
            background: S2, border: '1px solid ' + BD,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 10,
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${GN}, #4ade80)`,
              boxShadow: `0 0 12px ${GG}`,
              transition: 'width 0.15s linear',
            }} />
          </div>
          {timeAgo && (
            <div style={{ fontSize: 10, color: TM, marginTop: 6, fontWeight: 600 }}>
              Last session: {timeAgo}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Main App
export default function PowerLoopApp() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAuth, setShowAuth] = useState(false);
  const [showProf, setShowProf] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [nearest, setNearest] = useState<Station | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        setSession(sess);
        if (sess?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sess.user.id)
            .single();
          setUser(profile);
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sess.user.id)
          .single();
        setUser(profile);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    requestGeo(
      (p) => {const s = sortedStations(p)[0];setNearest(s);},
      () => {setNearest({ ...STATIONS[0], distStr: '~1.2 km', timeStr: '~5 min' });}
    );
  }, []);

  const onAuthOk = (profile: any, sess: any) => {
    setUser(profile);
    setSession(sess);
    setShowAuth(false);
  };
  const onUpdate = (u: any) => { setUser(u); };
  const onLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setShowProf(false);
  };
  const goNav = () => {
    if (!nearest) return;
    requestGeo(
      (p) => window.open(`https://www.google.com/maps/dir/?api=1&origin=${p.lat},${p.lng}&destination=${nearest.lat},${nearest.lng}&travelmode=driving`, '_blank'),
      () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${nearest.lat},${nearest.lng}&travelmode=driving`, '_blank')
    );
  };

  // Map is now at /station route

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: isMobile ? 430 : 900, background: BG, minHeight: '100vh' }}>

        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 18px 12px', background: 'rgba(8,8,8,.97)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${BD}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div onClick={() => navigate('/home')} style={{ fontWeight: 900, fontSize: 22, color: TX, letterSpacing: -.5, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <img src={ecwLogo} alt="eChargeWay logo" style={{ height: 32, width: 32, objectFit: 'contain' }} />
              e<span style={{ color: GN, textShadow: `0 0 22px ${GG}` }}>Charge</span>Way
            </div>
            <nav style={{ display: 'flex', gap: 16 }}>
              <span onClick={() => navigate('/about')} style={{ fontSize: 13, color: TS, fontWeight: 600, cursor: 'pointer' }}>About</span>
              <span onClick={() => navigate('/station')} style={{ fontSize: 13, color: TS, fontWeight: 600, cursor: 'pointer' }}>Find Chargers</span>
            </nav>
          </div>
          {user ?
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: TX }}>{user.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: GN, fontWeight: 600 }}>● Active</div>
              </div>
              <Avatar name={user.name} img={user.avatar_url} size={38} onClick={() => setShowProf(true)} />
            </div> :

          <button className="press" onClick={() => navigate('/signin')} style={{
            background: GN, color: '#000', border: 'none', borderRadius: 50, padding: '9px 18px',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 7, boxShadow: `0 0 18px ${GG}`, fontFamily: 'inherit'
          }}>
            <IcUser s={15} c="#000" /> Sign In
          </button>
          }
        </header>

        <div style={{ padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fu" style={{ opacity: 0 }}><ChargingCard /></div>

          {/* Live charging status bar - real data */}
          <div className="fu" style={{ animationDelay: '.06s', opacity: 0 }}>
            <ChargingStatusBar user={user} />
          </div>

          {/* Nearest station */}
          <div className="fu" style={{ animationDelay: '.12s', opacity: 0 }}>
            <div style={{ ...CARD, cursor: 'pointer', transition: 'transform .18s, border-color .2s' }} onClick={() => navigate('/station')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 13 }}>
                <div style={{ ...IBOX }}><IcPin s={21} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                    color: TM, marginBottom: 4,
                  }}>Nearest Station</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: TX, lineHeight: 1.2 }}>
                    {nearest ? nearest.name : 'Locating…'}
                  </div>
                </div>
              </div>
              {nearest && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 13, color: GN, fontWeight: 700 }}>{nearest.distStr}</span>
                    <span style={{ color: TM, fontSize: 12 }}>{nearest.timeStr} drive</span>
                    <span style={{ background: GD, padding: '3px 10px', borderRadius: 50, color: GN, fontSize: 11, fontWeight: 700 }}>
                      {nearest.av}/{nearest.tot} free
                    </span>
                  </div>
                  <button className="press" onClick={e => {e.stopPropagation();goNav();}} style={{
                    background: GN, color: '#fff', border: 'none', borderRadius: 50, padding: '7px 14px',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    boxShadow: `0 0 14px ${GG}`, flexShrink: 0, fontFamily: 'inherit'
                  }}>
                    <IcNav s={12} /> Go
                  </button>
                </div>
              )}
            </div>
            <div style={{ marginTop: 11, fontSize: 12, color: TM, textAlign: 'center' }} className="font-mono text-center text-xs font-light">Tap to open map & pay inside →</div>
          </div>

          <div className="fu" style={{ animationDelay: '.22s', opacity: 0 }}><Milestones /></div>

          <SiteFooter />
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={onAuthOk} />}
      {showProf && user &&
      <ProfileModal user={user} session={session} onClose={() => setShowProf(false)} onUpdate={onUpdate} onLogout={onLogout} />
      }
    </div>);

}
