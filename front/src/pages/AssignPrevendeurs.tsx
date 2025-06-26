import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../pages-css/AssignPrevendeurs.css';

// Restaurer les icônes par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

// Icône par défaut blanche
const defaultLeafletIcon = L.icon({
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-white.png',
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-white.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Bypass typing pour React-Leaflet
const AnyMapContainer: React.FC<any> = MapContainer as any;
const AnyMarker: React.FC<any> = Marker as any;

type LeafletIcon = ReturnType<typeof L.icon>;

interface Client {
  _id: string;
  nom_client: string;
  affectations: Array<{ depot: string; prevendeur_id?: string }>;
  localisation?: { coordonnees?: { latitude: number; longitude: number } };
}

interface Prevendeur {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
  pfp?: string;
}

export default function AssignPrevendeurs() {
  const [clients, setClients] = useState<Client[]>([]);
  const [prevendeurs, setPrevendeurs] = useState<Prevendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [activePrevendeur, setActivePrevendeur] = useState<Prevendeur | null>(null);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const iconCache = useRef<Record<string, LeafletIcon>>({});
  const navigate = useNavigate();

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const depot = user?.depot;

  // Fonction pour récupérer ou créer une icône de marqueur colorée
  const getIcon = (color: string) => {
    if (!iconCache.current[color]) {
      iconCache.current[color] = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    }
    return iconCache.current[color];
  };

  // Chargement initial des clients et prévendeurs
  useEffect(() => {
    if (!depot) {
      setError('Aucun dépôt associé à votre compte');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // Clients
        const resC = await apiFetch(`/clients?depot=${depot}`);
        if (!resC.ok) throw new Error('Erreur lors du chargement des clients');
        setClients(await resC.json());

        // Prévendeurs
        const resP = await apiFetch(`/api/teams/${depot}?role=prevente`);
        if (!resP.ok) throw new Error('Erreur lors du chargement des prévendeurs');
        const dataP = await resP.json();
        const team = dataP.prevente || [];
        const filt = team.filter(
          (p: any) => p.role === 'prevente' || p.role === 'Pré-vendeur'
        );
        setPrevendeurs(filt);

        // Palette de couleurs
        const palette = ['red', 'blue', 'green', 'orange', 'violet', 'grey', 'gold', 'black'];
        const mapCols: Record<string,string> = {};
        filt.forEach((p: any, i: number) => {
          mapCols[p._id] = palette[i % palette.length];
        });
        setColorMap(mapCols);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [depot]);

  // Clic sur un marqueur : n'agit que si un prevendeur est sélectionné
  const toggleSelect = (id: string) => {
    if (!activePrevendeur) return;  // <== Ne rien faire si pas de prevendeur actif
    setSelectedClients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Confirme l'affectation de tous les clients sélectionnés
  const confirmAssign = async () => {
    if (!activePrevendeur || selectedClients.size === 0) return;
    if (!window.confirm(`Affecter ${activePrevendeur.prenom} ${activePrevendeur.nom} ?`))
      return;
    for (const id of selectedClients) {
      await apiFetch(`/clients/${id}/assign-prevendeur`, {
        method: 'POST',
        body: JSON.stringify({ prevendeurId: activePrevendeur._id }),
      });
    }
    // Mise à jour locale
    setClients(list =>
      list.map(c =>
        selectedClients.has(c._id)
          ? {
              ...c,
              affectations: c.affectations.map(a => ({
                ...a,
                prevendeur_id: activePrevendeur._id,
              })),
            }
          : c
      )
    );
    setSelectedClients(new Set());
  };

  if (loading) return <div>Chargement...</div>;
  if (error)   return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>👥 Carte d'affectation des prévendeurs</h1>
        <div className="assign-map" style={{ height: '600px' }}>
          <AnyMapContainer
            center={[
              clients[0]?.localisation?.coordonnees?.latitude  || 0,
              clients[0]?.localisation?.coordonnees?.longitude || 0,
            ]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {clients.map(c => {
              const loc = c.localisation?.coordonnees;
              if (!loc) return null;

              // Détermine la couleur du marqueur
              const assigned = c.affectations[0]?.prevendeur_id;
              const isSelected = selectedClients.has(c._id);
              let color = 'grey';
              if (isSelected && activePrevendeur) {
                color = colorMap[activePrevendeur._id];
              } else if (assigned) {
                color = colorMap[assigned];
              }

              return (
                <AnyMarker
                  key={c._id}
                  position={[loc.latitude, loc.longitude]}
                  icon={getIcon(color)}
                  eventHandlers={{ click: () => toggleSelect(c._id) }}
                >
                  <Popup>{c.nom_client}</Popup>
                </AnyMarker>
              );
            })}
          </AnyMapContainer>

          <div className="prevendeur-palette">
            {prevendeurs.map(p => (
              <img
                key={p._id}
                src={`${import.meta.env.VITE_API_URL}/${p.pfp || 'images/default-user.webp'}`}
                onClick={() => setActivePrevendeur(p)}
                className={activePrevendeur?._id === p._id ? 'active' : ''}
                style={{ borderColor: colorMap[p._id] }}
                title={`${p.prenom} ${p.nom}`}
              />
            ))}
          </div>

          {activePrevendeur && selectedClients.size > 0 && (
            <div className="assign-validate">
              <button onClick={confirmAssign} style={{ padding: '0.5rem 1rem' }}>
                Affecter
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
