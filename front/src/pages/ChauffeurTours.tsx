import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function ChauffeurTours() {
  // ici vous pourrez récupérer via fetch vos tournées assignées au chauffeur
  const dummyTours = [
    { id: 't1', name: 'Tournée 1 – 3 arrêts' },
    { id: 't2', name: 'Tournée 2 – 5 arrêts' },
  ];

  return (
    <>
      <Header/>
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🛣️ Tournées du chauffeur</h1>
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
          {dummyTours.map(t => (
            <li key={t.id} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={`/chauffeur/tournees/${t.id}`}
                style={{
                  textDecoration: 'none',
                  color: '#4f46e5',
                  fontWeight: 'bold'
                }}
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
