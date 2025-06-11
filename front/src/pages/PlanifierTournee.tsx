import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import "../pages-css/PlanifierTournee.css";

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  _id: string;
  clientId: string;
  nom_client: string;
  telephone: string;
  depot: string;
  adresse_client: { adresse?: string; ville?: string; region?: string };
  items: OrderItem[];
  client_latitude?: number;
  client_longitude?: number;
  client_nom?: string;
  client_telephone?: string;
}

interface Product {
  specifications: { poids: string };
}

interface ClientWithWeight {
  _id: string;
  nom_client: string;
  telephone: string;
  localisation: { adresse: string; ville: string; region: string };
  totalWeight: number;
  latitude: number;
  longitude: number;
}

interface Vehicle {
  _id: string;
  capacity: number;
  depot_id: string;
  make: string;
  model: string;
  license_plate: string;
  chauffeur_id?: { _id: string; nom: string; prenom: string };
  livreur_id?: { _id: string; nom: string; prenom: string };
}

interface FleetVehicle {
  id: string;
  start_location: { latitude: number; longitude: number };
  end_location: { latitude: number; longitude: number };
  shift: { start: string; end: string };
  capacity: number;
  make: string;
  model: string;
  license_plate: string;
  chauffeur?: string;
  livreur?: string;
}

const defaultShift = { start: "08:00", end: "14:00" };

const thStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  background: "#f9fafb",
  fontWeight: 700,
};
const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
};

const PlanifierTournee: React.FC = () => {
  const [searchParams] = useSearchParams();
  const depotId = searchParams.get("depot") || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientWithWeight[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [depotCoords, setDepotCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFleetModal, setShowFleetModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!depotId) throw new Error("Aucun dépôt spécifié.");

        // 📦 Commandes
        const rO = await apiFetch(`/api/orders?confirmed=false`);
        const all: Order[] = rO.ok ? await rO.json() : [];
        const filtered = all.filter(o => o.depot === depotId);
        setOrders(filtered);

        // 📋 Grouper par client
        const map: Record<string, any> = {};
        filtered.forEach(o => {
          if (!map[o.clientId]) {
            map[o.clientId] = {
              nom: o.client_nom || o.nom_client,
              tel: o.client_telephone || o.telephone,
              loc: {
                adresse: o.adresse_client.adresse || "",
                ville: o.adresse_client.ville || "",
                region: o.adresse_client.region || "",
              },
              lat: o.client_latitude || 0,
              lon: o.client_longitude || 0,
              items: [] as OrderItem[],
            };
          }
          map[o.clientId].items.push(...o.items);
        });

        // 🍏 Poids
        const pMap: Record<string, number> = {};
        await Promise.all(
          Object.values(map)
            .flatMap(c => c.items.map((i: OrderItem) => i.productId))
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(async pid => {
              const r = await apiFetch(`/products/${pid}`);
              if (r.ok) {
                const p: Product = await r.json();
                pMap[pid] = parseFloat(p.specifications.poids) || 0;
              }
            })
        );

        // 👥 Clients
        const list: ClientWithWeight[] = Object.entries(map).map(([id, c]: any) => ({
          _id: id,
          nom_client: c.nom,
          telephone: c.tel,
          localisation: c.loc,
          latitude: c.lat,
          longitude: c.lon,
          totalWeight: c.items.reduce((s: number, it: OrderItem) => s + (pMap[it.productId] || 0) * it.quantity, 0),
        }));
        setClients(list);

        // 🏭 Coordonnées dépôt
        let coords = { latitude: 0, longitude: 0 };
        const rD = await apiFetch(`/api/depots/${depotId}`);
        if (rD.ok) {
          const d = await rD.json();
          if (d.coordonnees) coords = d.coordonnees;
        }
        setDepotCoords(coords);

        // 🚚 Flotte
        const rV = await apiFetch(`/vehicles/by-depot?depot=${depotId}`);
        const vs: Vehicle[] = rV.ok ? await rV.json() : [];
        setFleet(
          vs
            .filter(v => v.chauffeur_id && v.livreur_id)
            .map(v => ({
              id: v._id,
              start_location: coords,
              end_location: coords,
              shift: { ...defaultShift },
              capacity: v.capacity,
              make: v.make,
              model: v.model,
              license_plate: v.license_plate,
              chauffeur: v.chauffeur_id ? `${v.chauffeur_id.prenom} ${v.chauffeur_id.nom}` : "",
              livreur: v.livreur_id ? `${v.livreur_id.prenom} ${v.livreur_id.nom}` : "",
            }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [depotId]);

  const handleFleetChange = (idx: number, field: "start" | "end", value: string) => {
    setFleet(f => f.map((v, i) => (i === idx ? { ...v, shift: { ...v.shift, [field]: value } } : v)));
  };

  const handlePlanifier = async () => {
    /* … votre logique VRP … */
    alert("Tournée planifiée !");
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>Erreur : {error}</p>;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        {/* Carte de la page */}
        <div className="card">
          <div className="card-header">Planifier une tournée</div>
          <button className="btn" onClick={() => setShowFleetModal(true)}>
            Configurer la flotte
          </button>
        </div>

        <div className="card">
          <div className="card-header">Commandes à livrer</div>
          {clients.length === 0 ? (
            <p>Aucune commande à livrer.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Téléphone</th>
                    <th style={thStyle}>Adresse</th>
                    <th style={thStyle}>Poids (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((cl, i) => (
                    <tr key={cl._id} style={{ background: i % 2 ? "#fafbfc" : "#fff" }}>
                      <td style={tdStyle}>{cl.nom_client}</td>
                      <td style={tdStyle}>{cl.telephone}</td>
                      <td style={tdStyle}>
                        {cl.localisation.adresse}, {cl.localisation.ville}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{cl.totalWeight.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {clients.length > 0 && (
          <div className="card">
            <button className="btn" onClick={handlePlanifier}>
              Planifier la tournée
            </button>
          </div>
        )}

        {showFleetModal && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <button onClick={() => setShowFleetModal(false)} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                ✕
              </button>
              <h2>🚚 Configuration flotte</h2>
              {!fleet.length ? (
                <p>Aucun véhicule trouvé.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={thStyle}>Plaque</th>
                      <th style={thStyle}>Véhicule</th>
                      <th style={thStyle}>Capacité</th>
                      <th style={thStyle}>Chauffeur</th>
                      <th style={thStyle}>Livreur</th>
                      <th style={thStyle}>Début</th>
                      <th style={thStyle}>Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.map((v, idx) => (
                      <tr key={v.id}>
                        <td style={tdStyle}>{v.license_plate}</td>
                        <td style={tdStyle}>{v.make} {v.model}</td>
                        <td style={tdStyle}>{v.capacity}</td>
                        <td style={tdStyle}>{v.chauffeur}</td>
                        <td style={tdStyle}>{v.livreur}</td>
                        <td style={tdStyle}>
                          <input type="time" value={v.shift.start}
                            onChange={e => handleFleetChange(idx, "start", e.target.value)}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input type="time" value={v.shift.end}
                            onChange={e => handleFleetChange(idx, "end", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="dialog-actions">
                <button onClick={() => setShowFleetModal(false)}>Fermer</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default PlanifierTournee;
