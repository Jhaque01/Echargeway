import React from "react";
// Constants
export const UPI_ID = '9832667682@upi';
export const UPI_NAME = 'eChargeWay';
export const KWH_SES = 30;

// Colors
export const BG = '#000000';
export const S1 = '#0A0A0A';
export const S2 = '#1A1A1A';
export const S3 = '#222222';
export const BD = 'rgba(255,255,255,.07)';
export const BM = 'rgba(255,255,255,.13)';
export const GN = '#22C56E';
export const GD = 'rgba(34,197,110,.12)';
export const GG = 'rgba(34,197,110,.28)';
export const TX = '#F4F4F5';
export const TS = '#A1A1AA';
export const TM = '#52525B';
export const RD = '#EF4444';
export const RM = 'rgba(239,68,68,.12)';

// Style objects
export const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', borderRadius: 22, padding: 18,
  border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 8px 32px rgba(0,0,0,.6)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
};
export const IBOX: React.CSSProperties = {
  width: 43, height: 43, background: 'rgba(34,197,110,.1)', borderRadius: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(34,197,110,.18)', flexShrink: 0,
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
export const SMCARD: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)', borderRadius: 13, padding: '12px 13px',
  border: '1px solid rgba(255,255,255,.08)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
};
export const GBTN: React.CSSProperties = {
  background: GN, color: '#fff', border: 'none', borderRadius: 12,
  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
};
export const DBTN: React.CSSProperties = {
  background: S2, color: TS, border: '1px solid ' + BD, borderRadius: 12,
  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
};
