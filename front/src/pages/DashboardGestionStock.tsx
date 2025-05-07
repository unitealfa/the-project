import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardGestionStock() {
  const [user, setUser] = useState<{ nom: string; prenom: string; depot?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      setError('Aucun utilisateur trouvé dans localStorage.');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      console.log('Utilisateur connecté :', parsed);

      if (!parsed.depot) {
        setError('⚠️ Le champ "depot" est manquant dans les données utilisateur.');
      } else {
        setUser(parsed);
      }
    } catch (err) {
      console.error('Erreur lors de l’analyse du localStorage :', err);
      setError('Erreur de lecture du localStorage.');
    }
  }, []);

  if (!user) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', color: 'red' }}>
          <h2>Erreur</h2>
          <p>{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Bonjour {user.prenom} {user.nom}</h1>
        <p>Rôle : <strong>Gestionnaire&nbsp;de&nbsp;stock</strong></p>

        <section style={{ marginTop: '2rem' }}>
          <h2>🏬 Produits de votre dépôt</h2>
          <p style={{ opacity: .7 }}>
            Pour gérer les produits de votre dépôt,&nbsp;
            <Link
              to={`/gestion-depot/${user.depot}`}
              style={{
                textDecoration: 'none',
                color: '#fff',
                backgroundColor: '#28a745',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Gérer les produits de mon dépôt
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
