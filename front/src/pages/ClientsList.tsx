// 📁 src/pages/ClientsList.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "../utils/api";

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: { nom_gerant: string; telephone: string };
  affectations: { entreprise: string; depot: string; prevendeur_id?: string }[];
  pfp?: string;
  nom: string;
  prenom: string;
  localisation?: {
    coordonnees?: { latitude: number; longitude: number };
  };
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

// ── Bypass TS sur MapContainer & Marker ───────────────────────────────
const AnyMapContainer = MapContainer as any;
const AnyMarker = Marker as any;

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevendeurs, setPrevendeurs] = useState<Prevendeur[]>([]);
  const [loadingPrevendeurs, setLoadingPrevendeurs] = useState(false);
  const [isVehiculesModalOpen, setIsVehiculesModalOpen] = useState(false);
  const [vehicules, setVehicules] = useState<Vehicle[]>([]);
  const [loadingVehicules, setLoadingVehicules] = useState(false);
  const [vehiculesError, setVehiculesError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // ==> la position GPS du prévendeur. Tant que c'est null, on ne rend pas la carte.
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

  const navigate = useNavigate();
  const query = useQuery();

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  // sur quelle base de dépôt on filtre
  const depot =
    user?.depot ||
    query.get("depot") ||
    (user?.role === "responsable depot" ? user.depot : null);

  const apiBase = import.meta.env.VITE_API_URL;

  // Icône "moto" en ligne
  const motoIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/6951/6951721.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  // Réf pour récupérer l'instance Leaflet
  const mapRef = useRef<any>(null);

  // ── 1) On charge la liste de tous les clients dès que possible ─────────
  useEffect(() => {
    const url = depot ? `/clients?depot=${depot}` : `/clients`;
    apiFetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setClients)
      .catch((err) => setError(err.message));
  }, [depot, user?.company]);

  // ── 2) On démarre immédiatement la géolocalisation si le rôle est "Pré-vendeur" ──
  // Tant que currentPos === null, on n'affiche pas la carte : on attend la position.
  useEffect(() => {
    if (user?.role === "Pré-vendeur" && "geolocation" in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          // Dès qu'on reçoit un point GPS, on le stocke
          setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Erreur Geolocation :", err);
          // Si échec, on pourrait afficher un message d'erreur ou un fallback
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [user?.role]);

  // ── 3) Dès qu'on a currentPos ET que la carte est instanciée, on la recentre ──
  useEffect(() => {
    if (currentPos && mapRef.current) {
      mapRef.current.setView(currentPos, 13);
    }
  }, [currentPos]);

  // ── 4) OSRM Trip : Calculer un itinéraire optimisé en partant de currentPos ──
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>([]);
  const lastReqRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!currentPos || clients.length === 0) {
      setOptimizedRoute([]);
      return;
    }

    // Détermine la distance (aprox) entre lastReqRef.current et currentPos
    if (lastReqRef.current) {
      const [lat0, lon0] = lastReqRef.current;
      const [lat1, lon1] = currentPos;
      const dLat = lat1 - lat0;
      const dLon = lon1 - lon0;
      // env. 1 degré ≈ 111 km, donc 0.0005 ≈ 55 m
      if (Math.hypot(dLat, dLon) < 0.0005) {
        // Déplacement < ~ 50 m : on ne ré-appelle pas OSRM
        return;
      }
    }

    // On met à jour lastReqRef
    lastReqRef.current = currentPos;

    // On construit la liste "lon,lat" du trip (début = currentPos, puis tous les clients)
    const validClients = clients.filter((c) => {
      const lat = Number(c.localisation?.coordonnees?.latitude);
      const lon = Number(c.localisation?.coordonnees?.longitude);
      return !Number.isNaN(lat) && !Number.isNaN(lon);
    });

    if (validClients.length === 0) {
      setOptimizedRoute([]);
      return;
    }

    const coordsList: string[] = [];
    const [pvLat, pvLon] = currentPos;
    coordsList.push(`${pvLon},${pvLat}`);

    validClients.forEach((c) => {
      const latC = c.localisation!.coordonnees!.latitude;
      const lonC = c.localisation!.coordonnees!.longitude;
      coordsList.push(`${lonC},${latC}`);
    });

    const coordsString = coordsList.join(";");

    const tripUrl =
      `https://router.project-osrm.org/trip/v1/driving/` +
      `${coordsString}` +
      `?source=first&roundtrip=false&geometries=geojson`;

    fetch(tripUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === "Ok" && json.trips?.length) {
          const tripCoords: [number, number][] = json.trips[0].geometry.coordinates.map(
            (pt: [number, number]) => [pt[1], pt[0]]
          );
          setOptimizedRoute(tripCoords);
        } else {
          setOptimizedRoute([]);
        }
      })
      .catch(() => {
        setOptimizedRoute([]);
      });
  }, [currentPos, clients]);

  // ── 5) Suppression d'un client ─────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Confirmer la suppression de ce client de ce dépôt ?")) return;
    try {
      const res = await apiFetch(`/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur inconnue lors de la suppression");
      }
      await res.json();
      setClients((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const th = {
    padding: ".75rem",
    textAlign: "left" as const,
    borderBottom: "2px solid #ddd",
  };
  const td = { padding: ".75rem" };
  const actionBtn = {
    marginRight: "0.5rem",
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "1rem",
  };

  // ── 6) Charger la liste des prévendeurs dans le dépôt ─────────────────
  const loadPrevendeurs = async () => {
    if (!depot) {
      setError("Aucun dépôt associé à votre compte");
      return;
    }
    setLoadingPrevendeurs(true);
    try {
      const response = await apiFetch(`/api/teams/${depot}?role=prevente`);
      const data = await response.json();
      if (!data || !data.prevente) {
        throw new Error("Format de réponse invalide");
      }
      setPrevendeurs(data.prevente);
      if (data.prevente.length === 0) {
        setError("Aucun prévendeur trouvé dans ce dépôt");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des prévendeurs");
    } finally {
      setLoadingPrevendeurs(false);
    }
  };

  // ── 7) Charger les véhicules + personnel ───────────────────────────────
  const loadVehiculesWithPersonnel = async () => {
    if (!depot) {
      setVehiculesError("Aucun dépôt associé à votre compte");
      return;
    }
    setLoadingVehicules(true);
    try {
      const response = await apiFetch(`/vehicles?depot=${depot}`);
      const data = await response.json();
      const filtered = data.filter((v: Vehicle) => v.chauffeur_id && v.livreur_id);
      setVehicules(filtered);
      if (filtered.length === 0) {
        setVehiculesError(
          "Aucun véhicule avec chauffeur et livreur trouvé dans ce dépôt"
        );
      } else {
        setVehiculesError("");
      }
    } catch (err: any) {
      setVehiculesError(err.message || "Erreur lors du chargement des véhicules");
    } finally {
      setLoadingVehicules(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: isModalOpen ? "flex" : "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      position: "relative" as const,
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "8px",
      width: "80%",
      maxWidth: "800px",
      maxHeight: "80vh",
      overflow: "auto",
    },
    closeButton: {
      position: "absolute" as const,
      top: "1rem",
      right: "1rem",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
    },
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadPrevendeurs();
  };

  // ── 8) Pagination et filtrage ─────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 15;
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nom = client.nom_client.toLowerCase();
    const email = client.email.toLowerCase();
    const telephone = client.contact.telephone.toLowerCase();
    return nom.includes(term) || email.includes(term) || telephone.includes(term);
  });

  const validClients = filteredClients.filter((c) => {
    const lat = Number(c.localisation?.coordonnees?.latitude);
    const lon = Number(c.localisation?.coordonnees?.longitude);
    return !Number.isNaN(lat) && !Number.isNaN(lon);
  });

  // Centre si jamais GPS n'a pas répondu, on met sur le premier client existant
  const fallbackCenter: [number, number] = validClients.length
    ? [
        Number(validClients[0].localisation!.coordonnees!.latitude),
        Number(validClients[0].localisation!.coordonnees!.longitude),
      ]
    : [0, 0];

  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // ── 9) Gestion assign / unassign prévendeur ───────────────────────────
  const handleUnassignPrevendeur = async (clientId: string) => {
    try {
      const response = await apiFetch(
        `/clients/${clientId}/unassign-prevendeur`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      alert("Prévendeur retiré avec succès");
      setClients((prev) =>
        prev.map((c) =>
          c._id === clientId ? { ...c, prevendeur_id: undefined } : c
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors du retrait du prévendeur");
    }
  };

  const handleAssignPrevendeur = async (clientId: string, prevendeurId: string) => {
    try {
      const response = await apiFetch(
        `/clients/${clientId}/assign-prevendeur`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ prevendeurId }),
        }
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      alert("Prévendeur assigné avec succès");
      setClients((prev) =>
        prev.map((c) =>
          c._id === clientId ? { ...c, prevendeur_id: prevendeurId } : c
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'assignation du prévendeur");
    }
  };

  // ── 10) Affichage du composant ─────────────────────────────────────────
  // Tant que la géolocalisation n'a pas renvoyé de coordonnée, on affiche un petit message
  if (user?.role === "Pré-vendeur" && currentPos === null) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
          <h1>🗺️ Récupération de votre position…</h1>
          <p>Autorisez la géolocalisation et patientez quelques secondes.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h1>📋 Liste des clients {depot && `du dépôt`}</h1>
          {user?.role === "Superviseur des ventes" && (
            <button
              onClick={handleOpenModal}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1rem",
              }}
            >
              👥 Voir les prévendeurs
            </button>
          )}
          {user?.role === "Administrateur des ventes" && (
            <button
              onClick={() => {
                setIsVehiculesModalOpen(true);
                loadVehiculesWithPersonnel();
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1rem",
              }}
            >
              🚚 Voir les véhicules dispo
            </button>
          )}
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {user?.role === "responsable depot" && (
          <button
            onClick={() => navigate("/clients/add")}
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ➕ Ajouter un client
          </button>
        )}

        {/* Barre de recherche + Réinitialiser */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Recherche par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            disabled={!searchTerm}
          >
            Réinitialiser
          </button>
        </div>

        {/* Carte des clients */}
        {user?.role === "Pré-vendeur" ? (
          <div style={{ height: 500, width: "100%" }}>
            <AnyMapContainer
              center={currentPos!}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              whenCreated={(mapInstance: any) => {
                mapRef.current = mapInstance;
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Marker pour la position du pré-vendeur */}
              <AnyMarker position={currentPos!} icon={motoIcon}>
                <Popup>Vous êtes ici</Popup>
              </AnyMarker>

              {/* Tracer l'itinéraire optimisé en noir */}
              {optimizedRoute.length > 0 && (
                <Polyline
                  positions={optimizedRoute}
                  pathOptions={{ color: "black", weight: 4 }}
                />
              )}

              {/* Markers pour chaque client */}
              {validClients.map((c) => {
                const lat = c.localisation!.coordonnees!.latitude;
                const lon = c.localisation!.coordonnees!.longitude;
                const clientIcon = L.icon({
                  iconUrl: `${apiBase}/public/${
                    c.pfp || "images/default-pfp-client.jpg"
                  }`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                });
                return (
                  <AnyMarker key={c._id} position={[lat, lon]} icon={clientIcon}>
                    <Popup>
                      <div style={{ textAlign: "center" }}>
                        <img
                          src={`${apiBase}/public/${
                            c.pfp || "images/default-pfp-client.jpg"
                          }`}
                          alt="pfp"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginBottom: "0.5rem",
                          }}
                          onError={(e) =>
                            (e.currentTarget.src = `${apiBase}/public/images/default-pfp-client.jpg`)
                          }
                        />
                        <div>Nom : {c.nom_client}</div>
                        <div>Email : {c.email}</div>
                        <div>Gérant : {c.contact.nom_gerant}</div>
                        <div>Téléphone : {c.contact.telephone}</div>

                        {/* ←— Bouton pour ouvrir directement dans Google Maps */}
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                              "_blank"
                            )
                          }
                          style={{
                            ...actionBtn,
                            display: "block",
                            marginTop: "0.5rem",
                            color: "#EF4444",
                          }}
                        >
                          📍 Ouvrir dans Google Maps
                        </button>

                        <button
                          onClick={() => navigate(`/clients/${c._id}`)}
                          style={{
                            ...actionBtn,
                            display: "block",
                            marginTop: "0.5rem",
                          }}
                        >
                          👁️ Voir
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/productlist?clientId=${c._id}`)
                          }
                          style={{ ...actionBtn, color: "#10b981" }}
                        >
                          🛒 Commande
                        </button>
                      </div>
                    </Popup>
                  </AnyMarker>
                );
              })}
            </AnyMapContainer>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={th}>Photo</th>
                  <th style={th}>Nom client</th>
                  <th style={th}>Email</th>
                  <th style={th}>Gérant</th>
                  <th style={th}>Téléphone</th>
                  <th style={th}>Entreprise</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map((client) => (
                  <tr
                    key={client._id}
                    style={{ borderBottom: "1px solid #ccc" }}
                  >
                    <td style={td}>
                      <img
                        src={`${apiBase}/public/${
                          client.pfp || "images/default-pfp-client.jpg"
                        }`}
                        alt="pfp"
                        style={{
                          width: 42,
                          height: 42,
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                        }}
                        onError={(e) =>
                          (e.currentTarget.src = `${apiBase}/public/images/default-pfp-client.jpg`)
                        }
                      />
                    </td>
                    <td style={td}>{client.nom_client}</td>
                    <td style={td}>{client.email}</td>
                    <td style={td}>{client.contact.nom_gerant}</td>
                    <td style={td}>{client.contact.telephone}</td>
                    <td style={td}>
                      {client.affectations[0]?.entreprise ?? "—"}
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => navigate(`/clients/${client._id}`)}
                        style={actionBtn}
                      >
                        👁️ Voir
                      </button>
                      {user?.role === "Pré-vendeur" && (
                        <button
                          onClick={() =>
                            navigate(`/productlist?clientId=${client._id}`)
                          }
                          style={{ ...actionBtn, color: "#10b981" }}
                        >
                          🛒 Commande
                        </button>
                      )}
                      {user?.role === "responsable depot" && (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/clients/${client._id}/edit`)
                            }
                            style={actionBtn}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
                            style={{ ...actionBtn, color: "red" }}
                          >
                            🗑️ Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      Aucun client trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}



        {/* Pagination */}
        {clients.length > clientsPerPage && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === 1 ? "#ddd" : "#4f46e5",
                color: currentPage === 1 ? "#666" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Précédent
            </button>
            <span style={{ alignSelf: "center" }}>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor:
                  currentPage === totalPages ? "#ddd" : "#4f46e5",
                color: currentPage === totalPages ? "#666" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor:
                  currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Modal prévendeurs */}
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
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "1rem",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={th}>Nom</th>
                      <th style={th}>Prénom</th>
                      <th style={th}>Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prevendeurs.map((p) => (
                      <tr
                        key={p._id}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={td}>{p.nom}</td>
                        <td style={td}>{p.prenom}</td>
                        <td style={td}>{p.role}</td>
                      </tr>
                    ))}
                    {prevendeurs.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "center", padding: "1rem" }}
                        >
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

        {/* Modal véhicules */}
        {isVehiculesModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "relative",
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                width: "80%",
                maxWidth: "800px",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              <button
                onClick={() => setIsVehiculesModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>
                Véhicules avec chauffeur et livreur
              </h2>
              {loadingVehicules ? (
                <p>Chargement des véhicules...</p>
              ) : vehiculesError ? (
                <p style={{ color: "red" }}>{vehiculesError}</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "1rem",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Véhicule
                      </th>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Chauffeur
                      </th>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Livreur
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicules.map((v) => (
                      <tr key={v._id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "12px 15px" }}>
                          {v.make} {v.model} ({v.license_plate})
                        </td>
                        <td style={{ padding: "12px 15px" }}>
                          {v.chauffeur_id.prenom} {v.chauffeur_id.nom}
                        </td>
                        <td style={{ padding: "12px 15px" }}>
                          {v.livreur_id.prenom} {v.livreur_id.nom}
                        </td>
                      </tr>
                    ))}
                    {vehicules.length === 0 && !vehiculesError && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "center", padding: "1rem" }}
                        >
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

        {/* Modal d'affectation prévendeur */}
        {isAssignModalOpen && selectedClient && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedClient(null);
                }}
                style={modalStyles.closeButton}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>Affecter un prévendeur</h2>
              <p>
                Client : {selectedClient.prenom} {selectedClient.nom}
              </p>

              {loadingPrevendeurs ? (
                <p>Chargement des prévendeurs...</p>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <button
                      onClick={() =>
                        handleUnassignPrevendeur(selectedClient._id)
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "1rem",
                      }}
                    >
                      Retirer l'affectation
                    </button>
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "1rem",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={th}>Nom</th>
                        <th style={th}>Prénom</th>
                        <th style={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prevendeurs.map((p) => (
                        <tr
                          key={p._id}
                          style={{ borderBottom: "1px solid #ddd" }}
                        >
                          <td style={td}>{p.nom}</td>
                          <td style={td}>{p.prenom}</td>
                          <td style={td}>
                            <button
                              onClick={() =>
                                handleAssignPrevendeur(
                                  selectedClient._id,
                                  p._id
                                )
                              }
                              style={{
                                padding: "0.25rem 0.5rem",
                                backgroundColor: "#4f46e5",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Assigner
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
