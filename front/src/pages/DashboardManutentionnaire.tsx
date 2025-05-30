// front/src/pages/DashboardManutentionnaire.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardManutentionnaire() {
  const raw = localStorage.getItem('user');
  const u   = raw ? JSON.parse(raw) as { nom:string; prenom:string } : null;
  if (!u) return null;

  return (
    <>
      <Header/>
      <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
        <h1>Bonjour {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Manutentionnaire</strong></p>

        <section style={{marginTop:'2rem'}}>
          <h2>📦  Missions de préparation</h2>
          <Link
            to="/tournees"
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Voir les tournées
          </Link>
        </section>
      </main>
    </>
  );
}
