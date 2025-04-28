// front/src/pages/DashboardSuperAdmin.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import LogoutButton                     from '../components/LogoutButton';

interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

export default function DashboardSuperAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/', { replace: true });
      return;
    }
    setUser(JSON.parse(raw));
  }, [navigate]);

  if (!user) return <p>Chargement…</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
          Bienvenue {user.nom} {user.prenom}
        </h1>
        <LogoutButton />
      </div>

      <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
        Votre rôle est : <strong>{user.role}</strong>
      </p>

      <section style={{ marginTop: '2rem' }}>
        <Link
          to="/create-company"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#4f46e5',
            color: '#fff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          ➕ Créer une nouvelle entreprise
        </Link>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Actions rapides</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link to="/companies" style={{ color: '#4f46e5' }}>
              • Voir toutes les entreprises
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
