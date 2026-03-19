import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { STATIONS, Station } from '@/data/stations';
import StationCard from '@/components/StationCard';
import StationMap from '@/components/StationMap';
import HistoryPanel from '@/components/HistoryPanel';
import { Zap, LogOut, MapPin, LayoutGrid, Clock, User } from 'lucide-react';

type Tab = 'stations' | 'map' | 'history' | 'profile';

const Dashboard = () => {
  const { user, logout, addHistory, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('stations');
  const [payingStation, setPayingStation] = useState<Station | null>(null);

  const handlePay = (station: Station) => {
    setPayingStation(station);
  };

  const confirmPay = () => {
    if (!payingStation) return;
    const kwh = Math.floor(Math.random() * 20) + 15;
    addHistory({
      station_name: payingStation.name,
      amount: kwh * payingStation.price,
      kwh,
      status: 'paid',
    });
    setPayingStation(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stations', label: 'Stations', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'map', label: 'Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen gradient-dark">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground font-display">
              Power<span className="text-primary">Loop</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border bg-card/50">
        <div className="container max-w-6xl mx-auto flex gap-1 px-4 py-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'stations' && (
            <motion.div key="stations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STATIONS.map((s, i) => (
                  <StationCard key={s.id} station={s} onPay={handlePay} delay={i * 0.08} />
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StationMap stations={STATIONS} />
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryPanel />
            </motion.div>
          )}

          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfilePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Payment modal */}
      <AnimatePresence>
        {payingStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full box-glow"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4 box-glow-strong">
                  <Zap className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{payingStation.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">₹{payingStation.price}/kWh</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPayingStation(null)}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPay}
                  className="flex-1 gradient-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity box-glow"
                >
                  Confirm & Pay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfilePanel = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehicle, setVehicle] = useState(user?.vehicle || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, phone, vehicle });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-md">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile
        </h3>

        {[
          { label: 'Name', value: name, set: setName },
          { label: 'Email', value: user?.email || '', set: () => {}, disabled: true },
          { label: 'Phone', value: phone, set: setPhone, placeholder: '+91 98765 43210' },
          { label: 'Vehicle', value: vehicle, set: setVehicle, placeholder: 'Tesla Model 3' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-sm text-muted-foreground mb-1">{f.label}</label>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              disabled={'disabled' in f && f.disabled}
              placeholder={'placeholder' in f ? f.placeholder : ''}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full gradient-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
