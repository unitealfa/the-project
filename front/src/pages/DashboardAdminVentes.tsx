// front/src/pages/DashboardAdminVentes.tsx
import React from 'react';
import Header from '../components/Header';

export default function DashboardAdminVentes() {
  const raw  = localStorage.getItem('user');
  const u    = raw ? JSON.parse(raw) as { nom:string; prenom:string; company?:string } : null;
  if (!u) return null;

  return (
    <>
      <Header/>
      <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
        <h1>Bonjour {u.prenom} {u.nom}</h1>
        <p>Vous êtes <strong>Administrateur&nbsp;des&nbsp;ventes</strong> à la société&nbsp;
           <strong>{u.company ?? '–'}</strong>.</p>

        <section style={{marginTop:'2rem'}}>
          <h2>📈  Suivi des comptes-clients</h2>
          <p style={{opacity:.7}}>Module en développement…</p>
        </section>
      </main>
    </>
  );
}
