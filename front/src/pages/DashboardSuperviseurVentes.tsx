import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardSuperviseurVentes() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const u = raw ? JSON.parse(raw) as { nom: string; prenom: string; depot?: string } : null;
  if (!u) return null;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Bienvenue {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Superviseur des ventes</strong></p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          {/* Section Consultation des clients */}
          <section style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1a56db', marginBottom: '1rem' }}>👥 Consultation des clients</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Accédez à la liste complète des clients de votre dépôt</p>
            <button
              onClick={() => navigate('/clients')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
            >
              Liste des clients
            </button>
          </section>

          {/* Section Gestion des affectations */}
          <section style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1a56db', marginBottom: '1rem' }}>👥 Gestion des affectations</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Gérez les affectations des prévendeurs aux clients</p>
            <button
              onClick={() => navigate('/assign-prevendeurs')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
            >
              Affecter les prévendeurs
            </button>
          </section>
        </div>

        {/* Section Commandes récentes */}
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#1a56db', marginBottom: '1rem' }}>📦 Commandes récentes</h2>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => navigate('/commandes')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
            >
              Voir les commandes
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
