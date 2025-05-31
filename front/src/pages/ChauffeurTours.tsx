import React, { useEffect, useState, useRef, useMemo } from 'react';
import Header from '../components/Header';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

// ↓ ALIAS pour désactiver la vérification TS sur MapContainer
const AnyMapContainer = MapContainer as any;

export default function ChauffeurTours() {
  const [depot, setDepot] = useState<Depot | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [etape, setEtape] = useState(0);

  // Tableau de coordonnées lat/lon renvoyées par OSRM
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const chauffeurId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const apiBase = import.meta.env.VITE_API_URL;
  const mapRef = useRef<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/chauffeurs/${chauffeurId}/stops`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }
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

  useEffect(() => {
    if (depot && mapRef.current) {
      mapRef.current.setView([depot.latitude, depot.longitude], 14);
    }
  }, [depot]);

  // Memoisation de waypoints
  const waypoints = useMemo(
    () => {
      if (!depot) return [];
      const pts = [
        { label: `Dépôt`, coords: [depot.latitude, depot.longitude] as [number, number] },
      ];
      stops.forEach((s, idx) =>
        pts.push({ label: `Arrêt #${idx + 1}`, coords: [s.latitude, s.longitude] })
      );
      pts.push({ label: `Retour dépôt`, coords: [depot.latitude, depot.longitude] });
      return pts;
    },
    [depot, stops]
  );

  // Effet OSRM : on relance à chaque changement d'étape ET dès que stops change
  useEffect(() => {
    // On ne lance rien si on n'a pas encore de 2 points
    if (waypoints.length < 2) return;

    // Si on est sur le dernier, on vide la route
    if (etape >= waypoints.length - 1) {
      setRouteCoords([]);
      return;
    }

    const [fromLat, fromLng] = waypoints[etape].coords;
    const [toLat, toLng]     = waypoints[etape + 1].coords;

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.code === 'Ok' && json.routes?.length) {
          // Convertir [lon,lat] ➡ [lat,lon]
          const coords: [number, number][] = json.routes[0].geometry.coordinates
            .map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
          setRouteCoords(coords);
        } else {
          console.error('OSRM:', json);
          setRouteCoords([]);
        }
      })
      .catch(err => {
        console.error('OSRM fetch failed', err);
        setRouteCoords([]);
      });
  }, [etape, stops]);

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
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
              alignSelf: 'flex-start'
            }}
          >
            {isTermine ? 'Tournée terminée' : 'Valider arrivée'}
          </button>
        </div>

        <div style={{ height: 500, width: '100%' }}>
          <AnyMapContainer
            center={[depot.latitude, depot.longitude] as [number, number]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance: any) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* On trace uniquement le segment courant : de waypoints[etape] à waypoints[etape+1] */}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#1f2937', weight: 4 }}
              />
            )}

            {/* Marker de départ du segment courant */}
            <Marker position={waypoints[etape].coords}>
              <Popup>{waypoints[etape].label}</Popup>
            </Marker>
            {/* Marker de destination du segment courant */}
            {etape < waypoints.length - 1 && (
              <Marker position={waypoints[etape + 1].coords}>
                <Popup>{waypoints[etape + 1].label}</Popup>
              </Marker>
            )}
          </AnyMapContainer>
        </div>
      </main>
    </>
  );
}
