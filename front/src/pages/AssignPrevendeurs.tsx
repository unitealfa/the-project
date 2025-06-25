import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../pages-css/AssignPrevendeurs.css';

// Restore default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

// Define a default icon explicitly, to avoid direct instantiation of L.Icon.Default if it's problematic
const defaultLeafletIcon = L.icon({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// TS-bypass for React-Leaflet components
const AnyMapContainer = MapContainer as any;
const AnyMarker = Marker as any;

// Derive the Icon type from the factory function as a workaround for type resolution issues.
type LeafletIcon = ReturnType<typeof L.icon>;

interface Client {
  _id: string;
  nom_client: string;
  email: string;
  contact: { nom_gerant: string; telephone: string };
  affectations: Array<{
    depot: string;
    prevendeur_id?: string;
  }>;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [activePrevendeur, setActivePrevendeur] = useState<Prevendeur | null>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const iconCache = useRef<Record<string, LeafletIcon>>({});
  const navigate = useNavigate();

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

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const depot = user?.depot;

  useEffect(() => {
    if (!depot) {
      setError('Aucun dépôt associé à votre compte');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Charger les clients
        const clientsRes = await apiFetch(`/clients?depot=${depot}`);
        if (!clientsRes.ok) throw new Error('Erreur lors du chargement des clients');
        const clientsData = await clientsRes.json();
        setClients(clientsData);

        // Charger les prévendeurs
        const prevendeursRes = await apiFetch(`/api/teams/${depot}?role=prevente`);
        if (!prevendeursRes.ok) throw new Error('Erreur lors du chargement des prévendeurs');
        const prevendeursData = await prevendeursRes.json();
        console.log('Données des prévendeurs:', prevendeursData); // Debug

        // Vérifier la structure des données et filtrer les prévendeurs
        const teamMembers = prevendeursData.prevente || [];
        console.log('Membres de l\'équipe:', teamMembers); // Debug

        const filteredPrevendeurs = teamMembers.filter((p: any) => {
          console.log('Vérification du membre:', p); // Debug
          return p.role === 'prevente' || p.role === 'Pré-vendeur';
        });

        console.log('Prévendeurs filtrés:', filteredPrevendeurs); // Debug
        setPrevendeurs(filteredPrevendeurs);
                const palette = ['red','blue','green','orange','violet','grey','gold','black'];
        const mapping: Record<string,string> = {};
        filteredPrevendeurs.forEach((p: any, idx: number) => {
          mapping[p._id] = palette[idx % palette.length];
        });
        setColorMap(mapping);
      } catch (err: any) {
        console.error('Erreur:', err); // Debug
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [depot]);

  const handleAssignPrevendeur = async (clientId: string, prevendeurId: string) => {
    try {
      const res = await apiFetch(`/clients/${clientId}/assign-prevendeur`, {
        method: 'POST',
        body: JSON.stringify({ prevendeurId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'affectation du prévendeur');
      }

      // Mettre à jour la liste des clients
      setClients(prev => prev.map(client => {
        if (client._id === clientId) {
          return {
            ...client,
            affectations: client.affectations.map(aff => {
              if (aff.depot === depot) {
                return { ...aff, prevendeur_id: prevendeurId };
              }
              return aff;
            }),
          };
        }
        return client;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnassignPrevendeur = async (clientId: string) => {
    try {
      const res = await apiFetch(`/clients/${clientId}/unassign-prevendeur`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la désaffectation du prévendeur');
      }

      // Mettre à jour la liste des clients
      setClients(prev => prev.map(client => {
        if (client._id === clientId) {
          return {
            ...client,
            affectations: client.affectations.map(aff => {
              if (aff.depot === depot) {
                return { ...aff, prevendeur_id: undefined };
              }
              return aff;
            }),
          };
        }
        return client;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

    const toggleSelect = (clientId: string) => {
    setSelectedClients(prev => {
      const n = new Set(prev);
      if (n.has(clientId)) n.delete(clientId); else n.add(clientId);
      return n;
    });
  };

  const confirmAssign = async () => {
    if (!activePrevendeur || selectedClients.size === 0) return;
    if (!window.confirm(`Voulez-vous affecter ces clients à ${activePrevendeur.prenom} ${activePrevendeur.nom} ?`)) return;
    for (const id of Array.from(selectedClients)) {
      await handleAssignPrevendeur(id, activePrevendeur._id);
    }
    setSelectedClients(new Set());
  };

  const getPrevendeurName = (prevendeurId: string | undefined) => {
    if (!prevendeurId) return 'Non assigné';
    const prevendeur = prevendeurs.find(p => p._id === prevendeurId);
    return prevendeur ? `${prevendeur.prenom} ${prevendeur.nom}` : 'Inconnu';
  };

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nom = client.nom_client.toLowerCase();
    const email = client.email.toLowerCase();
    const telephone = client.contact.telephone.toLowerCase();
    return nom.includes(term) || email.includes(term) || telephone.includes(term);
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>👥 Affectation des prévendeurs aux clients</h1>
        </div>

        {/* Barre de recherche */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Liste des clients avec leurs prévendeurs assignés */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Client</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Téléphone</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Prévendeur actuel</th>
                <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '.75rem' }}>{client.nom_client}</td>
                  <td style={{ padding: '.75rem' }}>{client.email}</td>
                  <td style={{ padding: '.75rem' }}>{client.contact.telephone}</td>
                  <td style={{ padding: '.75rem' }}>
                    {getPrevendeurName(client.affectations?.[0]?.prevendeur_id)}
                  </td>
                  <td style={{ padding: '.75rem' }}>
                    <select
                      value={client.affectations?.[0]?.prevendeur_id || ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          handleUnassignPrevendeur(client._id);
                        } else {
                          handleAssignPrevendeur(client._id, e.target.value);
                        }
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="">Aucun prévendeur</option>
                      {prevendeurs.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.prenom} {p.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <button
          onClick={() => setShowMap(s => !s)}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          {showMap ? 'Cacher la carte' : 'Afficher la carte'}
        </button>

        {showMap && (
          <div className="assign-map">
            <AnyMapContainer
              center={[
                filteredClients[0]?.localisation?.coordonnees?.latitude || 0,
                filteredClients[0]?.localisation?.coordonnees?.longitude || 0,
              ]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredClients.map(c => {
                const loc = c.localisation?.coordonnees;
                if (!loc) return null;
                const assignedColor = colorMap[c.affectations?.[0]?.prevendeur_id || ''];
                const markerColor = selectedClients.has(c._id)
                  ? colorMap[activePrevendeur?._id || 'blue']
                  : assignedColor;
                const icon = markerColor ? getIcon(markerColor) : defaultLeafletIcon;
                return (
                  <AnyMarker
                    key={c._id}
                    position={[loc.latitude, loc.longitude]}
                    icon={icon}
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
        )}
      </main>
    </>
  );
} 