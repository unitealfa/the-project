// src/pages/DashboardClient.tsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import AdvertisementFrame from '../components/AdvertisementFrame';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  nom_client?: string;
  role: string;
  affectations?: { entreprise: string }[];
}

export default function DashboardClient() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user: User | null = raw ? JSON.parse(raw) : null;

  const displayName = user?.nom || user?.nom_client || '';
  const companyIds = user?.affectations
    ?.map(a => a.entreprise)
    .filter(id => !!id) || [];

  // État pour savoir s'il existe au moins une pub
  const [hasAds, setHasAds] = useState<boolean | null>(null);

  // On vérifie côté back si ces entreprises ont des pubs
  useEffect(() => {
    if (companyIds.length === 0) {
      setHasAds(false);
      return;
    }
    Promise.all(
      companyIds.map(id =>
        apiFetch(`/ads/company/${id}`)
          .then(r => r.json())
          .catch(() => [] as any[])
      )
    )
      .then(lists => {
        const all = lists.flat();
        setHasAds(all.length > 0);
      })
      .catch(() => setHasAds(false));
  }, [companyIds]);

  const consulterProduits = () => navigate('/productclient');
  const consulterHistorique = () => navigate('/historiqueorders');

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

        {/* Cas 1 : pas d’entreprises */}
        {companyIds.length === 0 && (
          <p style={{ margin: '2rem 0', color: '#666' }}>
            Vous n’êtes affecté à aucune entreprise pour le moment.
          </p>
        )}

        {/* Cas 2 : on attend la réponse */}
        {companyIds.length > 0 && hasAds === null && (
          <p style={{ margin: '2rem 0', color: '#666' }}>
            Chargement des publicités…
          </p>
        )}

        {/* Cas 3 : entreprises sans pubs */}
        {companyIds.length > 0 && hasAds === false && (
          <p style={{ margin: '2rem 0', color: '#666' }}>
            Aucune publicité disponible pour vos entreprises.
          </p>
        )}

        {/* Cas 4 : on a des pubs */}
        {companyIds.length > 0 && hasAds && (
          <AdvertisementFrame companyIds={companyIds} />
        )}

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={consulterProduits}
            style={{
              marginRight: '1rem',
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
          <button
            onClick={consulterHistorique}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Historique des commandes
          </button>
        </div>
      </main>
    </>
  );
}
