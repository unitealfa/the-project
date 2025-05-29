import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface Stop {
  _id: string;
  clientName: string;
  latitude: number;
  longitude: number;
}

export default function ChauffeurTours() {
  const [stops, setStops] = useState<Stop[]>([]);
  const chauffeurId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/chauffeurs/${chauffeurId}/stops`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(setStops)
      .catch(console.error);
  }, [apiBase, chauffeurId]);

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🛣️ Arrêts assignés</h1>
        <ul>
          {stops.map(s => (
            <li key={s._id}>
              {s.clientName} — ({s.latitude}, {s.longitude})
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
