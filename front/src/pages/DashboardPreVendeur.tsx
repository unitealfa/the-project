// front/src/pages/DashboardPreVendeur.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardPreVendeur() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const u   = raw ? JSON.parse(raw) as { nom:string; prenom:string; depot?: string } : null;
  if (!u) return null;

  const handleViewClients = () => {
    if (!u.depot) {
      alert('Aucun dépôt associé à votre compte');
      return;
    }
    navigate('/clients');
  };

  return (
    <>
      <Header/>
      <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
        <h1>Bienvenue {u.prenom} {u.nom}</h1>
        <p>Rôle : <strong>Pré-vendeur</strong></p>

        <section style={{marginTop:'2rem'}}>
          <h2>🗒️  Itinéraire de prospection</h2>
          <p style={{opacity:.7}}>Module en développement…</p>
        </section>

        <section style={{marginTop:'2rem'}}>
          <h2>👥 Clients du dépôt</h2>
          <button 
            onClick={handleViewClients}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Voir la liste des clients
          </button>
        </section>
      </main>
    </>
  );
}
