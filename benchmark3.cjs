const { performance } = require('perf_hooks');

const hist = Array.from({ length: 1000 }).map((_, i) => ({
  created_at: new Date().toISOString(),
  station_name: `Station ${i}`,
  amount: (Math.random() * 100).toFixed(2),
  kwh: (Math.random() * 50).toFixed(2)
}));

function oldWay(hist) {
  const rows = hist.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>'
    : hist.map(h => `<tr><td>${new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${parseFloat(h.amount || 0).toFixed(0)}</td><td style="text-align:right">${h.kwh || 0} kWh</td></tr>`).join('');
  const totalAmt = hist.reduce((s, h) => s + parseFloat(h.amount || 0), 0);
  const totalKwh = hist.reduce((s, h) => s + (parseFloat(h.kwh) || 0), 0);
  return { rows, totalAmt, totalKwh };
}

function newWay(hist) {
  let rows = '';
  let totalAmt = 0;
  let totalKwh = 0;

  if (hist.length === 0) {
    rows = '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No sessions yet</td></tr>';
  } else {
    const dtf = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    for (let i = 0; i < hist.length; i++) {
      const h = hist[i];
      const amt = parseFloat(h.amount || 0);
      const kwh = parseFloat(h.kwh) || 0;
      totalAmt += amt;
      totalKwh += kwh;
      rows += `<tr><td>${dtf.format(new Date(h.created_at))}</td><td>${h.station_name || '—'}</td><td style="text-align:right">₹${amt.toFixed(0)}</td><td style="text-align:right">${kwh} kWh</td></tr>`;
    }
  }
  return { rows, totalAmt, totalKwh };
}

function measure(name, fn) {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    fn(hist);
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)} ms`);
}

measure('Old', oldWay);
measure('New', newWay);
