// front/src/pages/CompaniesList.tsx

import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';

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

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Liste des entreprises</h1>
        <LogoutButton />
      </div>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>
              Société
            </th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>
              Admin
            </th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>
              Email Admin
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
