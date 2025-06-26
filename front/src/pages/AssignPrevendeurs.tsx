// src/pages/AssignPrevendeurs.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../pages-css/AssignPrevendeurs.css";
import "../pages-css/DashboardAdmin.css";

// Restore default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "leaflet/dist/images/marker-icon.png",
  shadowUrl: "leaflet/dist/images/marker-shadow.png",
});

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
interface DragSelectProps {
  clients: Client[];
  onSelect: (ids: string[]) => void;
  color: string;
}

const DragSelect: React.FC<DragSelectProps> = ({
  clients,
  onSelect,
  color,
}) => {
  useMapEvent("mousedown", (e: any) => {
    if (!e.originalEvent || e.originalEvent.detail !== 2) return;
    const map: any = e.target;
    map.dragging.disable();
    const start = e.latlng;
    const rect = L.rectangle([start, start], {
      color,
      weight: 1,
      fillColor: color,
      fillOpacity: 0.1,
    }).addTo(map);
    const onMouseMove = (ev: any) =>
      rect.setBounds(L.latLngBounds(start, ev.latlng));
    const onMouseUp = () => {
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      map.dragging.enable();
      const bounds = rect.getBounds();
      const ids = clients
        .filter((c) => {
          const loc = c.localisation?.coordonnees;
          return loc ? bounds.contains([loc.latitude, loc.longitude]) : false;
        })
        .map((c) => c._id);
      onSelect(ids);
      map.removeLayer(rect);
    };
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);
  });
  return null;
};

export default function AssignPrevendeurs() {
  const [clients, setClients] = useState<Client[]>([]);
  const [prevendeurs, setPrevendeurs] = useState<Prevendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    new Set()
  );
  const [activePrevendeur, setActivePrevendeur] = useState<Prevendeur | null>(
    null
  );
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const iconCache = useRef<Record<string, LeafletIcon>>({});
  const navigate = useNavigate();

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const depot = user?.depot;

  const getIcon = (color: string) => {
    if (!iconCache.current[color]) {
      iconCache.current[color] = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
      setError("Aucun dépôt associé à votre compte");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const resC = await apiFetch(`/clients?depot=${depot}`);
        if (!resC.ok) throw new Error("Erreur chargement clients");
        setClients(await resC.json());
        const resP = await apiFetch(`/api/teams/${depot}?role=prevente`);
        if (!resP.ok) throw new Error("Erreur chargement prévendeurs");
        const dataP = await resP.json();
        const team: Prevendeur[] = dataP.prevente || [];
        const filt = team.filter(
          (p) => p.role === "prevente" || p.role === "Pré-vendeur"
        );
        setPrevendeurs(filt);
        const palette = [
          "red",
          "blue",
          "green",
          "orange",
          "violet",
          "grey",
          "gold",
          "black",
        ];
        const mapCols: Record<string, string> = {};
        filt.forEach((p, i) => (mapCols[p._id] = palette[i % palette.length]));
        setColorMap(mapCols);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [depot]);

  const handleUnassign = async (id: string) => {
    const res = await apiFetch(`/clients/${id}/unassign-prevendeur`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Erreur désaffectation");
    } else {
      setClients((list) =>
        list.map((c) =>
          c._id === id
            ? {
                ...c,
                affectations: c.affectations.map((a) => ({
                  ...a,
                  prevendeur_id: undefined,
                })),
              }
            : c
        )
      );
    }
  };

  const toggleSelect = async (id: string) => {
    if (!activePrevendeur) {
      handleUnassign(id);
      return;
    }
    // if client already assigned to this prevendeur, unassign
    const cli = clients.find((c) => c._id === id);
    const curr = cli?.affectations[0]?.prevendeur_id;
    if (curr === activePrevendeur._id) {
      await handleUnassign(id);
      setSelectedClients((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      return;
    }
    // else toggle in selection set
    setSelectedClients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmAssign = async () => {
    if (!activePrevendeur || selectedClients.size === 0) return;
    if (
      !window.confirm(
        `Affecter ${activePrevendeur.prenom} ${activePrevendeur.nom} ?`
      )
    )
      return;
    for (const id of selectedClients) {
      await apiFetch(`/clients/${id}/assign-prevendeur`, {
        method: "POST",
        body: JSON.stringify({ prevendeurId: activePrevendeur._id }),
      });
    }
    setClients((list) =>
      list.map((c) =>
        selectedClients.has(c._id)
          ? {
              ...c,
              affectations: c.affectations.map((a) => ({
                ...a,
                prevendeur_id: activePrevendeur._id,
              })),
            }
          : c
      )
    );
    setSelectedClients(new Set());
  };
  const cancelAssign = () => setSelectedClients(new Set());

  if (loading)
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <h1 className="brutalist-title">Chargement...</h1>
        </main>
      </>
    );
  if (error)
    return (
      <>
        <Header />
        <main className="brutalist-page-wrapper">
          <p style={{ color: "red" }}>{error}</p>
        </main>
      </>
    );

  return (
    <>
      <Header />
      <main className="brutalist-page-wrapper">
        <h1 className="brutalist-title">
          👥 Carte d'affectation des prévendeurs
        </h1>
        <div className="assign-map brutalist-map-container">
          <AnyMapContainer
            center={[
              clients[0]?.localisation?.coordonnees?.latitude || 0,
              clients[0]?.localisation?.coordonnees?.longitude || 0,
            ]}
            zoom={13}
            doubleClickZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {activePrevendeur && (
              <DragSelect
                clients={clients}
                onSelect={(ids) =>
                  setSelectedClients((prev) => {
                    const n = new Set(prev);
                    ids.forEach((i) => n.add(i));
                    return n;
                  })
                }
                color={colorMap[activePrevendeur._id]}
              />
            )}{" "}
            {clients.map((c) => {
              const loc = c.localisation?.coordonnees;
              if (!loc) return null;
              const assigned = c.affectations[0]?.prevendeur_id;
              const isSel = selectedClients.has(c._id);
              let color = "grey";
              if (isSel && activePrevendeur)
                color = colorMap[activePrevendeur._id];
              else if (assigned) color = colorMap[assigned];
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
            {prevendeurs.map((p) => (
              <img
                key={p._id}
                src={`${import.meta.env.VITE_API_URL}/${
                  p.pfp || "images/default-user.webp"
                }`}
                onClick={() => setActivePrevendeur(p)}
                className={activePrevendeur?._id === p._id ? "active" : ""}
                style={{
                  borderColor: colorMap[p._id],
                  width: activePrevendeur?._id === p._id ? "48px" : "32px",
                  height: activePrevendeur?._id === p._id ? "48px" : "32px",
                }}
                title={`${p.prenom} ${p.nom}`}
              />
            ))}
          </div>
          {activePrevendeur && (
            <div className="selected-label">
              {activePrevendeur.prenom} {activePrevendeur.nom}
            </div>
          )}
          {activePrevendeur && selectedClients.size > 0 && (
            <div className="assign-validate">
              <button onClick={confirmAssign}>Affecter</button>
              <button className="cancel" onClick={cancelAssign}>
                Annuler
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
