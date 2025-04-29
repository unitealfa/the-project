// front/src/pages/CompaniesList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

interface Company {
  _id: string;
  nom_company: string;
  admin: {
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

export default function CompaniesList() {
  const [list, setList] = useState<Company[]>([]);
  const [error, setError] = useState<string>('');
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: Company[]) => setList(data))
      .catch(err => setError(err.message));
  }, [apiBase, token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette entreprise ?')) {
      return;
    }
    try {
      const res = await fetch(`${apiBase}/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Erreur ${res.status}`);
      }
      // Retirer de la liste locale
      setList(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(`Impossible de supprimer : ${err.message}`);
    }
  };

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '1rem' }}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Liste des entreprises</h1>
          <Link
            to="/create-company"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: '0.25rem',
              textDecoration: 'none'
            }}
          >
            ➕ Nouvelle entreprise
          </Link>
        </div>

        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>
                Société
              </th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>
                Admin
              </th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>
                Email Admin
              </th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c._id}>
                <td style={{ padding: '0.5rem 0' }}>{c.nom_company}</td>
                <td style={{ padding: '0.5rem 0' }}>
                  {c.admin ? `${c.admin.nom} ${c.admin.prenom}` : '—'}
                </td>
                <td style={{ padding: '0.5rem 0' }}>
                  {c.admin?.email ?? '—'}
                </td>
                <td style={{ padding: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/companies/${c._id}`} style={{ textDecoration: 'none', color: '#4f46e5' }}>
                    Voir
                  </Link>
                  <Link to={`/companies/${c._id}/edit`} style={{ textDecoration: 'none', color: '#4f46e5' }}>
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
