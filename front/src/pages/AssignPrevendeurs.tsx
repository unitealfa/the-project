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

// Icône par défaut
const defaultLeafletIcon = L.icon({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Bypass typing
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

  useEffect(() => {
    if (!depot) {
      setError('Aucun dépôt associé à votre compte');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const resC = await apiFetch(`/clients?depot=${depot}`);
        if (!resC.ok) throw new Error('Erreur chargement clients');
        setClients(await resC.json());

        const resP = await apiFetch(`/api/teams/${depot}?role=prevente`);
        if (!resP.ok) throw new Error('Erreur chargement prévendeurs');
        const dataP = await resP.json();
        const team = dataP.prevente || [];
        const filt = team.filter((p: any) =>
          p.role === 'prevente' || p.role === 'Pré-vendeur'
        );
        setPrevendeurs(filt);

        const palette = ['red','blue','green','orange','violet','grey','gold','black'];
        const map: Record<string,string> = {};
        filt.forEach((p: any, i: number) => {
          map[p._id] = palette[i % palette.length];
        });
        setColorMap(map);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [depot]);

   const toggleSelect = async (id: string) => {
    const client = clients.find(c => c._id === id);
    if (!client) return;

    const isSelected = selectedClients.has(id);
    const currentPrev = client.affectations[0]?.prevendeur_id;

    if (
      isSelected &&
      activePrevendeur &&
      currentPrev === activePrevendeur._id
    ) {
      await apiFetch(`/clients/${id}/unassign-prevendeur`, { method: 'POST' });
      setSelectedClients(s => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setClients(list =>
        list.map(c =>
          c._id === id
            ? {
                ...c,
                affectations: c.affectations.map(a => ({
                  ...a,
                  prevendeur_id: undefined,
                })),
              }
            : c,
        ),
      );
      return;
    }

    setSelectedClients(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
          : c,
      ),
    );
    setSelectedClients(new Set());
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>👥 Carte d'affectation des prévendeurs</h1>
        <div className="assign-map" style={{ height: '600px' }}>
          <AnyMapContainer
            center={[
              clients[0]?.localisation?.coordonnees?.latitude || 0,
              clients[0]?.localisation?.coordonnees?.longitude || 0,
            ]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {clients.map(c => {
              const loc = c.localisation?.coordonnees;
              if (!loc) return null;
              const color = colorMap[c.affectations[0]?.prevendeur_id || ''];
              return (
                <AnyMarker
                  key={c._id}
                  position={[loc.latitude, loc.longitude]}
                  icon={color ? getIcon(color) : defaultLeafletIcon}
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
