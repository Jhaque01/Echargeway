const { performance } = require('perf_hooks');

const hist = Array.from({ length: 10000 }).map((_, i) => ({
  created_at: new Date().toISOString(),
  station_name: `Station ${i}`,
  amount: (Math.random() * 100).toFixed(2),
  kwh: (Math.random() * 50).toFixed(2)
}));

function oldWay(hist) {
  const rows = hist.map(h => h.station_name + h.amount + h.kwh).join('');
  const totalAmt = hist.reduce((s, h) => s + parseFloat(h.amount || 0), 0);
  const totalKwh = hist.reduce((s, h) => s + (parseFloat(h.kwh) || 0), 0);
  return { rows, totalAmt, totalKwh };
}

function newWay(hist) {
  let rows = '';
  let totalAmt = 0;
  let totalKwh = 0;
  for (let i = 0; i < hist.length; i++) {
    const h = hist[i];
    rows += h.station_name + h.amount + h.kwh;
    totalAmt += parseFloat(h.amount || 0);
    totalKwh += parseFloat(h.kwh || 0);
  }
  return { rows, totalAmt, totalKwh };
}

function measure(name, fn) {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    fn(hist);
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)} ms`);
}

measure('Old', oldWay);
measure('New', newWay);
