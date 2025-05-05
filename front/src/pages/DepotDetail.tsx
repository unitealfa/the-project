// front/src/pages/DepotDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

interface ResponsableRef {
  nom: string;
  prenom: string;
  email: string;
  num: string; // téléphone
}

interface Depot {
  _id: string;
  nom_depot: string;
  type_depot: string;
  capacite: number;
  adresse: { rue: string; ville: string; code_postal: string; pays: string };
  coordonnees?: { latitude: number; longitude: number } | null;
  responsable_id?: ResponsableRef | null;
  date_creation: string;
}

export default function DepotDetail() {
  const { id } = useParams<{ id: string }>();
  const [depot, setDepot] = useState<Depot | null>(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/depots/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: Depot) => setDepot(data))
      .catch(err => setError(err.message));
  }, [apiBase, id, token]);

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', color: 'red' }}>{error}</div>
      </>
    );
  }

  if (!depot) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem' }}>Chargement…</div>
      </>
    );
  }

  const {
    nom_depot,
    type_depot,
    capacite,
    adresse,
    coordonnees,
    responsable_id,
    date_creation,
  } = depot;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Détails du dépôt</h1>

        <p><strong>Nom :</strong> {nom_depot}</p>
        <p><strong>Type :</strong> {type_depot}</p>
        <p><strong>Capacité :</strong> {capacite}</p>

        <fieldset style={{ margin: '1rem 0' }}>
          <legend>Adresse</legend>
          <p>{adresse.rue}, {adresse.ville}</p>
          <p>{adresse.code_postal} – {adresse.pays}</p>
        </fieldset>

        {coordonnees && (
          <fieldset style={{ margin: '1rem 0' }}>
            <legend>Coordonnées</legend>
            <p><strong>Lat :</strong> {coordonnees.latitude}</p>
            <p><strong>Lng :</strong> {coordonnees.longitude}</p>
          </fieldset>
        )}

        <fieldset style={{ margin: '1rem 0' }}>
          <legend>Responsable dépôt</legend>
          {responsable_id ? (
            <>
              <p><strong>Nom :</strong> {responsable_id.prenom} {responsable_id.nom}</p>
              <p><strong>Email :</strong> {responsable_id.email}</p>
              <p><strong>Téléphone :</strong> {responsable_id.num}</p>
            </>
          ) : (
            <p>— Aucun responsable assigné</p>
          )}
        </fieldset>

        <p>
          <em>Créé le {new Date(date_creation).toLocaleDateString()}</em>
        </p>
      </main>
    </>
  );
}
