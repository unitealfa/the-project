// front/src/pages/DashboardChauffeur.tsx
import React from 'react';
import Header from '../components/Header';

export default function DashboardChauffeur() {
  const raw  = localStorage.getItem('user');
  const u    = raw ? JSON.parse(raw) as {
    nom:string; prenom:string; companyName?:string;
  } : null;
  if (!u) return null;

  return (
    <>
      <Header/>
      <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
        <h1>Bienvenue {u.prenom} {u.nom}</h1>
        <p>Rôle&nbsp;: <strong>Chauffeur</strong></p>

        {/* 🆕  affiche la société si connue */}
        <p>Société&nbsp;: <strong>{u.companyName ?? '—'}</strong></p>

        <section style={{marginTop:'2rem'}}>
          <h2>🛣️  Planning de trajets</h2>
          <p style={{opacity:.7}}>Module en développement…</p>
        </section>
      </main>
    </>
  );
}
