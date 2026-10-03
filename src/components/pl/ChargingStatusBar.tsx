import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CARD, IBOX, GN, TX, TM, S2, BD, GG } from '@/lib/powerloop';
import { IcBolt } from '@/components/pl/Shared';

export function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ChargingStatusBar({ user }: { user: any }) {
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
      border: '1px solid rgba(34,197,110,.2)',
      background: 'linear-gradient(135deg, rgba(34,197,110,.06), rgba(255,255,255,.03))',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
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
