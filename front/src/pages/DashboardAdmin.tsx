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

const linkStyle = {
  padding: '0.5rem 1rem',
  color: '#4f46e5',
  textDecoration: 'none',
  fontWeight: '500',
};

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
  if (error) return <div style={{ padding: '1rem', color: 'red' }}>{error}</div>;
  if (!user || !company) return null;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ marginBottom: "1rem" }}>Tableau de bord administrateur</h1>
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button
              onClick={() => navigate("/admin/stats")}
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
              Statistiques globales
            </button>
          </div>

          <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Tableau de bord – Admin de {company.nom_company}</h1>
            <p>
              Bienvenue <strong>{user.nom} {user.prenom}</strong>
            </p>
            <p>
              Votre rôle est : <strong>{user.role}</strong>
            </p>

            <section
              style={{
                marginTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <Link to="/depots" style={linkStyle}>
                • Voir mes dépôts
              </Link>
              <Link to="/clients" style={linkStyle}>
                • Consulter tous les clients
              </Link>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
