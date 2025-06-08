import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Company { _id: string; nom_company: string; pfp?: string; }

export default function LoyaltyChooseCompany() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const api = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${api}/loyalty/available`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: Company[]) => {
        setCompanies(data);
      })
      .catch(console.error);
  }, [api, token]);

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Mes Programmes Fidélité</h1>
        {companies.length === 0 && (
          <p>Vous n’êtes affilié à aucun programme actif.</p>
        )}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {companies.map(c => (
            <div
              key={c._id}
              onClick={() => navigate(`/loyalty-client/${c._id}`)}
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                padding: '1rem',
                textAlign: 'center',
                width: 150
              }}
            >
              {c.pfp
                ? <img src={`${api}/${c.pfp}`} alt={c.nom_company} style={{ width: '100%', height: 'auto' }} />
                : <div style={{ width: '100%', height: 80, background: '#eee' }} />
              }
              <p style={{ marginTop: 8 }}>{c.nom_company || 'Sans nom'}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}