import { render, act, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import PayModal from '../components/pl/PayModal';
import { vi, test, expect, afterEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }) },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
        })
      })
    })
  }
}));

let renderCount = 0;
vi.mock('../components/pl/PayModal', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: function MockPayModal(props: any) {
      renderCount++;
      return actual.default(props);
    }
  };
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

test('PayModal charging animation render count benchmark (slow charging - 12000ms)', async () => {
  vi.useFakeTimers();

  const station = { id: 1, name: 'Test Station', price: 15, types: 'CCS2' };
  const { getByText } = render(
    <PayModal
      station={station}
      user={{}}
      token=""
      onClose={() => {}}
      onPaid={() => {}}
    />
  );

  const payButton = getByText(/I've Paid/i);
  await act(async () => {
    payButton.click();
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });

  expect(getByText('Payment Confirmed!')).toBeInTheDocument();

  // Change to slow charging speed to see the biggest difference.
  const slowButton = getByText('🐢');
  await act(async () => {
    slowButton.click();
  });

  renderCount = 0;

  // Let 1000ms pass in 50ms chunks.
  // The slow speed takes 12000ms.
  // In 1000ms, percentage should go from 0 to ~8 (1000/12000 * 100 = 8.33)
  // This should trigger ~9 renders.
  // Original `setInterval` approach with 50ms interval would STILL trigger 20 renders!
  for (let i = 0; i < 20; i++) {
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
  }

  console.log('Renders during slow charging animation (1000ms fake time):', renderCount);
  expect(renderCount).toBeLessThan(12);
  expect(renderCount).toBeGreaterThan(6);
});
