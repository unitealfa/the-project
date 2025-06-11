// @ts-nocheck

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "../utils/api";
import { PaginationSearch } from "../components/PaginationSearch";
import { Search } from "lucide-react";
import "../pages-css/ClientsList.css";

// Restore Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "leaflet/dist/images/marker-icon.png",
  shadowUrl: "leaflet/dist/images/marker-shadow.png",
});

// TS‐bypass for React-Leaflet components
const AnyMapContainer = MapContainer as any;
const AnyMarker = Marker as any;

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: { nom_gerant: string; telephone: string };
  affectations: { entreprise: string; depot: string; prevendeur_id?: string }[];
  pfp?: string;
  localisation?: { coordonnees?: { latitude: number; longitude: number } };
}

export default function ClientsList() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { message?: string }; search: string };
  const debugMessage = location.state?.message ?? null;

  // État principal
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState<string | null>(debugMessage);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Récup user & dépôt
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const query = new URLSearchParams(location.search);
  const depot = user?.depot || query.get("depot") || null;
  const apiBase = import.meta.env.VITE_API_URL;

  // Leaflet (TS bypass)
  const AnyMapContainer = MapContainer as any;
  const AnyMarker = Marker as any;

  // Géoloc + OSRM
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [orderedClients, setOrderedClients] = useState<Client[]>([]);
  const mapRef = useRef<any>(null);
  const lastRef = useRef<[number, number] | null>(null);

  const motoIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/6951/6951721.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  // 1) Chargement clients
  useEffect(() => {
    const url = depot ? `/clients?depot=${depot}` : `/clients`;
    apiFetch(url)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((all: Client[]) => {
        if (user?.role === "Admin" && user.company) {
          setClients(all.filter(c =>
            c.affectations.some(a => a.entreprise === user.company)
          ));
        } else {
          setClients(all);
        }
      })
      .catch(e => setError(e.message));
  }, [depot, user?.company, user?.role]);

  // 2) Géoloc pour Pré-vendeur
  useEffect(() => {
    if (user?.role === "Pré-vendeur" && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        p => setCurrentPos([p.coords.latitude, p.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [user?.role]);

  // 3) Recentre la carte
  useEffect(() => {
    if (currentPos && mapRef.current) {
      mapRef.current.setView(currentPos, 13);
    }
  }, [currentPos]);

  // 4) Calcul OSRM
  useEffect(() => {
    if (!currentPos || clients.length === 0) {
      setRoute([]);
      setOrderedClients([]);
      return;
    }
    const [lat0, lon0] = lastRef.current || [NaN, NaN];
    const [lat1, lon1] = currentPos;
    if (!isNaN(lat0) && Math.hypot(lat1 - lat0, lon1 - lon0) < 0.0005) return;
    lastRef.current = currentPos;
    const valid = clients.filter(c => c.localisation?.coordonnees);
    if (!valid.length) {
      setRoute([]);
      setOrderedClients([]);
      return;
    }
    const coords = [
      `${lon1},${lat1}`,
      ...valid.map(c =>
        `${c.localisation!.coordonnees!.longitude},${c.localisation!.coordonnees!.latitude}`
      )
    ].join(";");
    fetch(`https://router.project-osrm.org/trip/v1/driving/${coords}?source=first&roundtrip=false&geometries=geojson`)
      .then(r => r.json())
      .then(j => {
        if (j.code === "Ok" && j.trips?.length) {
          setRoute(j.trips[0].geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]));
          const order: number[] = j.trips[0].waypoint_indices;
          const stops = order
            .slice(1)
            .map(i => valid[i - 1]);
          setOrderedClients(stops);
        } else {
          setRoute([]);
          setOrderedClients([]);
        }
      })
      .catch(() => {
        setRoute([]);
        setOrderedClients([]);
      });
  }, [currentPos, clients]);

  // Suppression client
  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      const r = await apiFetch(`/clients/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`${r.status}`);
      setClients(c => c.filter(x => x._id !== id));
    } catch (e: any) {
      alert(e.message || "Erreur suppression");
    }
  };

  // Debug
  const showDebug = () => {
    const u = localStorage.getItem("user");
    const info = { user: JSON.parse(u || "{}"), token: !!localStorage.getItem("token"), count: clients.length };
    setDebugInfo(JSON.stringify(info, null, 2));
    setTimeout(() => setDebugInfo(null), 30000);
  };

  // Filtre + pagination
  const filtered = clients.filter(c => {
    const t = searchTerm.toLowerCase().trim();
    return !t
      || c.nom_client.toLowerCase().includes(t)
      || c.email.toLowerCase().includes(t)
      || c.contact.telephone.includes(t);
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Afficher "chargement de position" si currentPos est null
  if (user?.role === "Pré-vendeur" && currentPos === null) {
    return (
      <>
        <Header />
        <main className="container mt-20 py-8 px-4">
          <h1>🗺️ Récupération de votre position…</h1>
        </main>
      </>
    );
  }

  // si pas de géoloc, on centre sur le premier client, sinon sur [0, 0]
  const mapCenter: [number, number] =
    currentPos ??
    (clients[0]?.localisation?.coordonnees
      ? [
        clients[0].localisation.coordonnees.latitude,
        clients[0].localisation.coordonnees.longitude,
      ]
      : [0, 0]);

  return (
    <>
      <Header />
      <main className="container mt-20 py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Liste de vos clients</h1>
          {/* ...existing code for debug or other buttons... */}
        </div>

        {user?.role === "Pré-vendeur" ? (
          <MapContainer
            className="map-wrapper"
            center={currentPos!}
            zoom={13}
            whenCreated={m => (mapRef.current = m)}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {currentPos && (
              <Marker position={currentPos} icon={motoIcon}>
                <Popup>Vous êtes ici</Popup>
              </Marker>
            )}

            {route.length > 0 && (
              <Polyline positions={route} pathOptions={{ color: "black", weight: 4 }} />
            )}

            {clients
              .filter(c => c.localisation?.coordonnees)
              .map(c => {
                const { latitude, longitude } = c.localisation!.coordonnees!;
                const clientIcon = L.icon({
                  iconUrl: `${apiBase}/public/${c.pfp ?? "images/default-pfp-client.jpg"}`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                });
                return (
                  <Marker
                    key={c._id}
                    position={[latitude, longitude]}
                    icon={clientIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <img
                          src={`${apiBase}/public/${c.pfp ?? "images/default-pfp-client.jpg"}`}
                          className="popup-avatar"
                          onError={e => (e.currentTarget.src = `${apiBase}/public/images/default-pfp-client.jpg`)}
                        />
                        <h3>{c.nom_client}</h3>
                        <p>{c.contact.nom_gerant} – {c.contact.telephone}</p>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
                              "_blank"
                            )
                          }
                          className="btn-link"
                        >
                          📍 Google Maps
                        </button>
                        <button onClick={() => navigate(`/clients/${c._id}`)} className="btn-link">
                          👁️ Voir
                        </button>
                        <button
                          onClick={() => navigate(`/productlist?clientId=${c._id}`)}
                          className="btn-success"
                        >
                          🛒 Commande
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        ) : (
          // ── Pour les autres rôles : affichage de la table ──
          <>

            <div className="mb-4">
              <PaginationSearch
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Rechercher un client…"
              />
            </div>

            {/* Tableau des clients */}
            <div className="table-wrapper mb-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Nom client</th>
                    <th>Email</th>
                    <th>Gérant</th>
                    <th>Téléphone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(c => (
                    <tr key={c._id}>
                      <td className="cell-avatar">
                        <img
                          src={`${apiBase}/public/${c.pfp ?? "images/default-pfp-client.jpg"}`}
                          className="table-avatar"
                          onError={e => e.currentTarget.src = `${apiBase}/public/images/default-pfp-client.jpg`}
                        />
                      </td>
                      <td>{c.nom_client}</td>
                      <td>{c.email}</td>
                      <td>{c.contact.nom_gerant}</td>
                      <td>{c.contact.telephone}</td>
                      <td className="cell-actions">
                        <button onClick={() => navigate(`/clients/${c._id}`)} className="icon-btn">👁️</button>
                        {user?.role === "responsable depot" && (
                          <>
                            <button onClick={() => navigate(`/clients/${c._id}/edit`)} className="icon-btn">✏️</button>
                            <button onClick={() => handleDelete(c._id)} className="icon-btn danger">🗑️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="no-data">Aucun client trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PaginationControls si nécessaire */}
            {filtered.length > itemsPerPage && (
              <div className="pagination-controls">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>← Précédent</button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Suivant →</button>
              </div>
            )}
          </>
        )}

        {/* Itinéraire recommandé */}
        {user?.role === "Pré-vendeur" && orderedClients.length > 0 && (
          <div className="itinerary">
            <h2>Itinéraire recommandé</h2>
            <ol>
              {orderedClients.map(c => (
                <li key={c._id}>{c.nom_client}</li>
              ))}
            </ol>
          </div>
        )}

      </main>
    </>
  );
}
