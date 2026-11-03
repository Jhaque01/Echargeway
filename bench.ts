import { callApi } from './src/lib/powerloop';

async function runBenchmark() {
  const start = performance.now();
  for (let i = 0; i < 5; i++) {
    try {
      await callApi('/auth/send-otp', 'POST', { phone: '1234567890' });
    } catch (e) {
      // ignore
    }
  }
  const end = performance.now();
  console.log(`Benchmark completed in ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
