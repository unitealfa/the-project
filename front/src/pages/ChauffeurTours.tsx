// 📁 src/pages/ChauffeurTours.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../pages-css/ChauffeurTours.css";

// Import des icônes Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

// Contournement pour chargement icônes par défaut
delete L.Icon.Default.prototype._getIconUrl;
delete L.Icon.Default.prototype._getShadowUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const defaultIcon = new L.Icon.Default();

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const truckIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/truck-delivery.svg",
  iconSize: [40, 30],
  iconAnchor: [20, 30],
  popupAnchor: [0, -25],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const AnyMapContainer = MapContainer as any;
const AnyMarker = Marker as any;

interface Depot {
  latitude: number;
  longitude: number;
  nom_depot: string;
}
interface Stop {
  _id: string;
  clientName: string;
  latitude: number;
  longitude: number;
}

export default function ChauffeurTours() {
  // ─── États ───────────────────────────────────────────────────────────────
  const [depot, setDepot] = useState<Depot | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [etape, setEtape] = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);
  const [showAllStopsMap, setShowAllStopsMap] = useState(true);
  const [deliveryStarted, setDeliveryStarted] = useState(false);

  // Réfs cartes
  const mapRef = useRef<any>(null);
  const allStopsMapRef = useRef<any>(null);

  // Pour l’alerte unique dans la session de navigation
  const alertedRef = useRef(false);

  // ─── Chauffeur ID et clé localStorage pour alerte ──────────────────────────
  const chauffeurId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const alertKey = `tourneeTermineeAlert_${chauffeurId}`;

  // ─── Géolocalisation du conducteur ────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation non supportée");
      return;
    }
    const watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Erreur Geolocation :", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );
    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  // ─── Récupération des données (dépôt + arrêts) ────────────────────────────
  const apiBase = import.meta.env.VITE_API_URL;
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/chauffeurs/${chauffeurId}/stops`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: { depot: Depot; stops: Stop[] } = await res.json();
        setDepot(data.depot);
        setStops(data.stops || []);
      } catch (err: any) {
        setError(err.message || "Impossible de charger la tournée");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiBase, chauffeurId]);

  // ─── Calcul des waypoints ─────────────────────────────────────────────────
  const waypoints = useMemo(() => {
    if (!depot) return [];
    const pts: { label: string; coords: [number, number] }[] = [
      { label: "Dépôt", coords: [depot.latitude, depot.longitude] },
    ];
    stops.forEach((s, idx) =>
      pts.push({
        label: `Arrêt #${idx + 1}`,
        coords: [s.latitude, s.longitude],
      })
    );
    pts.push({ label: "Dépôt", coords: [depot.latitude, depot.longitude] });
    return pts;
  }, [depot, stops]);

  // ─── Détermination fin de tournée ─────────────────────────────────────────
  const isTermine = etape >= waypoints.length - 1;

  // ─── Alerte “Tournée terminée !” une seule fois, même après refresh ───────
  useEffect(() => {
    if (deliveryStarted && isTermine && !alertedRef.current) {
      const dejaAffiche = localStorage.getItem(alertKey);
      if (!dejaAffiche) {
        alert("Tournée terminée !");
        localStorage.setItem(alertKey, "true");
        alertedRef.current = true;
      }
    }
  }, [deliveryStarted, isTermine, alertKey]);

  // ─── Ajustement vue carte selon mode ───────────────────────────────────────
  useEffect(() => {
    if (!depot) return;

    if (showAllStopsMap && allStopsMapRef.current) {
      const coordsArray = waypoints.map((wp) => wp.coords);
      if (coordsArray.length > 0) {
        allStopsMapRef.current.fitBounds(L.latLngBounds(coordsArray), {
          padding: [50, 50],
        });
      }
    } else if (!showAllStopsMap && mapRef.current) {
      if (!deliveryStarted) {
        mapRef.current.setView([depot.latitude, depot.longitude], 14);
      } else if (etape < waypoints.length && waypoints[etape]) {
        const [lat, lng] = waypoints[etape].coords;
        mapRef.current.setView([lat, lng], 14);
      }
    }
  }, [depot, showAllStopsMap, waypoints, deliveryStarted, etape]);

  // ─── Calcul routeCoords via OSRM en mode étape par étape ─────────────────
  useEffect(() => {
    if (
      waypoints.length < 2 ||
      !driverPosition ||
      showAllStopsMap ||
      !deliveryStarted ||
      isTermine
    ) {
      setRouteCoords([]);
      return;
    }
    const [fLat, fLng] = driverPosition;
    const [tLat, tLng] = waypoints[etape + 1].coords;
    const url = `https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === "Ok" && json.routes?.length) {
          setRouteCoords(
            json.routes[0].geometry.coordinates.map((pt: [number, number]) => [
              pt[1],
              pt[0],
            ])
          );
        } else {
          setRouteCoords([]);
        }
      })
      .catch(() => setRouteCoords([]));
  }, [etape, waypoints, driverPosition, showAllStopsMap, deliveryStarted, isTermine]);

  // ─── Handlers navigation et toggles ───────────────────────────────────────
  const handleNext = () => {
    if (isTermine) return;
    const next = etape + 1;
    setEtape(next);
    if (mapRef.current && waypoints[next]) {
      const [lat, lng] = waypoints[next].coords;
      mapRef.current.setView([lat, lng], 14);
    }
  };

  const handlePrevious = () => {
    if (etape <= 0) return;
    const prev = etape - 1;
    setEtape(prev);
    if (mapRef.current && waypoints[prev]) {
      const [lat, lng] = waypoints[prev].coords;
      mapRef.current.setView([lat, lng], 14);
    }
  };

  const handleStartDelivery = () => {
    setDeliveryStarted(true);
    setShowAllStopsMap(false);
    setEtape(0);
    // Réinitialise l’alerte pour cette tournée
    alertedRef.current = false;
    localStorage.removeItem(alertKey);
    if (mapRef.current && depot) {
      mapRef.current.setView([depot.latitude, depot.longitude], 14);
    }
  };

  const handleToggleMap = () => {
    setShowAllStopsMap((prev) => !prev);
    // Le useEffect d’ajustement de vue s’en chargera
  };

  // ─── Retours précoces après hooks ─────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <h1 className="brutalist-title">🛣️ Chargement de la tournée…</h1>
        </main>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <p style={{ color: "red" }}>{error}</p>
        </main>
      </>
    );
  }
  if (!depot) {
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <p>Impossible de récupérer les coordonnées du dépôt.</p>
        </main>
      </>
    );
  }
  if (stops.length === 0) {
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <h1 className="brutalist-title">🛣️ Pas de tournée pour vous</h1>
          <p className="brutalist-text">
            Il n'y a actuellement aucune tournée assignée à ce chauffeur.
          </p>
        </main>
      </>
    );
  }

  // ─── JSX principal ─────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="brutalist-page-wrapper">
        <h1 className="brutalist-title">🛣️ Tournée du chauffeur</h1>

        {/* Contrôles en haut */}
        <div className="brutalist-button-group">
          {!deliveryStarted && (
            <button
              onClick={handleStartDelivery}
              className="brutalist-button brutalist-start-button"
            >
              Commencer la livraison
            </button>
          )}

          {deliveryStarted && (
            <>
              <p className="brutalist-text">
                <strong className="brutalist-strong">
                  {isTermine
                    ? "Tournée terminée !"
                    : `Prochaine destination : ${
                        waypoints[etape + 1]?.label || "Chargement..."
                      }`}
                </strong>
              </p>
              <div className="brutalist-button-group">
                <button
                  onClick={handleToggleMap}
                  className="brutalist-button brutalist-toggle-button"
                >
                  {showAllStopsMap
                    ? "Voir étape par étape"
                    : "Voir tous les arrêts"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Carte */}
        {showAllStopsMap ? (
          <div className="brutalist-map-container">
            <AnyMapContainer
              center={[depot.latitude, depot.longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              whenCreated={(mapInstance: any) => {
                allStopsMapRef.current = mapInstance;
                // fitBounds géré par useEffect
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {waypoints.map((wp, index) => (
                <AnyMarker
                  key={`waypoint-all-${index}`}
                  position={wp.coords}
                  icon={wp.label === "Dépôt" ? redIcon : defaultIcon}
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <div>
                        <strong>{wp.label}</strong>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${wp.coords[0]},${wp.coords[1]}`,
                            "_blank"
                          )
                        }
                        className="brutalist-popup-button"
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
              ))}
              <Polyline
                key="full-route"
                positions={waypoints.map((wp) => wp.coords)}
                pathOptions={{
                  color: "#1f2937",
                  weight: 4,
                  dashArray: "5, 10",
                }}
              />
              {driverPosition && (
                <AnyMarker
                  key="driver-location-all"
                  position={driverPosition}
                  icon={truckIcon}
                >
                  <Popup>Vous êtes ici</Popup>
                </AnyMarker>
              )}
            </AnyMapContainer>
          </div>
        ) : (
          <div className="brutalist-map-container">
            {/* Flèche gauche */}
            {etape > 0 && deliveryStarted && (
              <button onClick={handlePrevious} className="map-nav-arrow left">
                <span className="arrow-icon">◀</span>
                <span>Précédent</span>
              </button>
            )}
            <AnyMapContainer
              center={[depot.latitude, depot.longitude]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              whenCreated={(mapInstance: any) => {
                mapRef.current = mapInstance;
                // centrer géré par useEffect
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {!isTermine && waypoints[etape + 1] && (
                <AnyMarker
                  key={`marker-destination-${etape}`}
                  position={waypoints[etape + 1].coords}
                  icon={
                    waypoints[etape + 1].label === "Dépôt"
                      ? redIcon
                      : defaultIcon
                  }
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <div>
                        <strong>{waypoints[etape + 1].label}</strong>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${
                              waypoints[etape + 1].coords[0]
                            },${waypoints[etape + 1].coords[1]}`,
                            "_blank"
                          )
                        }
                        className="brutalist-popup-button"
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
              )}
              {routeCoords.length > 0 && (
                <Polyline
                  key={`route-live-${etape}`}
                  positions={routeCoords}
                  pathOptions={{ color: "#1f2937", weight: 4 }}
                />
              )}
              {driverPosition && (
                <AnyMarker
                  key="driver-location"
                  position={driverPosition}
                  icon={truckIcon}
                >
                  <Popup>Vous êtes ici</Popup>
                </AnyMarker>
              )}
            </AnyMapContainer>
            {/* Flèche droite */}
            {!isTermine && deliveryStarted && (
              <button onClick={handleNext} className="map-nav-arrow right">
                <span className="arrow-icon">▶</span>
                <span>Suivant</span>
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
