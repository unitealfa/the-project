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

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: { _id: string; nom: string; prenom: string };
  livreur_id: { _id: string; nom: string; prenom: string };
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
  const [isVehiculesModalOpen, setIsVehiculesModalOpen] = useState(false);
  const [vehicules, setVehicules] = useState<Vehicle[]>([]);
  const [loadingVehicules, setLoadingVehicules] = useState(false);
  const [vehiculesError, setVehiculesError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      ? `/clients?depot=${depot}`
      : `/clients`;

    apiFetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setClients)
      .catch(err => setError(err.message));
  }, [depot, user?.company]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression de ce client de ce dépôt ?')) return;

    try {
      const res = await apiFetch(`/clients/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur inconnue lors de la suppression');
      }

      const result = await res.json();

      // Retirer le client de la liste locale
      setClients(prev => prev.filter(c => c._id !== id));

      // Optionnel : afficher le message de l'API
      // alert(result.message);
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
      const response = await apiFetch(`/api/teams/${depot}?role=prevente`);
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

  const loadVehiculesWithPersonnel = async () => {
    if (!depot) {
      setVehiculesError('Aucun dépôt associé à votre compte');
      return;
    }
    setLoadingVehicules(true);
    try {
      const response = await apiFetch(`/vehicles?depot=${depot}`);
      const data = await response.json();
      const filtered = data.filter((v: Vehicle) => v.chauffeur_id && v.livreur_id);
      setVehicules(filtered);
      if (filtered.length === 0) {
        setVehiculesError('Aucun véhicule avec chauffeur et livreur trouvé dans ce dépôt');
      } else {
        setVehiculesError('');
      }
    } catch (err: any) {
      setVehiculesError(err.message || 'Erreur lors du chargement des véhicules');
    } finally {
      setLoadingVehicules(false);
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

  // --- NOUVEAU : état pour la pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 15; // on fixe à 2 clients par page

  // --- NOUVEAU : on calcule la liste paginée ---
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;

  // Filtrage des clients
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nom = client.nom_client.toLowerCase();
    const email = client.email.toLowerCase();
    const telephone = client.contact.telephone.toLowerCase();
    return nom.includes(term) || email.includes(term) || telephone.includes(term);
  });

  // Pagination sur filteredClients
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  // Fonctions pour changer de page
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
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
          {user?.role === 'Administrateur des ventes' && (
            <button
              onClick={() => { setIsVehiculesModalOpen(true); loadVehiculesWithPersonnel(); }}
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
              🚚 Voir les véhicules dispo
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

        {/* Barre de recherche + bouton “Réinitialiser” */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Recherche par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Revenir à la première page
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={!searchTerm}
          >
            Réinitialiser
          </button>
        </div>

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
              {currentClients.map(client => (
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
                    {user?.role === 'Pré-vendeur' && (
                      <button 
                        onClick={() => navigate(`/productlist?clientId=${client._id}`)} 
                        style={{
                          ...actionBtn,
                          color: '#10b981'
                        }}
                      >
                        🛒 Commande
                      </button>
                    )}
                    {user?.role === 'responsable depot' && (
                      <>
                        <button onClick={() => navigate(`/clients/${client._id}/edit`)} style={actionBtn}>
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
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Contrôles de pagination */}
        {clients.length > clientsPerPage && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage === 1 ? '#ddd' : '#4f46e5',
                color: currentPage === 1 ? '#666' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Précédent
            </button>
            <span style={{ alignSelf: 'center' }}>Page {currentPage} / {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage === totalPages ? '#ddd' : '#4f46e5',
                color: currentPage === totalPages ? '#666' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Suivant →
            </button>
          </div>
        )}

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

        {isVehiculesModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div style={{
              position: 'relative', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '80%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto'
            }}>
              <button
                onClick={() => setIsVehiculesModalOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >✕</button>
              <h2 style={{ marginTop: 0 }}>Véhicules avec chauffeur et livreur</h2>
              {loadingVehicules ? (
                <p>Chargement des véhicules...</p>
              ) : vehiculesError ? (
                <p style={{ color: 'red' }}>{vehiculesError}</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Véhicule</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Chauffeur</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Livreur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicules.map(v => (
                      <tr key={v._id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px 15px' }}>{v.make} {v.model} ({v.license_plate})</td>
                        <td style={{ padding: '12px 15px' }}>{v.chauffeur_id.prenom} {v.chauffeur_id.nom}</td>
                        <td style={{ padding: '12px 15px' }}>{v.livreur_id.prenom} {v.livreur_id.nom}</td>
                      </tr>
                    ))}
                    {vehicules.length === 0 && !vehiculesError && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>
                          Aucun véhicule avec chauffeur et livreur trouvé.
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
