import React, { useEffect, useState } from 'react';
import { useNavigate }                  from 'react-router-dom';
import Header                           from '../components/Header';

interface Depot {
  _id: string;
  nom_depot: string;
  type_depot: string;
  capacite: number;
  date_creation: string;
}

export default function DepotsList() {
  const [list, setList]   = useState<Depot[]>([]);
  const [error, setError] = useState('');
  const navigate          = useNavigate();
  const token             = localStorage.getItem('token') || '';
  const apiBase           = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/depots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: Depot[]) => setList(data))
      .catch(err => setError(err.message));
  }, [apiBase, token]);

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
          <h1 style={{ margin: 0 }}>Mes dépôts</h1>
        </div>

        <button
          onClick={() => navigate('/create-depot')}
          style={{
            margin: '1rem 0',
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ➕ Nouveau dépôt
        </button>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Nom', 'Type', 'Capacité', 'Créé le'].map(header => (
                <th
                  key={header}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '2px solid #4f46e5',
                    textAlign: 'left',
                    backgroundColor: '#f3f4f6',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((d, i) => (
              <tr
                key={d._id}
                style={{
                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb',
                }}
              >
                <td style={{ padding: '0.75rem 0' }}>{d.nom_depot}</td>
                <td style={{ padding: '0.75rem 0' }}>{d.type_depot}</td>
                <td style={{ padding: '0.75rem 0' }}>{d.capacite}</td>
                <td style={{ padding: '0.75rem 0' }}>
                  {new Date(d.date_creation).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
