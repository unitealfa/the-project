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
  const [chauffeurId, setChauffeurId] = useState<string>('');
  const [livreurId, setLivreurId] = useState<string>('');
  
  // États pour les listes d'utilisateurs par rôle
  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [livreurs, setLivreurs] = useState<User[]>([]);
  
  // États pour la gestion du chargement et des erreurs
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Récupère les utilisateurs par rôle (chauffeurs et livreurs)
  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        // Récupérer l'utilisateur courant
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          navigate('/', { replace: true });
          return;
        }
        
        const currentUser: CurrentUser = JSON.parse(userJson);
        if (currentUser.role !== 'Administrateur des ventes' && currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin') {
          setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
          return;
        }
        
        // Vérifier que l'administrateur des ventes a un dépôt assigné
        if (currentUser.role === 'Administrateur des ventes' && !currentUser.depot) {
          setError("Vous devez être assigné à un dépôt pour gérer les véhicules.");
          return;
        }
        
        const token = localStorage.getItem('token');
        
        // Requête pour récupérer tous les utilisateurs
        const response = await axios.get(`${API_URL}/user/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Filtrer les utilisateurs par rôle et par dépôt si c'est un administrateur des ventes
        const allUsers = response.data;
        
        // Pour Admin et Super Admin, montrer tous les utilisateurs
        // Pour Administrateur des ventes, ne montrer que les utilisateurs de son dépôt
        if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') {
          // Filtrer les chauffeurs
          const fetchedChauffeurs = allUsers.filter((user: User) => user.role === 'Chauffeur');
          setChauffeurs(fetchedChauffeurs);
          
          // Filtrer les livreurs
          const fetchedLivreurs = allUsers.filter((user: User) => user.role === 'Livreur');
          setLivreurs(fetchedLivreurs);
        } else {
          // Filtrer les chauffeurs du même dépôt
          const fetchedChauffeurs = allUsers.filter(
            (user: User) => user.role === 'Chauffeur' && user.depot === currentUser.depot
          );
          setChauffeurs(fetchedChauffeurs);
          
          // Filtrer les livreurs du même dépôt
          const fetchedLivreurs = allUsers.filter(
            (user: User) => user.role === 'Livreur' && user.depot === currentUser.depot
          );
          setLivreurs(fetchedLivreurs);
        }
        
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
      }
    };
    
    fetchUsersByRole();
  }, [navigate]);
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!make || !model || !year || !licensePlate || !chauffeurId || !livreurId) {
      setError('Tous les champs sont obligatoires');
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
        chauffeur_id: chauffeurId,
        livreur_id: livreurId,
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
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Ajouter un nouveau véhicule</h1>
        
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
              required
            >
              <option value="">-- Sélectionner un chauffeur --</option>
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
              required
            >
              <option value="">-- Sélectionner un livreur --</option>
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
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le véhicule'}
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

export default AddVehicle; 