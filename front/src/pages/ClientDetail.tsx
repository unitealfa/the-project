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
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
          <button
            onClick={() => navigate('/clients')}
            style={{
              marginBottom: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem'
            }}
          >
            ← Retour à la liste
          </button>

          <h1 style={{
            color: '#1a1a1a',
            fontSize: '2rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #1a1a1a',
            paddingBottom: '0.5rem'
          }}>Détail du client</h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {client.pfp ? (
              <img
                src={`${apiBase}/public/${client.pfp}`}
                alt="Photo de profil du client"
                style={{
                  width: 150,
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #1a1a1a',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  background: '#fafafa',
                }}
              />
            ) : (
              <div style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '3px solid #e0e0e0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                color: '#bbb',
                fontWeight: 700,
                userSelect: 'none',
              }}>
                {client.nom_client?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}>{client.nom_client}</p>
              <p style={{
                color: '#666',
                fontSize: '1.1rem'
              }}>{client.email}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Contact</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Nom du gérant :</strong><br/>
                <span style={{ color: '#666' }}>{client.contact.nom_gerant}</span>
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Téléphone :</strong><br/>
                <span style={{ color: '#666' }}>{client.contact.telephone}</span>
              </p>
            </fieldset>

            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Localisation</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Adresse :</strong><br/>
                <span style={{ color: '#666' }}>{client.localisation.adresse}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Ville :</strong><br/>
                <span style={{ color: '#666' }}>{client.localisation.ville}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Code postal :</strong><br/>
                <span style={{ color: '#666' }}>{client.localisation.code_postal}</span>
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Région :</strong><br/>
                <span style={{ color: '#666' }}>{client.localisation.region}</span>
              </p>
            </fieldset>

            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa',
              gridColumn: '1 / -1'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Statistiques des commandes</legend>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem'
              }}>
                <div>
                  <strong style={{ color: '#1a1a1a' }}>Montant total :</strong><br/>
                  <span style={{ color: '#666' }}>{client.stats?.totalAmount.toLocaleString() ?? 0} DA</span>
                </div>
                <div>
                  <strong style={{ color: '#1a1a1a' }}>Nombre de commandes :</strong><br/>
                  <span style={{ color: '#666' }}>{client.stats?.orderCount ?? 0}</span>
                </div>
                <div>
                  <strong style={{ color: '#1a1a1a' }}>Dernière commande :</strong><br/>
                  <span style={{ color: '#666' }}>{client.stats?.lastOrder ? new Date(client.stats.lastOrder).toLocaleDateString() : 'Aucune'}</span>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
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
