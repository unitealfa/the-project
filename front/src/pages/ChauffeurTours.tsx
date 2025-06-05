// 📁 src/pages/ChauffeurTours.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Header from '../components/Header';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Icônes Leaflet (comme avant) ───────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Nouvelle icône « camion de livraison » pour la position du chauffeur
const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/truck-delivery.svg',
  iconSize: [40, 30],       // ajusté pour représenter clairement un camion
  iconAnchor: [20, 30],     // centre horizontal et pointe en bas
  popupAnchor: [0, -25],    // popup juste au-dessus du camion
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// bypass TS
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
  const [depot, setDepot] = useState<Depot | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [etape, setEtape] = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // ── Position « live » du chauffeur (icône camion de livraison) ────────────
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation non supportée');
      return;
    }
    const watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error('Erreur Geolocation :', err);
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

  const chauffeurId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const apiBase = import.meta.env.VITE_API_URL;
  const mapRef = useRef<any>(null);

  // ── 1) FETCH dépôt + arrêts ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/chauffeurs/${chauffeurId}/stops`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: { depot: Depot; stops: Stop[] } = await res.json();
        setDepot(data.depot);
        setStops(data.stops || []);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger la tournée');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiBase, chauffeurId]);

  // ── 2) Recentre la carte « étape » sur le dépôt ───────────────────────────────
  useEffect(() => {
    if (depot && mapRef.current) {
      mapRef.current.setView([depot.latitude, depot.longitude], 14);
    }
  }, [depot]);

  // ── 3) Prépare le tableau waypoints ───────────────────────────────────────────
  const waypoints = useMemo(() => {
    if (!depot) return [];
    const pts: { label: string; coords: [number, number] }[] = [
      { label: 'Dépôt', coords: [depot.latitude, depot.longitude] },
    ];
    stops.forEach((s, idx) =>
      pts.push({ label: `Arrêt #${idx + 1}`, coords: [s.latitude, s.longitude] })
    );
    pts.push({ label: 'Dépôt', coords: [depot.latitude, depot.longitude] });
    return pts;
  }, [depot, stops]);

  // ── 4) OSRM pour un seul segment selon etape ─────────────────────────────────
  useEffect(() => {
    if (waypoints.length < 2) return;
    if (etape >= waypoints.length - 1) {
      setRouteCoords([]);
      return;
    }
    const [fLat, fLng] = waypoints[etape].coords;
    const [tLat, tLng] = waypoints[etape + 1].coords;
    const url = `https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 'Ok' && json.routes?.length) {
          setRouteCoords(
            json.routes[0].geometry.coordinates.map((pt: [number, number]) => [
              pt[1],
              pt[0],
            ])
          );
        } else setRouteCoords([]);
      })
      .catch(() => setRouteCoords([]));
  }, [etape, stops, waypoints]);

  // ── 5) États « loading », « error », pas de dépôt, pas d’arrêts ─────────────────
  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>🛣️ Chargement de la tournée…</h1>
        </main>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <p style={{ color: 'red' }}>{error}</p>
        </main>
      </>
    );
  }
  if (!depot) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <p>Impossible de récupérer les coordonnées du dépôt.</p>
        </main>
      </>
    );
  }
  if (stops.length === 0) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
          <h1>🛣️ Pas de tournée pour vous</h1>
          <p>Il n’y a actuellement aucune tournée assignée à ce chauffeur.</p>
        </main>
      </>
    );
  }

  const isTermine = etape >= waypoints.length - 1;
  const validerArrivee = () => {
    if (isTermine) return;
    const next = etape + 1;
    setEtape(next);
    if (mapRef.current) {
      const [lat, lng] = waypoints[next].coords;
      mapRef.current.setView([lat, lng], 14);
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🛣️ Tournée du chauffeur</h1>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <p>
            <strong>Étape actuelle :</strong>{' '}
            {etape === 0
              ? `Au dépôt (${depot.nom_depot})`
              : etape === waypoints.length - 1
              ? 'Tournée terminée (retour au dépôt)'
              : waypoints[etape].label}
          </p>
          <button
            onClick={validerArrivee}
            disabled={isTermine}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isTermine ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isTermine ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {isTermine ? 'Tournée terminée' : 'Valider arrivée'}
          </button>
        </div>

        {/* ────────────────────────────────────────── */}
        {/* → CARTE « ÉTAPE PAR ÉTAPE » (1 segment unique) */} 
        <div style={{ height: 500, width: '100%' }}>
          <AnyMapContainer
            center={[depot.latitude, depot.longitude]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance: any) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Cas 1 : Dépôt → Arrêt #1 */}
            {etape === 0 && (
              <>
                <AnyMarker
                  position={[depot.latitude, depot.longitude]}
                  icon={redIcon}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>Dépôt</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${depot.latitude},${depot.longitude}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                <AnyMarker position={waypoints[1].coords}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>{waypoints[1].label}</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${waypoints[1].coords[0]},${waypoints[1].coords[1]}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                {routeCoords.length > 0 && (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: '#1f2937', weight: 4 }}
                  />
                )}
              </>
            )}

            {/* Cas 2 : Arrêt i → Arrêt i+1 */}
            {etape > 0 && etape < waypoints.length - 2 && (
              <>
                <AnyMarker position={waypoints[etape].coords}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>{waypoints[etape].label}</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${waypoints[etape].coords[0]},${waypoints[etape].coords[1]}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                <AnyMarker position={waypoints[etape + 1].coords}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>{waypoints[etape + 1].label}</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${waypoints[etape + 1].coords[0]},${waypoints[etape + 1].coords[1]}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                {routeCoords.length > 0 && (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: '#1f2937', weight: 4 }}
                  />
                )}
              </>
            )}

            {/* Cas 3 : Dernier Arrêt → Dépôt */}
            {etape === waypoints.length - 2 && (
              <>
                <AnyMarker position={waypoints[etape].coords}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>{waypoints[etape].label}</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${waypoints[etape].coords[0]},${waypoints[etape].coords[1]}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                <AnyMarker
                  position={waypoints[waypoints.length - 1].coords}
                  icon={redIcon}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div><strong>Dépôt</strong></div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${waypoints[waypoints.length - 1].coords[0]},${waypoints[waypoints.length - 1].coords[1]}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
                {routeCoords.length > 0 && (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: '#1f2937', weight: 4 }}
                  />
                )}
              </>
            )}

            {/* ─── Position « live » du chauffeur (icône camion de livraison) ────── */}
            {driverPosition && (
              <AnyMarker position={driverPosition} icon={truckIcon}>
                <Popup>Vous êtes ici</Popup>
              </AnyMarker>
            )}
          </AnyMapContainer>
        </div>

        {/* ────────────────────────────────────────── */}
        {/* → CARTE « VUE GLOBALE » (tournée entière, en vol d’oiseau) */}
        <div style={{ height: 500, width: '100%', marginTop: '2rem' }}>
          <AnyMapContainer
            center={[depot.latitude, depot.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance: any) => {
              const coordsArray = waypoints.map((wp) => wp.coords);
              if (coordsArray.length > 0) {
                mapInstance.fitBounds(L.latLngBounds(coordsArray), {
                  padding: [50, 50],
                });
              }
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Tous les marqueurs : Dépôt (rouge) + Arrêts (bleus) */}
            {waypoints.map((wp, idx) => {
              const [lat, lon] = wp.coords;
              const isDepot = wp.label === 'Dépôt';
              return (
                <AnyMarker
                  key={idx}
                  position={[lat, lon]}
                  icon={isDepot ? redIcon : undefined}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div>
                        <strong>{wp.label}</strong>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                            '_blank'
                          )
                        }
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 Ouvrir dans Google Maps
                      </button>
                    </div>
                  </Popup>
                </AnyMarker>
              );
            })}

            {/* Polyline « vol d’oiseau » reliant tous les points */}
            {waypoints.length > 1 && (
              <Polyline
                positions={waypoints.map((wp) => wp.coords)}
                pathOptions={{ color: '#e11d48', weight: 3, dashArray: '6 4' }}
              />
            )}
          </AnyMapContainer>
        </div>
      </main>
    </>
  );
}

