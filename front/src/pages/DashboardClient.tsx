import React from 'react';
import Header from '../components/Header';

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  nom_client?: string;
  role: string;
}

export default function DashboardClient() {
  // Récupération de l'utilisateur
  const raw = localStorage.getItem('user');
  const user: User | null = raw ? JSON.parse(raw) : null;

  // Affichage du nom interne ou du nom client
  const displayName = user?.nom || user?.nom_client || '';

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
      </main>
    </>
  );
}
