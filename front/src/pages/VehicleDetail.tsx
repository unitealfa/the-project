import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL } from '../constants';

// Mapping jours anglais -> français
const DAYS_LABELS_FR: { [key: string]: string } = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche"
};

// Type pour le véhicule
interface Vehicule {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  livreur_id?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  depot_id?: {
    _id: string;
    nom_depot: string;
  } | null;
  working_days?: WorkingDay[]; // optionnel
}

interface WorkingDay {
  day: string; // "Monday", etc.
  shift: {
    start: string; // "08:00"
    end: string;   // "16:00"
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
      if (
        user.role !== 'Administrateur des ventes' &&
        user.role !== 'Admin' &&
        user.role !== 'Super Admin'
      ) {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
        setLoading(false);
        return null;
      }

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

        // Option 1: récupération rapide (avec filtrage)
        try {
          const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vehicleData = vehiclesResponse.data.find((v: any) => v._id === id);
          if (vehicleData) {
            setVehicule(vehicleData);
            setLoading(false);
            return;
          }
        } catch (_) {
          // Continue si erreur
        }

        // Option 2: fallback, fetch direct
        const response = await axios.get(`${API_URL}/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicule(response.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin-ventes/vehicules', { state: { message: 'Véhicule supprimé avec succès' } });
    } catch (err: any) {
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
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>Détails du Véhicule</h1>
          <p>Chargement en cours...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>Détails du Véhicule</h1>
          <p style={{ color: 'red' }}>{error}</p>
          <Link to="/admin-ventes/vehicules">
            <button style={{
              padding: '8px 15px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Retour à la liste
            </button>
          </Link>
        </main>
      </>
    );
  }

  if (!vehicule) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>Détails du Véhicule</h1>
          <p>Véhicule non trouvé.</p>
          <Link to="/admin-ventes/vehicules">
            <button style={{
              padding: '8px 15px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Retour à la liste
            </button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Détails du Véhicule</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admin-ventes/vehicules">
              <button style={{
                padding: '8px 15px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Retour à la liste
              </button>
            </Link>
            <Link to={`/admin-ventes/vehicules/${id}/modifier`}>
              <button style={{
                padding: '8px 15px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Modifier
              </button>
            </Link>
          </div>
        </div>

        {/* Informations sur le véhicule */}
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '800px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Informations sur le véhicule</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Marque:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vehicule.make}</p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Modèle:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vehicule.model}</p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Année:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vehicule.year}</p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Plaque d'immatriculation:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vehicule.license_plate}</p>
              </div>
            </div>
          </div>

          {/* Horaires conducteur */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Horaires de travail du conducteur</h2>
            {vehicule.working_days && vehicule.working_days.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 5 }}>Jour</th>
                    <th style={{ textAlign: 'center', padding: 5 }}>Début</th>
                    <th style={{ textAlign: 'center', padding: 5 }}>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicule.working_days.map((wd, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 5, fontWeight: 'bold' }}>
                        {DAYS_LABELS_FR[wd.day] || wd.day}
                      </td>
                      <td style={{ textAlign: 'center', padding: 5 }}>{wd.shift.start}</td>
                      <td style={{ textAlign: 'center', padding: 5 }}>{wd.shift.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#888' }}>Aucun horaire de travail défini pour ce conducteur.</div>
            )}
          </div>

          {/* Personnel assigné */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Personnel assigné</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Chauffeur:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {vehicule.chauffeur_id
                    ? `${vehicule.chauffeur_id.prenom} ${vehicule.chauffeur_id.nom}`
                    : 'Non assigné'}
                </p>
                {vehicule.chauffeur_id && (
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{vehicule.chauffeur_id.email}</p>
                )}
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>Livreur:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {vehicule.livreur_id
                    ? `${vehicule.livreur_id.prenom} ${vehicule.livreur_id.nom}`
                    : 'Non assigné'}
                </p>
                {vehicule.livreur_id && (
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{vehicule.livreur_id.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations dépôt */}
          <div>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Informations sur le dépôt</h2>
            <p style={{ margin: '0.5rem 0', color: '#666' }}>Dépôt assigné:</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              {vehicule.depot_id ? vehicule.depot_id.nom_depot : 'Non assigné'}
            </p>
          </div>

          {/* Supprimer */}
          <div style={{ marginTop: '2rem' }}>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Supprimer ce véhicule
              </button>
            ) : (
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                marginTop: '1rem'
              }}>
                <p style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#c62828' }}>
                  Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleteLoading ? 'not-allowed' : 'pointer',
                      opacity: deleteLoading ? 0.7 : 1
                    }}
                  >
                    {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleteLoading}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default VehicleDetail;
