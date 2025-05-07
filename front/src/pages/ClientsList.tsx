import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: {
    nom_gerant: string;
    telephone: string;
  };
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const depot = query.get('depot') || (user?.role === 'responsable depot' ? user?.depot : null);
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const url = depot
      ? `${apiBase}/clients?depot=${depot}`
      : `${apiBase}/clients`;

    console.log('➡️ Appel API clients pour dépôt:', depot); // DEBUG

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setClients)
      .catch(err => setError(err.message));
  }, [depot, apiBase, token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression de ce client ?')) return;
    try {
      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setClients(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>📋 Liste des clients {depot && 'du dépôt'}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {user?.role === 'responsable depot' && (
          <button
            onClick={() => navigate('/clients/add')}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ➕ Ajouter un client
          </button>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={th}>Nom client</th>
                <th style={th}>Email</th>
                <th style={th}>Gérant</th>
                <th style={th}>Téléphone</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client._id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={td}>{client.nom_client}</td>
                  <td style={td}>{client.email}</td>
                  <td style={td}>{client.contact.nom_gerant}</td>
                  <td style={td}>{client.contact.telephone}</td>
                  <td style={td}>
                    <button
                      onClick={() => navigate(`/clients/${client._id}`)}
                      style={actionBtn}
                    >
                      👁️ Voir
                    </button>
                    {user?.role === 'responsable depot' && (
                      <>
                        <button
                          onClick={() => navigate(`/clients/edit/${client._id}`)}
                          style={actionBtn}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          style={{ ...actionBtn, color: 'red' }}
                        >
                          🗑️ Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

const th = {
  padding: '0.75rem',
  textAlign: 'left' as const,
  borderBottom: '2px solid #ddd',
};

const td = {
  padding: '0.75rem',
};

const actionBtn = {
  marginRight: '0.5rem',
  background: 'none',
  border: 'none',
  color: '#3b82f6',
  cursor: 'pointer',
  fontSize: '1rem',
};
