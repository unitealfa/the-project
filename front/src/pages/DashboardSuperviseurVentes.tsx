import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardSuperviseurVentes() {
  const raw = localStorage.getItem('user');
  const u   = raw ? JSON.parse(raw) as { nom:string; prenom:string; depot?: string } : null;
  if (!u) return null;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Bonjour {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Superviseur&nbsp;des&nbsp;ventes</strong></p>

        <section style={{ marginTop: '2rem' }}>
          <h2>📊 KPI Pré-vente</h2>
          <p style={{ opacity: .7 }}>Module en développement…</p>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>📦 Gestion des commandes</h2>
          <Link
            to="/commandes"
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
            Les commandes
          </Link>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>👥 Gestion des clients</h2>
          <Link
            to={`/clients?depot=${u.depot}`}
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Voir les clients du dépôt
          </Link>
        </section>
      </main>
    </>
  );
}
