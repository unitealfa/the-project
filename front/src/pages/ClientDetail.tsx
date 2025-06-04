import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: {
    nom_gerant: string;
    telephone: string;
  };
  localisation: {
    adresse: string;
    ville: string;
    code_postal: string;
    region: string;
    coordonnees: {
      latitude: number;
      longitude: number;
    };
  };
  affectations: Array<{
    entreprise: string;
    depot: string;
  }>;
  pfp?: string;
  stats?: {
    totalAmount: number;
    orderCount: number;
    lastOrder: string | null;
  };
}

export default function ClientDetail() {
  const { id } = useParams();
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState('');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    fetch(`${apiBase}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setClient(data);
      })
      .catch(err => setError(err.message));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la suppression');
      }

      navigate('/clients');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (error) return <p style={{ padding: '2rem' }}>{error}</p>;
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

        <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
          <div style={infoGroup}>
            <h3 style={labelStyle}>Informations générales</h3>
            <p><strong>Nom du client :</strong> {client.nom_client}</p>
            <p><strong>Email :</strong> {client.email}</p>
          </div>

          <div style={infoGroup}>
            <h3 style={labelStyle}>Contact</h3>
            <p><strong>Nom du gérant :</strong> {client.contact.nom_gerant}</p>
            <p><strong>Téléphone :</strong> {client.contact.telephone}</p>
          </div>

          <div style={infoGroup}>
            <h3 style={labelStyle}>Localisation</h3>
            <p><strong>Adresse :</strong> {client.localisation.adresse}</p>
            <p><strong>Ville :</strong> {client.localisation.ville}</p>
            <p><strong>Code postal :</strong> {client.localisation.code_postal}</p>
            <p><strong>Région :</strong> {client.localisation.region}</p>
          </div>

          <div style={infoGroup}>
            <h3 style={labelStyle}>Statistiques des commandes</h3>
            <p><strong>Montant total des commandes :</strong> {client.stats?.totalAmount.toLocaleString() ?? 0} DA</p>
            <p><strong>Nombre de commandes :</strong> {client.stats?.orderCount ?? 0}</p>
            <p><strong>Dernière commande :</strong> {client.stats?.lastOrder ? new Date(client.stats.lastOrder).toLocaleDateString() : 'Aucune'}</p>
          </div>

          {user?.role === 'responsable depot' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate(`/clients/${id}/edit`)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const infoGroup = {
  padding: '1rem',
  backgroundColor: '#f9fafb',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
};

const labelStyle = {
  margin: '0 0 1rem 0',
  color: '#374151',
  fontSize: '1.1rem',
};
