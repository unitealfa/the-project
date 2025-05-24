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

// Types horaires travail
interface Shift { start: string; end: string; }
interface WorkingDay { day: string; shift: Shift; }

const WEEKDAYS_FR = [
  { code: 'Monday', label: 'Lundi' },
  { code: 'Tuesday', label: 'Mardi' },
  { code: 'Wednesday', label: 'Mercredi' },
  { code: 'Thursday', label: 'Jeudi' },
  { code: 'Friday', label: 'Vendredi' },
  { code: 'Saturday', label: 'Samedi' },
  { code: 'Sunday', label: 'Dimanche' },
];

const DEFAULT_WORKING_DAYS: { [day: string]: { enabled: boolean, start: string, end: string } } = {};
WEEKDAYS_FR.forEach(d => DEFAULT_WORKING_DAYS[d.code] = { enabled: true, start: "08:00", end: "16:00" });

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(0);
  const [type, setType] = useState<string[]>(['normal']);
  const [chauffeurId, setChauffeurId] = useState<string>('');
  const [livreurId, setLivreurId] = useState<string>('');
  const [workingDays, setWorkingDays] = useState(DEFAULT_WORKING_DAYS);

  const [chauffeurs, setChauffeurs] = useState<User[]>([]);
  const [livreurs, setLivreurs] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<{chauffeurs: string[], livreurs: string[]}>({ chauffeurs: [], livreurs: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gestion horaires conducteur : cocher/décocher jour
  const handleToggleDay = (day: string) => {
    setWorkingDays({
      ...workingDays,
      [day]: { ...workingDays[day], enabled: !workingDays[day].enabled }
    });
  };
  const handleChangeTime = (day: string, field: "start" | "end", value: string) => {
    setWorkingDays({
      ...workingDays,
      [day]: { ...workingDays[day], [field]: value }
    });
  };

  // Gestion utilisateurs
  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/', { replace: true });
          return;
        }

        // Liste des véhicules (pour connaitre les chauffeurs/livreurs déjà attribués)
        const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignedChauffeurs = vehiclesResponse.data
          .map((v: any) => v.chauffeur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        const assignedLivreurs = vehiclesResponse.data
          .map((v: any) => v.livreur_id?._id)
          .filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        setAssignedUsers({ chauffeurs: assignedChauffeurs, livreurs: assignedLivreurs });

        // Liste des utilisateurs
        const usersResponse = await axios.get(`${API_URL}/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allUsers = usersResponse.data;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') {
          setChauffeurs(allUsers.filter((user: User) =>
            user.role === 'Chauffeur' && !assignedChauffeurs.includes(user._id)
          ));
          setLivreurs(allUsers.filter((user: User) =>
            user.role === 'Livreur' && !assignedLivreurs.includes(user._id)
          ));
        } else {
          setChauffeurs(allUsers.filter(
            (user: User) => user.role === 'Chauffeur' && user.depot === currentUser.depot && !assignedChauffeurs.includes(user._id)
          ));
          setLivreurs(allUsers.filter(
            (user: User) => user.role === 'Livreur' && user.depot === currentUser.depot && !assignedLivreurs.includes(user._id)
          ));
        }
      } catch (err: any) {
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

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !licensePlate) {
      setError('Les champs marque, modèle, année et plaque d\'immatriculation sont obligatoires');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const vehicleData: any = {
        make,
        model,
        year,
        license_plate: licensePlate,
        capacity,
        type,
        chauffeur_id: chauffeurId || null,
        livreur_id: livreurId || null,
      };
      const workingDaysToSend = WEEKDAYS_FR
        .filter(day => workingDays[day.code].enabled)
        .map(day => ({
          day: day.code,
          shift: {
            start: workingDays[day.code].start,
            end: workingDays[day.code].end
          }
        }));
      if (workingDaysToSend.length > 0) vehicleData.working_days = workingDaysToSend;

      await axios.post(`${API_URL}/vehicles`, vehicleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSuccessMessage('Véhicule ajouté avec succès!');
      setTimeout(() => {
        navigate('/admin-ventes/vehicules');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de l\'ajout du véhicule. Veuillez réessayer.');
      }
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin-ventes/vehicules');

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Ajouter un nouveau véhicule</h1>
        {error && (
          <div style={{
            padding: '10px 15px', backgroundColor: '#ffebee', color: '#c62828',
            borderRadius: '4px', marginBottom: '1rem'
          }}>{error}</div>
        )}
        {successMessage && (
          <div style={{
            padding: '10px 15px', backgroundColor: '#e8f5e9', color: '#2e7d32',
            borderRadius: '4px', marginBottom: '1rem'
          }}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
          {/* ... les champs classiques ... */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="make" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Marque:</label>
            <input type="text" id="make" value={make} onChange={e => setMake(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="model" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Modèle:</label>
            <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="year" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Année:</label>
            <input type="text" id="year" value={year} onChange={e => setYear(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="licensePlate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Plaque d'immatriculation:</label>
            <input type="text" id="licensePlate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }} required />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="chauffeurId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Chauffeur:</label>
            <select id="chauffeurId" value={chauffeurId} onChange={e => setChauffeurId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">-- Aucun chauffeur --</option>
              {chauffeurs.map(chauffeur => (
                <option key={chauffeur._id} value={chauffeur._id}>
                  {chauffeur.prenom} {chauffeur.nom} ({chauffeur.email})
                </option>
              ))}
            </select>
            {chauffeurs.length === 0 && <p style={{ color: '#f57c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>Aucun chauffeur disponible dans ce dépôt.</p>}
          </div>
          {/* Livreur */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="livreurId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Livreur:</label>
            <select id="livreurId" value={livreurId} onChange={e => setLivreurId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">-- Aucun livreur --</option>
              {livreurs.map(livreur => (
                <option key={livreur._id} value={livreur._id}>
                  {livreur.prenom} {livreur.nom} ({livreur.email})
                </option>
              ))}
            </select>
            {livreurs.length === 0 && <p style={{ color: '#f57c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>Aucun livreur disponible dans ce dépôt.</p>}
          </div>
          {/* Tableau horaires conducteur */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '.5rem' }}>
              Horaires du conducteur (facultatif) :
            </label>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: "#f9f9f9" }}>
              <tbody>
                {WEEKDAYS_FR.map(j => (
                  <tr key={j.code} style={{ opacity: workingDays[j.code].enabled ? 1 : 0.5 }}>
                    <td style={{ padding: 5, fontWeight: 'bold', color: workingDays[j.code].enabled ? "#219150" : "#aaa" }}>
                      <input
                        type="checkbox"
                        checked={workingDays[j.code].enabled}
                        style={{ accentColor: "#4caf50", marginRight: 7 }}
                        onChange={() => handleToggleDay(j.code)}
                      /> {j.label}
                    </td>
                    <td style={{ padding: 5 }}>
                      <input
                        type="time"
                        value={workingDays[j.code].start}
                        disabled={!workingDays[j.code].enabled}
                        onChange={e => handleChangeTime(j.code, "start", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: 5 }}>→</td>
                    <td style={{ padding: 5 }}>
                      <input
                        type="time"
                        value={workingDays[j.code].end}
                        disabled={!workingDays[j.code].enabled}
                        onChange={e => handleChangeTime(j.code, "end", e.target.value)}
                      />
                    </td>
                    <td>
                      {workingDays[j.code].enabled && (
                        <button type="button"
                          style={{ marginLeft: 8, background: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer' }}
                          onClick={() => handleToggleDay(j.code)}
                        >Supprimer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
