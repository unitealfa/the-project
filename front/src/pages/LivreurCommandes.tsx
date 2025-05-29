import React from 'react';
import Header from '../components/Header';

export default function LivreurCommandes() {
  // ici vous pourrez récupérer via fetch la liste des commandes à livrer
  const dummyCommands = [
    { id: 'c1', client: 'Client A', produits: 4 },
    { id: 'c2', client: 'Client B', produits: 2 },
  ];

  return (
    <>
      <Header/>
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚚 Commandes à livrer</h1>
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
          {dummyCommands.map(c => (
            <li key={c.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{c.client}</strong> — {c.produits} produits
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
