const fs = require('fs');
const { performance } = require('perf_hooks');

function downloadReportOld(hist) {
  const rows = hist.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>'
    : hist.map(h => `<tr><td>${new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${parseFloat(h.amount || 0).toFixed(0)}</td><td style="text-align:right">${h.kwh || 0} kWh</td></tr>`).join('');
  const totalAmt = hist.reduce((s, h) => s + parseFloat(h.amount || 0), 0);
  const totalKwh = hist.reduce((s, h) => s + (parseFloat(h.kwh) || 0), 0);
  const totRow = hist.length > 0 ? `<tr class="tot"><td colspan="2"><b>Total (${hist.length} sessions)</b></td><td style="text-align:right"><b>₹${totalAmt.toFixed(0)}</b></td><td style="text-align:right"><b>${totalKwh} kWh</b></td></tr>` : '';

  return { rows, totRow, totalAmt, totalKwh };
}

function downloadReportNew(hist) {
  let rows = '';
  let totalAmt = 0;
  let totalKwh = 0;

  if (hist.length === 0) {
    rows = '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>';
  } else {
    for (let i = 0; i < hist.length; i++) {
      const h = hist[i];
      rows += `<tr><td>${new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${parseFloat(h.amount || 0).toFixed(0)}</td><td style="text-align:right">${h.kwh || 0} kWh</td></tr>`;
      totalAmt += parseFloat(h.amount || 0);
      totalKwh += parseFloat(h.kwh || 0);
    }
  }

  const totRow = hist.length > 0 ? `<tr class="tot"><td colspan="2"><b>Total (${hist.length} sessions)</b></td><td style="text-align:right"><b>₹${totalAmt.toFixed(0)}</b></td><td style="text-align:right"><b>${totalKwh} kWh</b></td></tr>` : '';

  return { rows, totRow, totalAmt, totalKwh };
}

const hist = Array.from({ length: 10000 }).map((_, i) => ({
  created_at: new Date().toISOString(),
  station_name: `Station ${i}`,
  amount: (Math.random() * 100).toFixed(2),
  kwh: (Math.random() * 50).toFixed(2)
}));

function measure(name, fn) {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    fn(hist);
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)} ms`);
}

// Warmup
for (let i = 0; i < 10; i++) {
  downloadReportOld(hist);
  downloadReportNew(hist);
}

measure('Old', downloadReportOld);
measure('New', downloadReportNew);
