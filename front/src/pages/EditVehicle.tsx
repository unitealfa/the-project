import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
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
  capacity: number;
  type: string[];
  chauffeur_id?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  livreur_id?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  depot_id: {
    _id: string;
    nom_depot: string;
  } | string;
}

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const currentUser: User | null = userJson ? JSON.parse(userJson) : null;
  
  // Vérifier l'utilisateur et son rôle au chargement
  useEffect(() => {
    const checkUser = () => {
      if (!currentUser) {
        navigate('/', { replace: true });
        return null;
      }
      
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
      const user = checkUser();
      if (!user) return;
      
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      
      console.log(`Fetching vehicle data for ID: ${id}`);
      console.log(`User role: ${user.role}, User depot: ${user.depot}`);
      
      try {
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
        setCapacity(vehicule.capacity);
        setType(vehicule.type);
        setChauffeurId(vehicule.chauffeur_id?._id || '');
        setLivreurId(vehicule.livreur_id?._id || '');
        
        // Stocker l'ID du dépôt du véhicule
        const vehicleDepotId = typeof vehicule.depot_id === 'object' ? vehicule.depot_id._id : vehicule.depot_id;
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
        if (user.role === 'Admin' || user.role === 'Super Admin') {
          // Filtrer les chauffeurs non affectés ou le chauffeur actuel
          const filteredChauffeurs = allUsers.filter((user: User) => 
            user.role === 'Chauffeur' && 
            (!assignedChauffeurs.includes(user._id || user.id) || (user._id || user.id) === vehicule.chauffeur_id?._id)
          );
          console.log('Filtered chauffeurs:', filteredChauffeurs.length);
          setChauffeurs(filteredChauffeurs);
          
          // Filtrer les livreurs non affectés ou le livreur actuel
          const filteredLivreurs = allUsers.filter((user: User) => 
            user.role === 'Livreur' && 
            (!assignedLivreurs.includes(user._id || user.id) || (user._id || user.id) === vehicule.livreur_id?._id)
          );
          console.log('Filtered livreurs:', filteredLivreurs.length);
          setLivreurs(filteredLivreurs);
        } else {
          // Pour l'administrateur des ventes, filtrer par son dépôt
          // Filtrer les chauffeurs du même dépôt non affectés ou le chauffeur actuel
          const filteredChauffeurs = allUsers.filter(
            (user: User) => user.role === 'Chauffeur' && 
            (user.depot === vehicleDepotId || user.depot === currentUser?.depot) &&
            (!assignedChauffeurs.includes(user._id || user.id) || (user._id || user.id) === vehicule.chauffeur_id?._id)
          );
          console.log('Filtered chauffeurs by depot:', filteredChauffeurs.length);
          setChauffeurs(filteredChauffeurs);
          
          // Filtrer les livreurs du même dépôt non affectés ou le livreur actuel
          const filteredLivreurs = allUsers.filter(
            (user: User) => user.role === 'Livreur' && 
            (user.depot === vehicleDepotId || user.depot === currentUser?.depot) &&
            (!assignedLivreurs.includes(user._id || user.id) || (user._id || user.id) === vehicule.livreur_id?._id)
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
            if (currentUser?.role === 'Administrateur des ventes') {
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
          setError('Une erreur est survenue lors du chargement des données.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token, currentUser?.role, currentUser?.depot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.patch(`${API_URL}/vehicles/${id}`, {
        make,
        model,
        year,
        license_plate: licensePlate,
        capacity: Number(capacity),
        type,
        chauffeur_id: chauffeurId || null,
        livreur_id: livreurId || null
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('Véhicule mis à jour avec succès !');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(response.data.message || 'Erreur lors de la mise à jour du véhicule.');
      }
    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Erreur lors de la mise à jour du véhicule.');
      } else {
        setError('Une erreur réseau est survenue.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Gestion de l'affichage en fonction des états de chargement/erreur
  if (loading) {
    return (
      <>
        <Header />
        {/* Conteneur principal avec fond doux et padding */}
        <div style={{
          backgroundColor: '#f4f7f6',
          padding: '2rem 1rem',
          minHeight: 'calc(100vh - 60px)',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>Chargement des données du véhicule...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        {/* Conteneur principal avec fond doux et padding */}
        <div style={{
          backgroundColor: '#f4f7f6',
          padding: '2rem 1rem',
          minHeight: 'calc(100vh - 60px)',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ color: 'red', textAlign: 'center', fontSize: '1.1rem' }}>{error}</div>
          {/* Bouton Retour */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginTop: '0.5rem',
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
            ← Retour
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Conteneur principal avec fond doux et padding */}
      <div style={{
        backgroundColor: '#f4f7f6', // Fond doux
        padding: '2rem 1rem', // Padding haut/bas et latéral
        minHeight: 'calc(100vh - 60px)', // Occupe la majorité de l'écran (soustrait la hauteur du header)
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* En-tête moderne */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800, // Aligner avec le formulaire
          margin: '0 auto',
        }}>
           <h1 style={{
            fontSize: '2rem', // Augmenter légèrement la taille
            fontWeight: 'bold',
            color: '#1a1a1a', // Noir plus prononcé
            margin: 0,
            flexGrow: 1, // Permet au titre de prendre l'espace restant
            textAlign: 'center', // Centrer le titre
            textTransform: 'uppercase', // Mettre en majuscules
            letterSpacing: '0.05em', // Espacement entre les lettres
          }}>Modifier le véhicule</h1>
        </div>

         {successMessage && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{successMessage}</p>}

        {/* Formulaire centré et stylisé */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 800, // Largeur max pour centrer
            margin: '0 auto', // Centrer le formulaire
            backgroundColor: '#ffffff', // Fond blanc pour la carte principale
            padding: '2rem',
            borderRadius: '8px', // Coins arrondis
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
            display: 'flex', // Utiliser flexbox pour l'organisation interne
            flexDirection: 'column',
            gap: '1.5rem', // Espacement entre les champs
          }}
        >
          {/* Bouton Retour */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start', // Aligner à gauche dans le flex container
              marginBottom: '1.5rem', // Espacement sous le bouton
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a', // Bouton noir
              color: '#ffffff', // Texte blanc
              border: 'none',
              borderRadius: '20px', // Coins arrondis
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>

          {/* Champs du formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Marque:</label>
            <input type="text" value={make} onChange={e => setMake(e.target.value)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Modèle:</label>
            <input type="text" value={model} onChange={e => setModel(e.target.value)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Année:</label>
            <input type="text" value={year} onChange={e => setYear(e.target.value)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Plaque d'immatriculation:</label>
            <input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Capacité:</label>
            <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          {/* Type de véhicule */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Type:</label>
             {/* Assurez-vous que votre backend supporte la modification du type, sinon cette section est juste illustrative */}
             <select
                value={type[0] || ''}
                onChange={(e) => setType([e.target.value])}
                required
                style={{
                  padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
                }}
             >
                <option value="normal">Normal</option>
                <option value="refrigere">Réfrigéré</option>
                <option value="dangereux">Dangereux</option>
             </select>
          </div>

          {/* Chauffeur Assignment */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Chauffeur:</label>
            <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)} style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }}>
              <option value="">-- Sélectionner un chauffeur --</option>
              {chauffeurs.map(chauffeur => (
                <option key={chauffeur._id || chauffeur.id} value={chauffeur._id || chauffeur.id}>
                  {chauffeur.nom} {chauffeur.prenom}
                </option>
              ))}
            </select>
             {chauffeurs.length === 0 && (
              <p style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fff3e0', // Light orange background
                border: '1px solid #ffe0b2', // Darker orange border
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: '#e65100', // Dark orange text
              }}>
                Aucun chauffeur disponible à ce dépôt.
              </p>
            )}
          </div>

          {/* Livreur Assignment */}
           <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Livreur:</label>
            <select value={livreurId} onChange={e => setLivreurId(e.target.value)} style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }}>
              <option value="">-- Sélectionner un livreur --</option>
              {livreurs.map(livreur => (
                <option key={livreur._id || livreur.id} value={livreur._id || livreur.id}>
                  {livreur.nom} {livreur.prenom}
                </option>
              ))}
            </select>
             {livreurs.length === 0 && (
              <p style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fff3e0', // Light orange background
                border: '1px solid #ffe0b2', // Darker orange border
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: '#e65100', // Dark orange text
              }}>
                Aucun livreur disponible à ce dépôt.
              </p>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              backgroundColor: submitting ? '#ccc' : '#1a1a1a', // Gris si soumission en cours
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
            }}
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
           {/* Bouton Annuler */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            style={{
              marginTop: '1rem',
              padding: '1rem 2rem',
              backgroundColor: submitting ? '#ccc' : '#dc2626', // Rouge
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
            }}
          >
            Annuler
          </button>
        </form>
      </div>
    </>
  );
};

export default EditVehicle;