import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: { nom_gerant: string; telephone: string };
  affectations: Array<{
    depot: string;
    prevendeur_id?: string;
  }>;
}

interface Prevendeur {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
}

export default function AssignPrevendeurs() {
  const [clients, setClients] = useState<Client[]>([]);
  const [prevendeurs, setPrevendeurs] = useState<Prevendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const depot = user?.depot;

  useEffect(() => {
    if (!depot) {
      setError('Aucun dépôt associé à votre compte');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Charger les clients
        const clientsRes = await apiFetch(`/clients?depot=${depot}`);
        if (!clientsRes.ok) throw new Error('Erreur lors du chargement des clients');
        const clientsData = await clientsRes.json();
        setClients(clientsData);

        // Charger les prévendeurs
        const prevendeursRes = await apiFetch(`/api/teams/${depot}?role=prevente`);
        if (!prevendeursRes.ok) throw new Error('Erreur lors du chargement des prévendeurs');
        const prevendeursData = await prevendeursRes.json();
        console.log('Données des prévendeurs:', prevendeursData); // Debug

        // Vérifier la structure des données et filtrer les prévendeurs
        const teamMembers = prevendeursData.prevente || [];
        console.log('Membres de l\'équipe:', teamMembers); // Debug

        const filteredPrevendeurs = teamMembers.filter((p: any) => {
          console.log('Vérification du membre:', p); // Debug
          return p.role === 'prevente' || p.role === 'Pré-vendeur';
        });

        console.log('Prévendeurs filtrés:', filteredPrevendeurs); // Debug
        setPrevendeurs(filteredPrevendeurs);
      } catch (err: any) {
        console.error('Erreur:', err); // Debug
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [depot]);

  const handleAssignPrevendeur = async (clientId: string, prevendeurId: string) => {
    try {
      const res = await apiFetch(`/clients/${clientId}/assign-prevendeur`, {
        method: 'POST',
        body: JSON.stringify({ prevendeurId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'affectation du prévendeur');
      }

      // Mettre à jour la liste des clients
      setClients(prev => prev.map(client => {
        if (client._id === clientId) {
          return {
            ...client,
            affectations: client.affectations.map(aff => {
              if (aff.depot === depot) {
                return { ...aff, prevendeur_id: prevendeurId };
              }
              return aff;
            }),
          };
        }
        return client;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnassignPrevendeur = async (clientId: string) => {
    try {
      const res = await apiFetch(`/clients/${clientId}/unassign-prevendeur`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la désaffectation du prévendeur');
      }

      // Mettre à jour la liste des clients
      setClients(prev => prev.map(client => {
        if (client._id === clientId) {
          return {
            ...client,
            affectations: client.affectations.map(aff => {
              if (aff.depot === depot) {
                return { ...aff, prevendeur_id: undefined };
              }
              return aff;
            }),
          };
        }
        return client;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getPrevendeurName = (prevendeurId: string | undefined) => {
    if (!prevendeurId) return 'Non assigné';
    const prevendeur = prevendeurs.find(p => p._id === prevendeurId);
    return prevendeur ? `${prevendeur.prenom} ${prevendeur.nom}` : 'Inconnu';
  };

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nom = client.nom_client.toLowerCase();
    const email = client.email.toLowerCase();
    const telephone = client.contact.telephone.toLowerCase();
    return nom.includes(term) || email.includes(term) || telephone.includes(term);
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>👥 Affectation des prévendeurs aux clients</h1>
        </div>

        {/* Barre de recherche */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Liste des clients avec leurs prévendeurs assignés */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Client</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Téléphone</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Prévendeur actuel</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '.75rem' }}>{client.nom_client}</td>
                  <td style={{ padding: '.75rem' }}>{client.email}</td>
                  <td style={{ padding: '.75rem' }}>{client.contact.telephone}</td>
                  <td style={{ padding: '.75rem' }}>
                    {getPrevendeurName(client.affectations?.[0]?.prevendeur_id)}
                  </td>
                  <td style={{ padding: '.75rem' }}>
                    <select
                      value={client.affectations?.[0]?.prevendeur_id || ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          handleUnassignPrevendeur(client._id);
                        } else {
                          handleAssignPrevendeur(client._id, e.target.value);
                        }
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="">Aucun prévendeur</option>
                      {prevendeurs.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.prenom} {p.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
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