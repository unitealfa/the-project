// front/src/pages/DashboardGestionStock.tsx
import React from 'react';
import { Link } from 'react-router-dom';  // ← on importe Link
import Header from '../components/Header';

export default function DashboardGestionStock() {
  const raw = localStorage.getItem('user');
  const u = raw ? JSON.parse(raw) as { nom: string; prenom: string } : null;
  if (!u) return null;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Bonjour {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Gestionnaire&nbsp;de&nbsp;stock</strong></p>

        <section style={{ marginTop: '2rem' }}>
          <h2>📦 Gestion des produits</h2>
          <p style={{ opacity: .7 }}>
            Pour créer, lire, mettre à jour ou supprimer des produits,&nbsp;
            <Link
              to="/gestion-produit"
              style={{
                textDecoration: 'none',
                color: '#fff',
                backgroundColor: '#007bff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Gérer les produits
            </Link>
          </p>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>🏷️ Mouvement des marchandises</h2>
          <p style={{ opacity: .7 }}>Module en développement…</p>
        </section>
      </main>
    </>
  );
}
