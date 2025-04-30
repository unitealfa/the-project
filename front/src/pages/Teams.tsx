// front/src/pages/Teams.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function Teams() {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    flex: '1',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  };

  const handleCardClick = (team: string) => {
    // rediriger vers une page dédiée (à implémenter)
    navigate(`/teams/${team.toLowerCase()}`);
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Gestion des équipes</h1>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          {['Livraison', 'Prévente', 'Entrepôt'].map(team => (
            <div
              key={team}
              style={cardStyle}
              onClick={() => handleCardClick(team)}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <h2>Équipe {team}</h2>
              <p>Voir / gérer les membres de l’équipe {team.toLowerCase()}.</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
