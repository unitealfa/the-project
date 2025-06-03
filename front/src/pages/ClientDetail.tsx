import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function ClientDetail() {
  const { id } = useParams();
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiBase}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: any) => c._id === id);
        if (!found) throw new Error('Client introuvable');
        setClient(found);
        console.log('[🧪 DEBUG] Client reçu:', found);

      })
      .catch(err => setError(err.message));
  }, [id, apiBase, token]);

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!client) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <button
          onClick={() => navigate('/clients')}
          style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
        >
          ← Retour à la liste
        </button>
        <h1>👤 Détail du client</h1>

        {/* Affichage de la photo de profil si elle existe */}
        {client.pfp && (
          <div style={{ marginBottom: '2rem' }}>
            <img
              src={`${apiBase}/public/${client.pfp}`}
              alt="Photo de profil du client"
              style={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid #eee',
                background: '#fff'
              }}
            />
          </div>
        )}

        <ul style={{ lineHeight: 1.8 }}>
          <li><strong>Nom client :</strong> {client.nom_client}</li>
          <li><strong>Email :</strong> {client.email}</li>
          <li><strong>Nom gérant :</strong> {client.contact?.nom_gerant || '–'}</li>
          <li><strong>Téléphone :</strong> {client.contact?.telephone || '–'}</li>
          <li><strong>Adresse :</strong> {client.localisation?.adresse || '–'}, {client.localisation?.ville || '–'} ({client.localisation?.code_postal || '–'})</li>
          <li><strong>Région :</strong> {client.localisation?.region || '–'}</li>
          <li><strong>Coordonnées :</strong> {client.localisation?.coordonnees?.latitude ?? '–'}, {client.localisation?.coordonnees?.longitude ?? '–'}</li>
          <li><strong>Points fidélité :</strong> {client.fidelite_points ?? 0}</li>
          <li><strong>Montant total des commandes :</strong> {client.statistiques?.montant_total_commandes ?? 0} DA</li>
          <li><strong>Nombre de commandes :</strong> {client.statistiques?.nombre_commandes ?? 0}</li>
          <li><strong>Dernière commande :</strong> {
            client.statistiques?.derniere_commande
              ? new Date(client.statistiques.derniere_commande).toLocaleString()
              : 'Aucune'
          }</li>
        </ul>
      </main>
    </>
  );
}
