import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  company: string;
}

interface Company {
  _id: string;
  nom_company: string;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!raw || !token) {
      navigate('/', { replace: true });
      return;
    }

    const u: User = JSON.parse(raw);
    setUser(u);

    (async () => {
      try {
        const res = await fetch(`${apiBase}/companies/${u.company}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const c: Company = await res.json();
        setCompany(c);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, apiBase]);

  if (loading) return <p style={{ padding: '1rem' }}>Chargement…</p>;
  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }
  if (!user || !company) return null;

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            Tableau de bord – Admin de {company.nom_company}
          </h1>
        </div>

        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Bienvenue <strong>{user.nom} {user.prenom}</strong>
        </p>
        <p>
          Votre rôle est : <strong>{user.role}</strong>
        </p>

        <section style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/depots" style={{
            padding: '0.5rem 1rem',
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            • Voir mes dépôts
          </Link>
        </section>
      </div>
    </>
  );
}
