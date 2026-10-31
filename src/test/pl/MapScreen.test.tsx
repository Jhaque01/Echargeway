import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapScreen from '../../components/pl/MapScreen';

vi.mock('leaflet', () => {
  const L = {
    map: vi.fn().mockReturnValue({
      setView: vi.fn(),
      setZoom: vi.fn(),
      getZoom: vi.fn(),
      panTo: vi.fn(),
      remove: vi.fn(),
    }),
    tileLayer: vi.fn().mockReturnValue({
      addTo: vi.fn(),
    }),
    marker: vi.fn().mockImplementation(() => {
      const markerObj = {
        addTo: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        remove: vi.fn(),
        setIcon: vi.fn(),
      };
      return markerObj;
    }),
    divIcon: vi.fn(),
  };
  return { default: L };
});

describe('MapScreen Performance', () => {
  it('renders without crashing', () => {
    const { container } = render(<MapScreen onBack={() => {}} user={null} token="" />);
    expect(container).toBeDefined();
  });
});
