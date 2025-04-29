import React, { useEffect, useState } from 'react';
import { Link, useNavigate }           from 'react-router-dom';
import Header                          from '../components/Header';

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
    <>
      <Header />
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            Bienvenue {user.nom} {user.prenom}
          </h1>
        </div>

        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Votre rôle est : <strong>{user.role}</strong>
        </p>

        <section style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          <Link to="/companies" style={{
              padding: '0.5rem 1rem',
              color: '#4f46e5',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
            • Voir toutes les entreprises
          </Link>
        </section>
      </div>
    </>
  );
}
