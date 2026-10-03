// Stations
export interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  av: number;
  tot: number;
  price: number;
  types: string;
  km?: number;
  distStr?: string;
  timeStr?: string;
}

export const STATIONS: Station[] = [
  { id: 1, name: 'Koramangala Station', lat: 12.9279, lng: 77.6271, av: 4, tot: 6, price: 18.5, types: 'CCS2 (50kW) & CHAdeMO' },
  { id: 2, name: 'Indiranagar Hub', lat: 12.9784, lng: 77.6408, av: 2, tot: 4, price: 16.0, types: 'CCS2 (50kW)' },
  { id: 3, name: 'HSR Layout Point', lat: 12.9116, lng: 77.6389, av: 6, tot: 6, price: 19.0, types: 'CHAdeMO & Type 2' },
  { id: 4, name: 'Whitefield Charge Hub', lat: 12.9698, lng: 77.7499, av: 3, tot: 8, price: 17.5, types: 'CCS2 (150kW)' },
  { id: 5, name: 'Marathahalli Point', lat: 12.9592, lng: 77.6974, av: 5, tot: 6, price: 18.0, types: 'CCS2 & CHAdeMO' },
  { id: 6, name: 'Electronic City Hub', lat: 12.8394, lng: 77.6769, av: 1, tot: 4, price: 15.5, types: 'Type 2 (22kW)' },
];

export const BLR = { lat: 12.9352, lng: 77.6245 };
