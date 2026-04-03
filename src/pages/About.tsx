import React from 'react';
import { useNavigate } from 'react-router-dom';
import ecwLogo from '@/assets/echargeway-logo.png';
import { BG, S1, S2, S3, BD, GN, GG, GD, TX, TS, TM } from '@/lib/powerloop';
import { IcBolt } from '@/components/pl/Shared';
import SiteFooter from '@/components/pl/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AboutPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const features = [
    { icon: '⚡', title: 'Fast & Reliable', desc: 'Our charging stations deliver high-speed charging with 99.9% uptime reliability.' },
    { icon: '🛡️', title: 'Safe & Secure', desc: 'All transactions are secured with bank-grade encryption and fraud protection.' },
    { icon: '🌐', title: 'Pan-India Network', desc: 'Growing network across 28+ cities with new stations added every week.' },
    { icon: '👥', title: 'Community Driven', desc: 'Built for EV drivers, by EV enthusiasts who understand your needs.' },
  ];

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX }}>
      {/* Navbar */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '14px 16px' : '16px 40px', borderBottom: `1px solid ${BD}`,
        position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,8,8,.97)', backdropFilter: 'blur(20px)',
      }}>
        <div onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src={ecwLogo} alt="logo" style={{ height: isMobile ? 28 : 32, width: isMobile ? 28 : 32 }} />
          <span style={{ fontWeight: 900, fontSize: isMobile ? 17 : 20, color: TX }}>e<span style={{ color: GN }}>Charge</span>Way</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 28 }}>
          <span onClick={() => navigate('/about')} style={{ color: GN, fontWeight: 700, fontSize: isMobile ? 12 : 14, cursor: 'pointer' }}>About</span>
          <span onClick={() => navigate('/station')} style={{ color: TS, fontWeight: 600, fontSize: isMobile ? 12 : 14, cursor: 'pointer' }}>Find Chargers</span>
          <span onClick={() => navigate('/signin')} style={{ color: TS, fontWeight: 600, fontSize: isMobile ? 12 : 14, cursor: 'pointer' }}>Log in</span>
        </nav>
      </header>

      {/* About content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '32px 16px' : '60px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 28 : 60,
          alignItems: 'start',
        }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-block', background: GD, border: `1px solid rgba(15,255,80,.2)`,
              borderRadius: 50, padding: '6px 16px', marginBottom: 16,
            }}>
              <span style={{ color: GN, fontWeight: 700, fontSize: 13 }}>About Us</span>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: isMobile ? 28 : 38, lineHeight: 1.2, marginBottom: 20, color: TX }}>
              Powering the Future<br />of Electric Mobility
            </h1>
            <p style={{ color: TM, fontSize: isMobile ? 14 : 15, lineHeight: 1.8, marginBottom: 14 }}>
              EChargeWay is India's fastest-growing EV charging infrastructure company. We're on a mission to make electric vehicle charging as convenient as refueling at a petrol pump.
            </p>
            <p style={{ color: TM, fontSize: isMobile ? 14 : 15, lineHeight: 1.8, marginBottom: 20 }}>
              Founded in 2026, we've rapidly expanded our network to cover major highways, metro cities, and tier-2 towns. Our smart charging technology ensures you spend less time waiting and more time driving.
            </p>
            <div style={{
              background: S1, border: `1px solid ${BD}`, borderRadius: 16, padding: isMobile ? 18 : 24,
            }}>
              <h3 style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: TX, marginBottom: 10 }}>Our Mission</h3>
              <p style={{ color: TM, fontSize: 14, lineHeight: 1.7 }}>
                To accelerate the adoption of electric vehicles in India by building the most accessible, reliable, and user-friendly charging infrastructure.
              </p>
            </div>
          </div>

          {/* Right - Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: isMobile ? 12 : 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: S1, border: `1px solid ${BD}`, borderRadius: 16, padding: isMobile ? 16 : 24,
              }}>
                <div style={{
                  width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 12,
                  background: i === 3 ? GD : S2, border: `1px solid ${i === 3 ? 'rgba(15,255,80,.2)' : BD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 18 : 22, marginBottom: 12,
                }}>{f.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: isMobile ? 14 : 16, color: TX, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: isMobile ? 12 : 13, color: TM, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div style={{
          marginTop: isMobile ? 32 : 60, padding: isMobile ? '24px 18px' : 40, borderRadius: 22,
          background: 'linear-gradient(135deg, rgba(15,255,80,.06), rgba(10,10,10,.9))',
          border: `1px solid rgba(15,255,80,.15)`,
        }}>
          <h2 style={{ fontWeight: 900, fontSize: isMobile ? 22 : 28, color: TX, marginBottom: 16 }}>
            Our <span style={{ color: GN, textShadow: `0 0 14px ${GG}` }}>Story</span>
          </h2>
          <div style={{ fontSize: isMobile ? 14 : 15, color: TM, lineHeight: 1.9, maxWidth: 800 }}>
            <p style={{ marginBottom: 14 }}>EChargeWay started with a simple idea — make EV charging easy and stress-free.</p>
            <p style={{ marginBottom: 14 }}>The journey began in January 2026, when Jiaul Haque set out to solve a real problem faced by electric vehicle users: finding reliable charging at the right time and place.</p>
            <p style={{ marginBottom: 14 }}>What started as a small project quickly turned into a focused mission. The goal was not just to build a platform, but to create a practical solution that people can use every day.</p>
            <p style={{ marginBottom: 14 }}>From initial prototypes to a working platform, EChargeWay has grown step by step with a strong focus on usability and real-world needs.</p>
            <p>Today, EChargeWay continues to evolve with one clear vision — to support the shift to clean mobility by making EV charging simple, reliable, and accessible for everyone.</p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
