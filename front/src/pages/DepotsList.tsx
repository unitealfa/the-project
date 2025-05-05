// front/src/pages/DepotsList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

interface Depot {
  _id: string;
  nom_depot: string;
  type_depot: string;
  capacite: number;
  date_creation: string;
  responsable_id?: { nom: string; prenom: string } | null;
}

export default function DepotsList() {
  const [list, setList] = useState<Depot[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/depots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((data: Depot[]) => setList(data))
      .catch((err) => setError(err.message));
  }, [apiBase, token]);

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1>Mes dépôts</h1>
          <Link
            to="/create-depot"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
          >
            ➕ Nouveau dépôt
          </Link>
        </div>

        <table
          style={{
            width: '100%',
            marginTop: '1rem',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Nom</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Type</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Capacité</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Responsable</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Créé le</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d._id}>
                <td style={{ padding: '0.5rem 0' }}>{d.nom_depot}</td>
                <td style={{ padding: '0.5rem 0' }}>{d.type_depot}</td>
                <td style={{ padding: '0.5rem 0' }}>{d.capacite}</td>
                <td style={{ padding: '0.5rem 0' }}>
                  {d.responsable_id
                    ? `${d.responsable_id.prenom} ${d.responsable_id.nom}`
                    : '—'}
                </td>
                <td style={{ padding: '0.5rem 0' }}>
                  {new Date(d.date_creation).toLocaleDateString()}
                </td>
                <td
                  style={{
                    padding: '0.5rem 0',
                    display: 'flex',
                    gap: '0.5rem',
                  }}
                >
                  <Link to={`/depots/${d._id}`} style={{ color: '#4f46e5' }}>
                    Voir
                  </Link>
                  <Link to={`/depots/${d._id}/edit`} style={{ color: '#4f46e5' }}>
                    Modifier
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm('Supprimer ce dépôt ?')) return;
                      const res = await fetch(`${apiBase}/depots/${d._id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        alert(err.message || `Erreur ${res.status}`);
                      } else {
                        setList((l) => l.filter((x) => x._id !== d._id));
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      padding: 0,
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
