import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapScreen from '@/components/pl/MapScreen';

export default function StationPage() {
  const navigate = useNavigate();
  return <MapScreen onBack={() => navigate('/home')} user={null} token="" onHistAdd={() => {}} />;
}
