import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { API_URL } from "../constants";

// Types
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
interface Shift { start: string; end: string; }
interface WorkingDay { day: string; shift: Shift; }
interface Vehicule {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: { _id: string; nom: string; prenom: string; email: string; };
  livreur_id: { _id: string; nom: string; prenom: string; email: string; };
  depot_id: { _id: string; nom_depot: string; };
  working_days?: WorkingDay[];
}

const WEEKDAYS_FR = [
  { code: 'Monday', label: 'Lundi' },
  { code: 'Tuesday', label: 'Mardi' },
  { code: 'Wednesday', label: 'Mercredi' },
  { code: 'Thursday', label: 'Jeudi' },
  { code: 'Friday', label: 'Vendredi' },
  { code: 'Saturday', label: 'Samedi' },
  { code: 'Sunday', label: 'Dimanche' },
];
function buildWorkingDays(rawWorkingDays?: WorkingDay[]) {
  const obj: { [day: string]: { enabled: boolean, start: string, end: string } } = {};
  WEEKDAYS_FR.forEach(({ code }) => {
    const found = rawWorkingDays?.find(w => w.day === code);
    obj[code] = found
      ? { enabled: true, start: found.shift.start, end: found.shift.end }
      : { enabled: false, start: "08:00", end: "16:00" };
  });
  return obj;
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
  const [assignedUsers, setAssignedUsers] = useState<{ chauffeurs: string[]; livreurs: string[]; }>({ chauffeurs: [], livreurs: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Horaires conducteur : cocher/décocher jour
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

  useEffect(() => {
    const checkUser = () => {
      const userJson = localStorage.getItem("user");
      if (!userJson) { navigate("/", { replace: true }); return null; }
      const currentUser: User = JSON.parse(userJson);
      if (
        currentUser.role !== "Administrateur des ventes" &&
        currentUser.role !== "Admin" &&
        currentUser.role !== "Super Admin"
      ) {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page."); setLoading(false); return null;
      }
      if (currentUser.role === "Administrateur des ventes" && !currentUser.depot) {
        setError("Vous devez être assigné à un dépôt pour accéder aux véhicules."); setLoading(false); return null;
      }
      return currentUser;
    };

    const fetchData = async () => {
      const currentUser = checkUser();
      if (!currentUser) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Session expirée. Veuillez vous reconnecter."); setLoading(false); return; }
        // Vérifier si ce véhicule est accessible
        try {
          const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
          const vehicleExists = vehiclesResponse.data.some((v: any) => v._id === id);
          if (!vehicleExists) {
            setError("Ce véhicule n'appartient pas à votre dépôt ou n'existe pas. Vous n'avez pas les autorisations nécessaires pour le modifier."); setLoading(false); return;
          }
        } catch {}
        // Récupérer les données du véhicule
        const vehicleResponse = await axios.get(`${API_URL}/vehicles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const vehicule: Vehicule = vehicleResponse.data;
        setMake(vehicule.make);
        setModel(vehicule.model);
        setYear(vehicule.year);
        setLicensePlate(vehicule.license_plate);
        setChauffeurId(vehicule.chauffeur_id?._id || '');
        setLivreurId(vehicule.livreur_id?._id || '');
        
        // Stocker l'ID du dépôt du véhicule
        const vehicleDepotId = vehicule.depot_id._id || vehicule.depot_id;
        setDepotId(vehicleDepotId);

        setWorkingDays(buildWorkingDays(vehicule.working_days));
        // Récupérer la liste des utilisateurs déjà affectés
        const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
        const otherVehicles = vehiclesResponse.data.filter((v: any) => v._id !== id);
        const assignedChauffeurs = otherVehicles.map((v: any) => v.chauffeur_id?._id).filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        const assignedLivreurs = otherVehicles.map((v: any) => v.livreur_id?._id).filter((id: string | undefined | null): id is string => id !== undefined && id !== null);
        setAssignedUsers({ chauffeurs: assignedChauffeurs, livreurs: assignedLivreurs });

        const usersResponse = await axios.get(`${API_URL}/user/users`, { headers: { Authorization: `Bearer ${token}` } });
        const allUsers = usersResponse.data;
        if (currentUser.role === "Admin" || currentUser.role === "Super Admin") {
          setChauffeurs(allUsers.filter((user: User) => user.role === "Chauffeur" && (!assignedChauffeurs.includes(user._id) || user._id === vehicule.chauffeur_id?._id)));
          setLivreurs(allUsers.filter((user: User) => user.role === "Livreur" && (!assignedLivreurs.includes(user._id) || user._id === vehicule.livreur_id?._id)));
        } else {
          setChauffeurs(allUsers.filter((user: User) =>
            user.role === "Chauffeur" && (user.depot === vehicleDepotId || user.depot === currentUser.depot) &&
            (!assignedChauffeurs.includes(user._id) || user._id === vehicule.chauffeur_id?._id)
          ));
          setLivreurs(allUsers.filter((user: User) =>
            user.role === "Livreur" && (user.depot === vehicleDepotId || user.depot === currentUser.depot) &&
            (!assignedLivreurs.includes(user._id) || user._id === vehicule.livreur_id?._id)
          ));
        }
        setLoading(false);
      } catch (err: any) {
        if (err.response) {
          if (err.response.status === 403) { setError("Vous n'avez pas les autorisations nécessaires pour accéder à ce véhicule."); }
          else if (err.response.status === 401) { setError("Session expirée. Veuillez vous reconnecter."); setTimeout(() => navigate("/"), 2000); }
          else if (err.response.status === 404) { setError("Ce véhicule n'existe pas ou a été supprimé."); }
          else { setError(err.response.data?.message || "Impossible de charger les données. Veuillez réessayer plus tard."); }
        } else { setError("Erreur de connexion au serveur. Veuillez vérifier votre connexion internet."); }
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !licensePlate) {
      setError("Les champs marque, modèle, année et plaque d'immatriculation sont obligatoires");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Session expirée. Veuillez vous reconnecter."); setSubmitting(false); return; }
      const vehicleData: any = {
        make,
        model,
        year,
        license_plate: licensePlate,
        capacity,
        type,
        chauffeur_id: chauffeurId || null,
        livreur_id: livreurId || null,
        working_days: WEEKDAYS_FR
          .filter(j => workingDays[j.code].enabled)
          .map(j => ({ day: j.code, shift: { start: workingDays[j.code].start, end: workingDays[j.code].end } })),
      };
      await axios.patch(`${API_URL}/vehicles/${id}`, vehicleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Véhicule modifié avec succès!");
      setTimeout(() => {
        navigate(`/admin-ventes/vehicules/${id}`);
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas les autorisations nécessaires pour modifier ce véhicule.");
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue lors de la modification du véhicule. Veuillez réessayer.");
      }
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin-ventes/vehicules/${id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
          <h1>Modifier le véhicule</h1>
          <p>Chargement en cours...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem",
        }}>
          <h1>Modifier le véhicule</h1>
          <Link to={`/admin-ventes/vehicules/${id}`}>
            <button style={{
              padding: "8px 15px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
            }}>
              Retour aux détails
            </button>
          </Link>
        </div>
        {error && (
          <div style={{
            padding: "10px 15px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px", marginBottom: "1rem",
          }}>{error}</div>
        )}
        {successMessage && (
          <div style={{
            padding: "10px 15px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "4px", marginBottom: "1rem",
          }}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
          {/* ... les champs classiques ... */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="make" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Marque:</label>
            <input type="text" id="make" value={make} onChange={e => setMake(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }} required />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="model" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Modèle:</label>
            <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }} required />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="year" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Année:</label>
            <input type="text" id="year" value={year} onChange={e => setYear(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }} required />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="licensePlate" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Plaque d'immatriculation:</label>
            <input type="text" id="licensePlate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }} required />
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
              {chauffeurs.map(chauffeur => (
                <option key={chauffeur._id} value={chauffeur._id}>
                  {chauffeur.prenom} {chauffeur.nom} ({chauffeur.email})
                </option>
              ))}
            </select>
            {chauffeurs.length === 0 && <p style={{ color: "#f57c00", fontSize: "0.85rem", marginTop: "0.25rem" }}>Aucun chauffeur disponible dans ce dépôt.</p>}
          </div>
          {/* Livreur */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="livreurId" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Livreur:</label>
            <select id="livreurId" value={livreurId} onChange={e => setLivreurId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">-- Aucun livreur --</option>
              {livreurs.map(livreur => (
                <option key={livreur._id} value={livreur._id}>
                  {livreur.prenom} {livreur.nom} ({livreur.email})
                </option>
              ))}
            </select>
            {livreurs.length === 0 && <p style={{ color: "#f57c00", fontSize: "0.85rem", marginTop: "0.25rem" }}>Aucun livreur disponible dans ce dépôt.</p>}
          </div>
          {/* Tableau horaires conducteur */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>
              Horaires du conducteur :
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
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Modification en cours..." : "Enregistrer les modifications"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
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
