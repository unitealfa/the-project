// front/src/pages/DashboardPreVendeur.tsx
import React from 'react';
import Header from '../components/Header';

export default function DashboardPreVendeur() {
  const raw = localStorage.getItem('user');
  const u   = raw ? JSON.parse(raw) as { nom:string; prenom:string } : null;
  if (!u) return null;

  return (
    <>
      <Header/>
      <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
        <h1>Bienvenue {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Pré-vendeur</strong></p>

        <section style={{marginTop:'2rem'}}>
          <h2>🗒️  Itinéraire de prospection</h2>
          <p style={{opacity:.7}}>Module en développement…</p>
        </section>
      </main>
    </>
  );
}
