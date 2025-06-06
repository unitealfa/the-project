import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL } from '../constants';

// Type pour les utilisateurs
interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  depot?: string | null;
}

// Type pour l'utilisateur courant
interface CurrentUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  company?: string | null;
  companyName?: string | null;
  depot?: string | null;
}

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données du formulaire
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(0);
  const [type, setType] = useState<string[]>(['normal']);
  const [chauffeurId, setChauffeurId] = useState<string>('');
  const [livreurId, setLivreurId] = useState<string>('');
  
  // États pour les listes d'utilisateurs par rôle
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [livreurs, setLivreurs] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<{chauffeurs: string[], livreurs: string[]}>({ chauffeurs: [], livreurs: [] });
  
  // États pour la gestion du chargement et des erreurs
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Récupère les utilisateurs par rôle (chauffeurs et livreurs)
  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/', { replace: true });
          return;
        }

        // Récupérer d'abord la liste des véhicules pour obtenir les utilisateurs déjà affectés
        const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const assignedChauffeurs = vehiclesResponse.data
          .map((v: any) => v.chauffeur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        const assignedLivreurs = vehiclesResponse.data
          .map((v: any) => v.livreur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        setAssignedUsers({ chauffeurs: assignedChauffeurs, livreurs: assignedLivreurs });

        // Récupérer la liste des utilisateurs
        const usersResponse = await axios.get(`${API_URL}/user/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allUsers = usersResponse.data;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Pour Admin et Super Admin, montrer tous les utilisateurs
        // Pour Administrateur des ventes, ne montrer que les utilisateurs de son dépôt
        if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') {
          // Filtrer les chauffeurs non affectés
          const fetchedChauffeurs = allUsers.filter((user: User) => 
            user.role === 'Chauffeur' && !assignedChauffeurs.includes(user._id)
          );
          setChauffeurs(fetchedChauffeurs);
          
          // Filtrer les livreurs non affectés
          const fetchedLivreurs = allUsers.filter((user: User) => 
            user.role === 'Livreur' && !assignedLivreurs.includes(user._id)
          );
          setLivreurs(fetchedLivreurs);
        } else {
          // Filtrer les chauffeurs du même dépôt non affectés
          const fetchedChauffeurs = allUsers.filter(
            (user: User) => user.role === 'Chauffeur' && 
            user.depot === currentUser.depot && 
            !assignedChauffeurs.includes(user._id)
          );
          setChauffeurs(fetchedChauffeurs);
          
          // Filtrer les livreurs du même dépôt non affectés
          const fetchedLivreurs = allUsers.filter(
            (user: User) => user.role === 'Livreur' && 
            user.depot === currentUser.depot && 
            !assignedLivreurs.includes(user._id)
          );
          setLivreurs(fetchedLivreurs);
        }
        
      } catch (err: any) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        if (err.response) {
          if (err.response.status === 403) {
            setError("Vous n'avez pas les autorisations nécessaires pour accéder à la liste des utilisateurs.");
          } else if (err.response.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.");
            setTimeout(() => navigate('/'), 2000);
          } else {
            setError(err.response.data?.message || 'Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
          }
        } else {
          setError('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.');
        }
      }
    };
    
    fetchUsersByRole();
  }, [navigate]);
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires (sauf chauffeur et livreur)
    if (!make || !model || !year || !licensePlate) {
      setError('Les champs marque, modèle, année et plaque d\'immatriculation sont obligatoires');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const vehicleData = {
        make,
        model,
        year,
        license_plate: licensePlate,
        capacity,
        type,
        chauffeur_id: chauffeurId || null,
        livreur_id: livreurId || null,
      };
      
      await axios.post(`${API_URL}/vehicles`, vehicleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setSuccessMessage('Véhicule ajouté avec succès!');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/admin-ventes/vehicules');
      }, 2000);
      
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du véhicule:', err);
      
      // Afficher un message d'erreur spécifique si disponible
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de l\'ajout du véhicule. Veuillez réessayer.');
      }
      
      setLoading(false);
    }
  };
  
  // Annuler et revenir à la liste des véhicules
  const handleCancel = () => {
    navigate('/admin-ventes/vehicules');
  };
  
  return (
    <>
      <Header />
      <div style={{
        backgroundColor: '#f4f7f6',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 60px)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800,
          margin: '0 auto',
        }}>
           <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
            flexGrow: 1,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Ajouter un nouveau véhicule</h1>
        </div>

        <form onSubmit={handleSubmit} style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              alignSelf: 'flex-start',
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour à la liste
          </button>

          {error && (
            <div style={{ 
              padding: '10px 15px', 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              borderRadius: '4px', 
              marginBottom: '1rem', 
              border: '1px solid #ef9a9a'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ 
              padding: '10px 15px', 
              backgroundColor: '#e8f5e9', 
              color: '#2e7d32', 
              borderRadius: '4px', 
              marginBottom: '1rem', 
              border: '1px solid #a5d6a7'
            }}>
              {successMessage}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="make" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Marque:
            </label>
            <input
              type="text"
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="model" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Modèle:
            </label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="year" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Année:
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="licensePlate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Plaque d'immatriculation:
            </label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="capacity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Capacité (Kg ou L):
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value))}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc', 
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Type de véhicule:
            </label>
            <select
              id="type"
              value={type[0]}
              onChange={(e) => setType([e.target.value])}
              style={{
                 width: '100%', 
                 padding: '0.75rem', 
                 borderRadius: '4px', 
                 border: '1px solid #ccc', 
                 boxSizing: 'border-box'
              }}
            >
              <option value="normal">Normal</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="chauffeur" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Chauffeur (Optionnel):
            </label>
            <select
              id="chauffeur"
              value={chauffeurId}
              onChange={(e) => setChauffeurId(e.target.value)}
              style={{
                 width: '100%', 
                 padding: '0.75rem', 
                 borderRadius: '4px', 
                 border: '1px solid #ccc', 
                 boxSizing: 'border-box'
              }}
            >
              <option value="">-- Sélectionner un chauffeur --</option>
              {chauffeurs.map(chauffeur => (
                <option key={chauffeur._id} value={chauffeur._id}> {chauffeur.nom} {chauffeur.prenom} </option>
              ))}
            </select>
            {chauffeurs.length === 0 && (
              <p style={{ 
                color: '#f57c00', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                border: '1px solid #ffe0b2'
              }}>
                Aucun chauffeur disponible dans ce dépôt.
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="livreur" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
              Livreur (Optionnel):
            </label>
            <select
              id="livreur"
              value={livreurId}
              onChange={(e) => setLivreurId(e.target.value)}
              style={{
                 width: '100%', 
                 padding: '0.75rem', 
                 borderRadius: '4px', 
                 border: '1px solid #ccc', 
                 boxSizing: 'border-box'
              }}
            >
              <option value="">-- Sélectionner un livreur --</option>
              {livreurs.map(livreur => (
                <option key={livreur._id} value={livreur._id}> {livreur.nom} {livreur.prenom} </option>
              ))}
            </select>
            {livreurs.length === 0 && (
              <p style={{ 
                color: '#f57c00', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                border: '1px solid #ffe0b2'
              }}>
                Aucun livreur disponible dans ce dépôt.
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              backgroundColor: loading ? '#6b7280' : '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
            }}
          >
            {loading ? 'Ajout en cours…' : 'Ajouter le véhicule'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddVehicle; 