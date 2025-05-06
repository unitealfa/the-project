import React from 'react';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#4f46e5';

export default function Header() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user = raw ? (JSON.parse(raw) as { nom: string; prenom: string; role: string; company?: string; }) : null;
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.25rem',
      background: ACCENT,
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ margin: 0, fontSize: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}>
        Routimize
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <span>
          Bonjour <strong>{user.nom} {user.prenom}</strong>{' '}
          <em style={{ opacity: 0.8 }}>({user.role})</em>
        </span>

        <button onClick={() => navigate('/dashboard')}
                style={{
                  padding: '.35rem .9rem',
                  background: '#fff',
                  color: ACCENT,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
          Tableau de bord
        </button>
        <button onClick={() => { localStorage.clear(); navigate('/', { replace: true }); }}
                style={{
                  padding: '.35rem .9rem',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,.8)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
