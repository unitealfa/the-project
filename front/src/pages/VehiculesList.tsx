import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL } from '../constants';

// Types
interface Vehicule {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  livreur_id: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  depot_id: {
    _id: string;
    nom_depot: string;
  };
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  company?: string | null;
  companyName?: string | null;
  depot?: string | null;
}

interface LocationState {
  message?: string;
}

const VehiculesList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(locationState?.message || null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fonction pour afficher les informations de débogage
  const showDebugInfo = async () => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userJson) {
      const user = JSON.parse(userJson);
      let debugData = {
        role: user.role,
        depot: user.depot,
        id: user.id,
        tokenExists: !!token,
        vehicules: []
      };
      
      // Récupérer la liste des véhicules avec leurs dépôts pour le débogage
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/vehicles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          debugData.vehicules = response.data.map((v: any) => ({
            id: v._id,
            make: v.make,
            model: v.model,
            depot_id: v.depot_id?._id || v.depot_id
          }));
        } catch (error) {
          console.error("Erreur lors de la récupération des véhicules pour le debug:", error);
        }
      }
      
      setDebugInfo(JSON.stringify(debugData, null, 2));
    } else {
      setDebugInfo("Aucun utilisateur trouvé dans localStorage");
    }
    
    // Masquer les infos après 30 secondes
    setTimeout(() => {
      setDebugInfo(null);
    }, 30000);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      // Si on est dans l'étape de confirmation
      if (confirmDelete === vehicleId) {
        setDeletingVehicle(vehicleId);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setDeletingVehicle(null);
          setConfirmDelete(null);
          return;
        }
        
        await axios.delete(`${API_URL}/vehicles/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Mise à jour de la liste des véhicules sans rechargement de page
        setVehicules(vehicules.filter(v => v._id !== vehicleId));
        setSuccessMessage('Véhicule supprimé avec succès');
        setDeletingVehicle(null);
        setConfirmDelete(null);
        
        // Effacer le message après 3 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // Première étape: demander confirmation
        setConfirmDelete(vehicleId);
        
        // Annuler la confirmation après 5 secondes sans action
        setTimeout(() => {
          setConfirmDelete(prev => prev === vehicleId ? null : prev);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression du véhicule:', err);
      
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas les autorisations nécessaires pour supprimer ce véhicule.");
      } else {
        setError('Impossible de supprimer le véhicule. Veuillez réessayer plus tard.');
      }
      
      setDeletingVehicle(null);
      setConfirmDelete(null);
    }
  };

  // Vérifier l'utilisateur et son rôle au chargement
  useEffect(() => {
    if (locationState?.message) {
      // Effacer le message après 3 secondes
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [locationState, navigate, location.pathname]);
  
  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        navigate('/', { replace: true });
        return null;
      }
      
      const user: User = JSON.parse(userJson);
      if (user.role !== 'Administrateur des ventes' && user.role !== 'Admin' && user.role !== 'Super Admin') {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
        setLoading(false);
        return null;
      }
      
      return user;
    };
    
    const fetchVehicules = async () => {
      const user = checkUser();
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setVehicules(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des véhicules:', err);
        
        if (err.response && err.response.status === 403) {
          setError("Vous n'avez pas les autorisations nécessaires pour accéder à la liste des véhicules.");
        } else {
          setError('Impossible de charger les véhicules. Veuillez réessayer plus tard.');
        }
        
        setLoading(false);
      }
    };

    fetchVehicules();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>Liste des Véhicules</h1>
          <p>Chargement en cours...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Liste des Véhicules</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={showDebugInfo}
              style={{ 
                padding: '8px 12px', 
                backgroundColor: '#333', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '0.8rem' 
              }}
            >
              Debug Info
            </button>
            <Link to="/admin-ventes/vehicules/ajouter">
              <button 
                style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                + Ajouter un véhicule
              </button>
            </Link>
          </div>
        </div>

        {debugInfo && (
          <pre style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '0.9rem'
          }}>
            {debugInfo}
          </pre>
        )}

        {error && (
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                marginLeft: '10px', 
                padding: '5px 10px', 
                backgroundColor: '#c62828', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Réessayer
            </button>
          </div>
        )}
        
        {successMessage && (
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: '#e8f5e9', 
            color: '#2e7d32', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {successMessage}
          </div>
        )}

        {!error && vehicules.length === 0 ? (
          <p>Aucun véhicule trouvé dans ce dépôt.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Marque</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Modèle</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Année</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Plaque d'immatriculation</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Chauffeur</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Livreur</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map((vehicule) => (
                  <tr key={vehicule._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px 15px' }}>{vehicule.make}</td>
                    <td style={{ padding: '12px 15px' }}>{vehicule.model}</td>
                    <td style={{ padding: '12px 15px' }}>{vehicule.year}</td>
                    <td style={{ padding: '12px 15px' }}>{vehicule.license_plate}</td>
                    <td style={{ padding: '12px 15px' }}>
                      {vehicule.chauffeur_id ? `${vehicule.chauffeur_id.prenom} ${vehicule.chauffeur_id.nom}` : 'Non assigné'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {vehicule.livreur_id ? `${vehicule.livreur_id.prenom} ${vehicule.livreur_id.nom}` : 'Non assigné'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <Link to={`/admin-ventes/vehicules/${vehicule._id}`}>
                        <button style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#2196F3', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            marginRight: '5px' 
                          }}>
                          Détails
                        </button>
                      </Link>
                      <Link to={`/admin-ventes/vehicules/${vehicule._id}/modifier`}>
                        <button style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#FF9800', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            marginRight: '5px' 
                          }}>
                          Modifier
                        </button>
                      </Link>
                      {confirmDelete === vehicule._id ? (
                        <button 
                          onClick={() => handleDeleteVehicle(vehicule._id)}
                          disabled={deletingVehicle === vehicule._id}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: deletingVehicle === vehicule._id ? 'not-allowed' : 'pointer',
                            opacity: deletingVehicle === vehicule._id ? 0.7 : 1
                          }}
                        >
                          {deletingVehicle === vehicule._id ? 'Suppression...' : 'Confirmer'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDeleteVehicle(vehicule._id)}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer'
                          }}
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default VehiculesList; 