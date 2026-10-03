import React, { useState, useEffect } from 'react';
import { Avatar, CloseBtn, TabRow, IcUser, IcHist, IcSet } from '@/components/pl/Shared';
import { TX, TM, TS } from '@/lib/powerloop';
import ProfileTab from './ProfileTab';
import HistoryTab from './HistoryTab';
import SettingsTab from './SettingsTab';

interface ProfileModalProps {
  user: any;
  session: any;
  onClose: () => void;
  onUpdate: (user: any) => void;
  onLogout: () => void;
}

export default function ProfileModal({ user, session, onClose, onUpdate, onLogout }: ProfileModalProps) {
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <IcUser s={13} c={tab === 'profile' ? '#fff' : TS} /> },
    { id: 'history', label: 'History', icon: <IcHist s={13} c={tab === 'history' ? '#fff' : TS} /> },
    { id: 'settings', label: 'Settings', icon: <IcSet s={13} c={tab === 'settings' ? '#fff' : TS} /> },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.87)', backdropFilter: 'blur(10px)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', border: '1px solid rgba(255,255,255,.13)', borderRadius: 26,
        padding: '26px 20px 24px', maxWidth: 400, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,.9)', maxHeight: '94vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user.name} img={user.avatar_url} size={50} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: TM, marginTop: 2 }}>Member since {new Date(user.created_at || Date.now()).getFullYear()}</div>
            </div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <TabRow tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'profile' && <ProfileTab user={user} onUpdate={onUpdate} onClose={onClose} />}
        {tab === 'history' && <HistoryTab user={user} isActive={tab === 'history'} />}
        {tab === 'settings' && <SettingsTab onSetTab={setTab} onLogout={onLogout} />}
      </div>
    </div>
  );
}
