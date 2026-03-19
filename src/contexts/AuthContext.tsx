import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  vehicle?: string;
}

interface HistoryItem {
  id: number;
  station_name: string;
  amount: number;
  kwh: number;
  status: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'created_at'>) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users database
const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'demo@powerloop.com',
    password: 'demo123',
    user: { id: 1, name: 'Demo User', email: 'demo@powerloop.com', phone: '+91 98765 43210', vehicle: 'Tesla Model 3' },
  },
];

let nextUserId = 2;
let nextHistoryId = 4;

const INITIAL_HISTORY: HistoryItem[] = [
  { id: 1, station_name: 'MG Road Station', amount: 450, kwh: 25, status: 'paid', created_at: '2026-03-18T10:30:00' },
  { id: 2, station_name: 'Koramangala Hub', amount: 320, kwh: 18, status: 'paid', created_at: '2026-03-15T14:15:00' },
  { id: 3, station_name: 'Whitefield Plaza', amount: 580, kwh: 32, status: 'paid', created_at: '2026-03-10T09:45:00' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    setUser(found.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (MOCK_USERS.find(u => u.email === email)) throw new Error('Email already registered');
    const newUser: User = { id: nextUserId++, name, email };
    MOCK_USERS.push({ email, password, user: newUser });
    setUser(newUser);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addHistory = useCallback((item: Omit<HistoryItem, 'id' | 'created_at'>) => {
    setHistory(prev => [
      { ...item, id: nextHistoryId++, created_at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, history, addHistory, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
