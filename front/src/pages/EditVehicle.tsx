import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL } from '../constants';

// Type pour les utilisateurs et le véhicule
interface User {
  _id?: string;
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  company?: string | null;
  companyName?: string | null;
  depot?: string | null;
}

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

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États pour les données du formulaire
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [chauffeurId, setChauffeurId] = useState<string>('');
  const [livreurId, setLivreurId] = useState<string>('');
  const [depotId, setDepotId] = useState<string>('');
  
  // États pour les listes d'utilisateurs par rôle
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [livreurs, setLivreurs] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<{chauffeurs: string[], livreurs: string[]}>({ chauffeurs: [], livreurs: [] });
  
  // États pour la gestion du chargement et des erreurs
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Vérifier l'utilisateur et son rôle au chargement
  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        navigate('/', { replace: true });
        return null;
      }
      
      const currentUser: User = JSON.parse(userJson);
      // Vérifier si l'utilisateur a un rôle autorisé
      if (currentUser.role !== 'Administrateur des ventes' && currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin') {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
        setLoading(false);
        return null;
      }

      // Pour les Administrateurs des ventes, vérifier si un dépôt est assigné
      if (currentUser.role === 'Administrateur des ventes' && !currentUser.depot) {
        setError("Vous devez être assigné à un dépôt pour accéder aux véhicules.");
        setLoading(false);
        return null;
      }
      
      return currentUser;
    };
    
    const fetchData = async () => {
      const currentUser = checkUser();
      if (!currentUser) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
        
        console.log(`Fetching vehicle data for ID: ${id}`);
        console.log(`User role: ${currentUser.role}, User depot: ${currentUser.depot}`);
        
        // Vérifions d'abord si ce véhicule est dans la liste des véhicules accessibles
        // à l'utilisateur connecté
        try {
          const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Vérifier si le véhicule demandé est dans la liste
          const vehicleExists = vehiclesResponse.data.some((v: any) => v._id === id);
          
          if (!vehicleExists) {
            // Le véhicule n'est pas dans la liste accessible par l'utilisateur
            console.log("Le véhicule demandé n'est pas dans la liste accessible par l'utilisateur.");
            setError("Ce véhicule n'appartient pas à votre dépôt ou n'existe pas. Vous n'avez pas les autorisations nécessaires pour le modifier.");
            setLoading(false);
            return;
          }
          
          console.log("Le véhicule est dans la liste accessible, tentative d'accès aux détails.");
        } catch (err) {
          console.error("Erreur lors de la vérification de l'existence du véhicule:", err);
          // Continuons quand même avec la requête principale
        }
        
        // Récupérer les données du véhicule
        const vehicleResponse = await axios.get(`${API_URL}/vehicles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Vehicle response data:', vehicleResponse.data);
        const vehicule = vehicleResponse.data;
        
        // Mettre à jour les états avec les données du véhicule
        setMake(vehicule.make);
        setModel(vehicule.model);
        setYear(vehicule.year);
        setLicensePlate(vehicule.license_plate);
        setChauffeurId(vehicule.chauffeur_id?._id || '');
        setLivreurId(vehicule.livreur_id?._id || '');
        
        // Stocker l'ID du dépôt du véhicule
        const vehicleDepotId = vehicule.depot_id._id || vehicule.depot_id;
        setDepotId(vehicleDepotId);

        // Récupérer la liste des véhicules pour obtenir les utilisateurs déjà affectés
        const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filtrer les véhicules pour exclure le véhicule actuel
        const otherVehicles = vehiclesResponse.data.filter((v: any) => v._id !== id);
        const assignedChauffeurs = otherVehicles
          .map((v: any) => v.chauffeur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        const assignedLivreurs = otherVehicles
          .map((v: any) => v.livreur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        setAssignedUsers({ chauffeurs: assignedChauffeurs, livreurs: assignedLivreurs });
        
        // Récupérer la liste des utilisateurs
        const usersResponse = await axios.get(`${API_URL}/user/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Users data received:', usersResponse.data.length, 'users');
        const allUsers = usersResponse.data;
        
        // Pour Admin et Super Admin, montrer tous les chauffeurs et livreurs
        // Pour Administrateur des ventes, ne montrer que les chauffeurs et livreurs de son dépôt
        if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') {
          // Filtrer les chauffeurs non affectés ou le chauffeur actuel
          const filteredChauffeurs = allUsers.filter((user: User) => 
            user.role === 'Chauffeur' && 
            (!assignedChauffeurs.includes(user._id) || user._id === vehicule.chauffeur_id?._id)
          );
          console.log('Filtered chauffeurs:', filteredChauffeurs.length);
          setChauffeurs(filteredChauffeurs);
          
          // Filtrer les livreurs non affectés ou le livreur actuel
          const filteredLivreurs = allUsers.filter((user: User) => 
            user.role === 'Livreur' && 
            (!assignedLivreurs.includes(user._id) || user._id === vehicule.livreur_id?._id)
          );
          console.log('Filtered livreurs:', filteredLivreurs.length);
          setLivreurs(filteredLivreurs);
        } else {
          // Pour l'administrateur des ventes, filtrer par son dépôt
          // Filtrer les chauffeurs du même dépôt non affectés ou le chauffeur actuel
          const filteredChauffeurs = allUsers.filter(
            (user: User) => user.role === 'Chauffeur' && 
            (user.depot === vehicleDepotId || user.depot === currentUser.depot) &&
            (!assignedChauffeurs.includes(user._id) || user._id === vehicule.chauffeur_id?._id)
          );
          console.log('Filtered chauffeurs by depot:', filteredChauffeurs.length);
          setChauffeurs(filteredChauffeurs);
          
          // Filtrer les livreurs du même dépôt non affectés ou le livreur actuel
          const filteredLivreurs = allUsers.filter(
            (user: User) => user.role === 'Livreur' && 
            (user.depot === vehicleDepotId || user.depot === currentUser.depot) &&
            (!assignedLivreurs.includes(user._id) || user._id === vehicule.livreur_id?._id)
          );
          console.log('Filtered livreurs by depot:', filteredLivreurs.length);
          setLivreurs(filteredLivreurs);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        console.error('Response status:', err.response?.status);
        console.error('Response data:', err.response?.data);
        
        if (err.response) {
          if (err.response.status === 403) {
            // Si l'utilisateur est Administrateur des ventes, montrer un message spécifique
            if (currentUser.role === 'Administrateur des ventes') {
              setError("Ce véhicule n'appartient pas à votre dépôt. Vous ne pouvez modifier que les véhicules assignés à votre dépôt.");
            } else {
              setError("Vous n'avez pas les autorisations nécessaires pour accéder à la liste des utilisateurs.");
            }
          } else if (err.response.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.");
            setTimeout(() => navigate('/'), 2000);
          } else if (err.response.status === 404) {
            setError("Ce véhicule n'existe pas ou a été supprimé.");
          } else {
            setError(err.response.data?.message || 'Impossible de charger les données. Veuillez réessayer plus tard.');
          }
        } else {
          setError('Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.');
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires (sauf chauffeur et livreur)
    if (!make || !model || !year || !licensePlate) {
      setError('Les champs marque, modèle, année et plaque d\'immatriculation sont obligatoires');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setSubmitting(false);
        return;
      }
      
      const vehicleData = {
        make,
        model,
        year,
        license_plate: licensePlate,
        chauffeur_id: chauffeurId || null,
        livreur_id: livreurId || null,
      };
      
      await axios.patch(`${API_URL}/vehicles/${id}`, vehicleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setSuccessMessage('Véhicule modifié avec succès!');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate(`/admin-ventes/vehicules/${id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Erreur lors de la modification du véhicule:', err);
      
      // Afficher un message d'erreur spécifique si disponible
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas les autorisations nécessaires pour modifier ce véhicule.");
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de la modification du véhicule. Veuillez réessayer.');
      }
      
      setSubmitting(false);
    }
  };
  
  // Annuler et revenir aux détails du véhicule
  const handleCancel = () => {
    navigate(`/admin-ventes/vehicules/${id}`);
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>Modifier le véhicule</h1>
          <p>Chargement en cours...</p>
        </main>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Modifier le véhicule</h1>
          <Link to={`/admin-ventes/vehicules/${id}`}>
            <button style={{ 
              padding: '8px 15px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}>
              Retour aux détails
            </button>
          </Link>
        </div>
        
        {error && (
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
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
            marginBottom: '1rem' 
          }}>
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="make" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Marque:
            </label>
            <input
              type="text"
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="model" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Modèle:
            </label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="year" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Année:
            </label>
            <input
              type="text"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="licensePlate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Plaque d'immatriculation:
            </label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="chauffeurId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Chauffeur:
            </label>
            <select
              id="chauffeurId"
              value={chauffeurId}
              onChange={(e) => setChauffeurId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
            >
              <option value="">-- Aucun chauffeur --</option>
              {chauffeurs.map((chauffeur) => (
                <option key={chauffeur._id} value={chauffeur._id}>
                  {chauffeur.prenom} {chauffeur.nom} ({chauffeur.email})
                </option>
              ))}
            </select>
            {chauffeurs.length === 0 && (
              <p style={{ color: '#f57c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Aucun chauffeur disponible dans ce dépôt.
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="livreurId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Livreur:
            </label>
            <select
              id="livreurId"
              value={livreurId}
              onChange={(e) => setLivreurId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ccc' 
              }}
            >
              <option value="">-- Aucun livreur --</option>
              {livreurs.map((livreur) => (
                <option key={livreur._id} value={livreur._id}>
                  {livreur.prenom} {livreur.nom} ({livreur.email})
                </option>
              ))}
            </select>
            {livreurs.length === 0 && (
              <p style={{ color: '#f57c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Aucun livreur disponible dans ce dépôt.
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              style={{ 
                padding: '10px 20px', 
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
        </form>
      </main>
    </>
  );
};

export default EditVehicle; 