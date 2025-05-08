// ✅ /src/pages/DashboardClient.tsx
import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  nom_client?: string;
  role: string;
}

export default function DashboardClient() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user: User | null = raw ? JSON.parse(raw) : null;
  const displayName = user?.nom || user?.nom_client || '';

  const consulterProduits = () => {
    navigate('/productclient');
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>
          Bienvenue,&nbsp;
          {displayName ? (
            <strong>{displayName}</strong>
          ) : (
            <span style={{ color: 'orange' }}>
              cher client 👋 (⚠️ nom non reçu)
            </span>
          )}
        </h1>
        <p>Votre tableau de bord fidélité et commandes arrive ici.</p>

        <button
          onClick={consulterProduits}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Consulter les produits
        </button>
      </main>
    </>
  );
}
