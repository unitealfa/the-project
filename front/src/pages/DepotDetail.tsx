import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  coordonnees?: {
    latitude: number;
    longitude: number;
  } | null;
  responsable_id?: ResponsableRef | null;
  date_creation: string;
}

export default function DepotDetail() {
  const { id } = useParams<{ id: string }>();
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepot = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/api/depots/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        const d: Depot = await res.json();
        setDepot(d);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching depot:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchDepot();
    }
  }, [apiBase, id, token]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <p>Chargement...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>
          </div>
        </main>
      </>
    );
  }

  if (!depot) {
    return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <p>Dépôt non trouvé.</p>
          </div>
        </main>
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
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: 'calc(100vh - 64px)', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          <button
            onClick={() => navigate('/depots')}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              marginBottom: '2rem',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            ← Retour à la liste
          </button>

          <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            Détails du dépôt : {nom_depot}
          </h1>

          <div style={{
             border: '1px solid #e0e0e0',
             borderRadius: '8px',
             padding: '1.5rem',
             backgroundColor: '#fff',
             boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
             marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Informations Générales</h2>
            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Nom :</strong> <span style={{ color: '#333' }}>{nom_depot}</span></p>
            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Type :</strong> <span style={{ color: '#333' }}>{type_depot}</span></p>
            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Capacité :</strong> <span style={{ color: '#333' }}>{capacite}</span></p>
            <p><strong style={{ color: '#555' }}>Créé le :</strong> <span style={{ color: '#333' }}>{new Date(date_creation).toLocaleDateString()}</span></p>
          </div>

          <div style={{
             border: '1px solid #e0e0e0',
             borderRadius: '8px',
             padding: '1.5rem',
             backgroundColor: '#fff',
             boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
             marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Adresse</h2>
            <p style={{ marginBottom: '0.5rem', color: '#333' }}>{adresse.rue}, {adresse.ville}</p>
            <p style={{ color: '#333' }}>{adresse.code_postal} – {adresse.pays}</p>
          </div>

          {coordonnees && (
             <div style={{
               border: '1px solid #e0e0e0',
               borderRadius: '8px',
               padding: '1.5rem',
               backgroundColor: '#fff',
               boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
               marginBottom: '2rem'
            }}>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Coordonnées</h2>
              <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Latitude :</strong> <span style={{ color: '#333' }}>{coordonnees.latitude}</span></p>
              <p><strong style={{ color: '#555' }}>Longitude :</strong> <span style={{ color: '#333' }}>{coordonnees.longitude}</span></p>
            </div>
          )}

          <div style={{
             border: '1px solid #e0e0e0',
             borderRadius: '8px',
             padding: '1.5rem',
             backgroundColor: '#fff',
             boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
             marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Responsable dépôt</h2>
            {responsable_id ? (
              <>
                <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Nom :</strong> <span style={{ color: '#333' }}>{responsable_id.prenom} {responsable_id.nom}</span></p>
                <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Email :</strong> <span style={{ color: '#333' }}>{responsable_id.email}</span></p>
                <p><strong style={{ color: '#555' }}>Téléphone :</strong> <span style={{ color: '#333' }}>{responsable_id.num}</span></p>
              </>
            ) : (
              <p style={{ color: '#333' }}>— Aucun responsable assigné</p>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
