export interface Station {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  available: number;
  total: number;
  type: string;
  rating: number;
}

export const STATIONS: Station[] = [
  { id: 1, name: 'MG Road Station', address: 'MG Road, Bangalore', lat: 12.9716, lng: 77.5946, price: 18, available: 3, total: 6, type: 'DC Fast', rating: 4.5 },
  { id: 2, name: 'Koramangala Hub', address: '4th Block, Koramangala', lat: 12.9352, lng: 77.6245, price: 15, available: 5, total: 8, type: 'AC Level 2', rating: 4.2 },
  { id: 3, name: 'Whitefield Plaza', address: 'ITPL Road, Whitefield', lat: 12.9698, lng: 77.7500, price: 20, available: 2, total: 4, type: 'DC Fast', rating: 4.8 },
  { id: 4, name: 'Indiranagar Charge', address: '100ft Road, Indiranagar', lat: 12.9784, lng: 77.6408, price: 16, available: 4, total: 6, type: 'AC Level 2', rating: 4.0 },
  { id: 5, name: 'Electronic City Hub', address: 'Phase 1, Electronic City', lat: 12.8456, lng: 77.6603, price: 22, available: 1, total: 5, type: 'DC Fast', rating: 4.6 },
  { id: 6, name: 'HSR Layout Point', address: 'Sector 3, HSR Layout', lat: 12.9116, lng: 77.6474, price: 14, available: 6, total: 8, type: 'AC Level 2', rating: 3.9 },
];
