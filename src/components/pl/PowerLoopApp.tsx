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
import { Avatar, IcPin, IcNav, IcUser } from '@/components/pl/Shared';
import AuthModal from '@/components/pl/AuthModal';
import ProfileModal from '@/components/pl/ProfileModal';
import SiteFooter from '@/components/pl/SiteFooter';
import ChargingCard from './ChargingCard';
import Milestones from './Milestones';
import ChargingStatusBar from './ChargingStatusBar';

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
          padding: isMobile ? '12px 12px 10px' : '16px 18px 12px', background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          position: 'sticky', top: 0, zIndex: 10, borderBottom: `1px solid ${BD}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
            <div onClick={() => navigate('/home')} style={{ fontWeight: 900, fontSize: isMobile ? 18 : 22, color: TX, letterSpacing: -.5, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <img src={ecwLogo} alt="eChargeWay logo" style={{ height: isMobile ? 26 : 32, width: isMobile ? 26 : 32, objectFit: 'contain' }} />
              <span>e<span style={{ color: GN, textShadow: `0 0 22px ${GG}` }}>Charge</span>Way</span>
            </div>
            <nav style={{ display: 'flex', gap: isMobile ? 10 : 16 }}>
              <span onClick={() => navigate('/about')} style={{ fontSize: isMobile ? 11 : 13, color: TS, fontWeight: 600, cursor: 'pointer' }}>About</span>
              <span onClick={() => navigate('/station')} style={{ fontSize: isMobile ? 11 : 13, color: TS, fontWeight: 600, cursor: 'pointer' }}>Find Chargers</span>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: GN, fontWeight: 700 }}>{nearest.distStr}</span>
                    <span style={{ color: TM, fontSize: isMobile ? 11 : 12 }}>{nearest.timeStr} drive</span>
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
