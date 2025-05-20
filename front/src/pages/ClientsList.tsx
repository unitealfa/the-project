// 📁 src/pages/ClientsList.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate }   from 'react-router-dom';
import Header                         from '../components/Header';
import { apiFetch }                   from '../utils/api';

interface Client {
  _id:         string;
  nom_client:  string;
  email:       string;
  contact:     { nom_gerant: string; telephone: string };
  affectations:{ entreprise: string; depot: string }[];
}

interface Prevendeur {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error,   setError]   = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevendeurs, setPrevendeurs] = useState<Prevendeur[]>([]);
  const [loadingPrevendeurs, setLoadingPrevendeurs] = useState(false);
  const navigate = useNavigate();
  const query    = useQuery();

  const rawUser = localStorage.getItem('user');
  const user    = rawUser ? JSON.parse(rawUser) : null;

  // on choisit le dépôt depuis le query param ou le user
  const depot = user?.depot || query.get('depot') || (user?.role === 'responsable depot' ? user.depot : null);

  const token   = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const url = depot
      ? `${apiBase}/clients?depot=${depot}`
      : `${apiBase}/clients`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setClients)
      .catch(err => setError(err.message));
  }, [depot, apiBase, token, user?.company]);

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

  const th = { padding: '.75rem', textAlign: 'left' as const, borderBottom: '2px solid #ddd' };
  const td = { padding: '.75rem' };
  const actionBtn = {
    marginRight: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '1rem',
  };

  const loadPrevendeurs = async () => {
    if (!depot) {
      setError('Aucun dépôt associé à votre compte');
      return;
    }
    setLoadingPrevendeurs(true);
    try {
      const response = await apiFetch(`/teams/prevente/${depot}`);
      const data = await response.json();
      
      if (!data || !data.prevente) {
        throw new Error('Format de réponse invalide');
      }
      
      setPrevendeurs(data.prevente);
      
      if (data.prevente.length === 0) {
        setError('Aucun prévendeur trouvé dans ce dépôt');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des prévendeurs');
    } finally {
      setLoadingPrevendeurs(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isModalOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    content: {
      position: 'relative' as const,
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '80%',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    closeButton: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadPrevendeurs();
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>📋 Liste des clients {depot && `du dépôt`}</h1>
          {user?.role === 'Superviseur des ventes' && (
            <button
              onClick={handleOpenModal}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '1rem',
              }}
            >
              👥 Voir les prévendeurs
            </button>
          )}
        </div>
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
                <th style={th}>Entreprise</th>
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
                    {client.affectations[0]?.entreprise ?? '—'}
                  </td>
                  <td style={td}>
                    <button onClick={() => navigate(`/clients/${client._id}`)} style={actionBtn}>
                      👁️ Voir
                    </button>
                    {user?.role === 'responsable depot' && (
                      <>
                        <button onClick={() => navigate(`/clients/edit/${client._id}`)} style={actionBtn}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDelete(client._id)} style={{ ...actionBtn, color: 'red' }}>
                          🗑️ Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal pour la liste des prévendeurs */}
        {isModalOpen && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={modalStyles.closeButton}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>Liste des prévendeurs du dépôt</h2>
              
              {loadingPrevendeurs ? (
                <p>Chargement des prévendeurs...</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th style={th}>Nom</th>
                      <th style={th}>Prénom</th>
                      <th style={th}>Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prevendeurs.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={td}>{p.nom}</td>
                        <td style={td}>{p.prenom}</td>
                        <td style={td}>{p.role}</td>
                      </tr>
                    ))}
                    {prevendeurs.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>
                          Aucun prévendeur trouvé dans ce dépôt.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
