import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL } from '../constants';

// Type pour le véhicule
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
  capacity: number;
  type: string[];
}

// Type pour l'utilisateur
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

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Vérifier l'utilisateur et son rôle au chargement
  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        navigate('/', { replace: true });
        return null;
      }
      
      const user: User = JSON.parse(userJson);
      // Vérifier si l'utilisateur a un rôle autorisé
      if (user.role !== 'Administrateur des ventes' && user.role !== 'Admin' && user.role !== 'Super Admin') {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
        setLoading(false);
        return null;
      }

      // Pour les Administrateurs des ventes, vérifier si un dépôt est assigné
      if (user.role === 'Administrateur des ventes' && !user.depot) {
        setError("Vous devez être assigné à un dépôt pour accéder aux véhicules.");
        setLoading(false);
        return null;
      }
      
      return user;
    };
    
    const fetchVehicleDetails = async () => {
      const user = checkUser();
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
        console.log(`Fetching vehicle details for ID: ${id}`);
        console.log(`User role: ${user.role}, User depot: ${user.depot}`);
        
        // Approche alternative - Récupérer tous les véhicules et trouver celui qui nous intéresse
        try {
          console.log("Tentative d'approche alternative: récupérer depuis la liste des véhicules");
          const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const vehicleData = vehiclesResponse.data.find((v: any) => v._id === id);
          
          if (vehicleData) {
            console.log("Véhicule trouvé dans la liste:", vehicleData);
            setVehicule(vehicleData);
            setLoading(false);
            return;
          } else {
            console.log("Véhicule non trouvé dans la liste des véhicules autorisés");
          }
        } catch (err) {
          console.error("Erreur avec l'approche alternative:", err);
        }
        
        // Si l'approche alternative échoue, on continue avec l'approche standard
        console.log("Tentative avec approche standard: appel direct à l'API de détail du véhicule");
        const response = await axios.get(`${API_URL}/vehicles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Response data:', response.data);
        setVehicule(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des détails du véhicule:', err);
        console.error('Response status:', err.response?.status);
        console.error('Response data:', err.response?.data);
        
        if (err.response && err.response.status === 403) {
          // Si l'utilisateur est Administrateur des ventes, montrer un message spécifique
          if (user.role === 'Administrateur des ventes') {
            setError("Ce véhicule n'appartient pas à votre dépôt. Vous ne pouvez accéder qu'aux véhicules assignés à votre dépôt.");
          } else {
            setError("Vous n'avez pas les autorisations nécessaires pour accéder à ce véhicule.");
          }
        } else if (err.response && err.response.status === 404) {
          setError("Ce véhicule n'existe pas ou a été supprimé.");
        } else {
          setError('Impossible de charger les détails du véhicule. Veuillez réessayer plus tard.');
        }
        
        setLoading(false);
      }
    };
    
    fetchVehicleDetails();
  }, [id, navigate]);
  
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setDeleteLoading(false);
        return;
      }
      
      await axios.delete(`${API_URL}/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Redirection vers la liste des véhicules après suppression
      navigate('/admin-ventes/vehicules', { state: { message: 'Véhicule supprimé avec succès' } });
    } catch (err: any) {
      console.error('Erreur lors de la suppression du véhicule:', err);
      
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas les autorisations nécessaires pour supprimer ce véhicule.");
      } else {
        setError('Impossible de supprimer le véhicule. Veuillez réessayer plus tard.');
      }
      
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>Détails du Véhicule</h1>
            <p>Chargement en cours...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Header />
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>Détails du Véhicule</h1>
            <p style={{ color: 'red' }}>{error}</p>
            <Link to="/admin-ventes/vehicules">
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '1rem'
              }}>
                Retour à la liste
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  if (!vehicule) {
    return (
      <>
        <Header />
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>Détails du Véhicule</h1>
            <p>Véhicule non trouvé.</p>
            <Link to="/admin-ventes/vehicules">
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '1rem'
              }}>
                Retour à la liste
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              color: '#1a1a1a',
              fontSize: '2rem',
              borderBottom: '2px solid #1a1a1a',
              paddingBottom: '0.5rem'
            }}>Détails du Véhicule</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/admin-ventes/vehicules">
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  Retour à la liste
                </button>
              </Link>
              <Link to={`/admin-ventes/vehicules/${id}/modifier`}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  Modifier
                </button>
              </Link>
            </div>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Informations du véhicule</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Marque :</strong><br/>
                <span style={{ color: '#666' }}>{vehicule.make}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Modèle :</strong><br/>
                <span style={{ color: '#666' }}>{vehicule.model}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Année :</strong><br/>
                <span style={{ color: '#666' }}>{vehicule.year}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Plaque d'immatriculation :</strong><br/>
                <span style={{ color: '#666' }}>{vehicule.license_plate}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Capacité :</strong><br/>
                <span style={{ color: '#666' }}>{vehicule.capacity}</span>
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Type :</strong><br/>
                <span style={{ color: '#666' }}>
                  {vehicule.type.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                </span>
              </p>
            </fieldset>

            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Personnel assigné</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Chauffeur :</strong><br/>
                <span style={{ color: '#666' }}>
                  {vehicule.chauffeur_id ? `${vehicule.chauffeur_id.prenom} ${vehicule.chauffeur_id.nom}` : 'Non assigné'}
                </span>
                {vehicule.chauffeur_id && (
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>
                    {vehicule.chauffeur_id.email}
                  </span>
                )}
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Livreur :</strong><br/>
                <span style={{ color: '#666' }}>
                  {vehicule.livreur_id ? `${vehicule.livreur_id.prenom} ${vehicule.livreur_id.nom}` : 'Non assigné'}
                </span>
                {vehicule.livreur_id && (
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>
                    {vehicule.livreur_id.email}
                  </span>
                )}
              </p>
            </fieldset>

            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa',
              gridColumn: '1 / -1'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Informations sur le dépôt</legend>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Dépôt assigné :</strong><br/>
                <span style={{ color: '#666' }}>
                  {vehicule.depot_id ? vehicule.depot_id.nom_depot : 'Non assigné'}
                </span>
              </p>
            </fieldset>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            {!deleteConfirm ? (
              <button 
                onClick={() => setDeleteConfirm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Supprimer ce véhicule
              </button>
            ) : (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <p style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#991b1b' }}>
                  Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      opacity: deleteLoading ? 0.7 : 1
                    }}
                  >
                    {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleDetail; 