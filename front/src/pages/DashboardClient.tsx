import React from 'react';

export default function DashboardClient() {
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  const nom = user?.nom;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>
        Bienvenue, {nom ? nom : <span style={{ color: 'orange' }}>cher client 👋 (⚠️ nom non reçu)</span>}
      </h1>
      <p>Votre tableau de bord fidélité et commandes arrive ici.</p>
    </main>
  );
}
