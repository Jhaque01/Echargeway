import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fmtAge, GN, GD, S2, BD, TX, TS, TM, RD, RM } from '@/lib/powerloop';
import { Spinner } from '@/components/pl/Shared';

interface HistoryTabProps {
  user: any;
  isActive: boolean;
}

function downloadReport(user: any, hist: any[]) {
  const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const rows = hist.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>'
    : hist.map(h => `<tr><td>${dateFormatter.format(new Date(h.created_at))}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${Number(h.amount || 0).toFixed(0)}</td><td style="text-align:right">${h.kwh || 0} kWh</td></tr>`).join('');
  const totalAmt = hist.reduce((s: number, h: any) => s + Number(h.amount || 0), 0);
  const totalKwh = hist.reduce((s: number, h: any) => s + (Number(h.kwh) || 0), 0);
  const totRow = hist.length > 0 ? `<tr class="tot"><td colspan="2"><b>Total (${hist.length} sessions)</b></td><td style="text-align:right"><b>₹${totalAmt.toFixed(0)}</b></td><td style="text-align:right"><b>${totalKwh} kWh</b></td></tr>` : '';
  const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>eChargeWay Charging Report</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;color:#222;padding:0 24px}.hd{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #22C55E;padding-bottom:14px;margin-bottom:22px}.brand{font-size:26px;font-weight:900}.brand b{color:#22C55E}table{width:100%;border-collapse:collapse}th{background:#22C55E;color:#fff;padding:10px 12px;text-align:left;font-size:13px}td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}.tot td{background:#f0fdf4;border-top:2px solid #22C55E}.foot{text-align:center;color:#aaa;font-size:11px;margin-top:36px}</style></head><body><div class="hd"><div class="brand">e<b>Charge</b>Way</div><div style="text-align:right;font-size:12px;color:#666"><b>Charging Report</b><br>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><h2>${user.name || 'User'}</h2><p>📧 ${user.email || '—'}</p><table><thead><tr><th>Date</th><th>Station</th><th style="text-align:right">Amount</th><th style="text-align:right">Energy</th></tr></thead><tbody>${rows}${totRow}</tbody></table><div class="foot">eChargeWay EV Charging · © ${new Date().getFullYear()}</div></body></html>`;
  const blob = new Blob([doc], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'eChargeWay_Report_' + (user.name || 'User').replace(/\s+/g, '_') + '.html';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 800);
}

export default function HistoryTab({ user, isActive }: HistoryTabProps) {
  const [hist, setHist] = useState<any[] | null>(null);
  const [hloading, setHl] = useState(false);

  useEffect(() => {
    if (!isActive || hist !== null) return;
    setHl(true);
    const loadHistory = async () => {
      try {
        const { data } = await supabase
          .from('charging_history')
          .select('*')
          .order('created_at', { ascending: false });
        setHist(data || []);
      } catch {
        setHist([]);
      } finally {
        setHl(false);
      }
    };
    loadHistory();
  }, [isActive, hist]);

  return (
    <div>
      {!hloading && hist && hist.length > 0 && (
        <button className="press" onClick={() => downloadReport(user, hist)} style={{
          width: '100%', padding: '12px 16px', background: GD, color: GN,
          border: '1px solid rgba(34,197,94,.3)', borderRadius: 13, fontWeight: 800,
          fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 9, marginBottom: 14, fontFamily: 'inherit',
          boxShadow: '0 0 16px rgba(34,197,94,.15)',
        }}>⬇ Download Charging Report</button>
      )}
      {hloading && <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner /></div>}
      {!hloading && hist !== null && hist.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: 46, marginBottom: 14 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: TX, marginBottom: 6 }}>No sessions yet</div>
          <div style={{ color: TM, fontSize: 13 }}>Your charging history will appear here after your first session.</div>
        </div>
      )}
      {!hloading && hist && hist.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hist.map((h: any, i: number) => (
            <div key={h.id || i} style={{ background: S2, borderRadius: 14, padding: '13px 16px', border: `1px solid ${BD}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: TX, flex: 1, marginRight: 8, lineHeight: 1.35 }}>{h.station_name}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: GN, whiteSpace: 'nowrap' }}>₹{Number(h.amount).toFixed(0)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                {h.kwh && <span style={{ fontSize: 11, color: TS, background: '#222', padding: '2px 8px', borderRadius: 20 }}>{h.kwh} kWh</span>}
                <span style={{ fontSize: 11, color: TM }}>{fmtAge(h.created_at)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: h.status === 'paid' ? GN : RD, background: h.status === 'paid' ? GD : RM, padding: '2px 9px', borderRadius: 20 }}>
                  {(h.status || 'paid').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
