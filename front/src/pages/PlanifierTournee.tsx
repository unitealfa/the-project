import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";

interface OrderItem {
  productId: string;
  quantity: number;
  productName: string;
  prix_detail: number;
}
interface Order {
  _id: string;
  clientId: string;
  nom_client: string;
  telephone: string;
  depot: string;
  confirmed: boolean;
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

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f6f6f7",
  textAlign: "left",
  fontWeight: 700,
  fontSize: "1rem",
  borderBottom: "1px solid #e6e7e9",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid #f1f2f4",
};
const defaultShift = { start: "08:00", end: "14:00" };

const PlanifierTournee: React.FC = () => {
  const [searchParams] = useSearchParams();
  const depotId = searchParams.get("depot");

  const [clients, setClients] = useState<ClientWithWeight[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [depotCoords, setDepotCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!depotId) throw new Error("Aucun dépôt spécifié dans l’URL.");

        // 1. commandes
        const rOrders = await apiFetch(`/api/orders?depot=${depotId}`);
        if (!rOrders.ok) throw new Error("Erreur API orders");
        const raw: Order[] = await rOrders.json();

        const filtered = raw.filter((o) => o.depot === depotId && !o.confirmed);
        setOrders(filtered);
        if (filtered.length === 0) {
          setClients([]);
          setFleet([]);
          setLoading(false);
          return;
        }

        // 2. group by client
        const map: Record<
          string,
          {
            nom: string;
            tel: string;
            loc: any;
            latitude: number;
            longitude: number;
            items: OrderItem[];
          }
        > = {};
        filtered.forEach((o) => {
          if (!map[o.clientId]) {
            map[o.clientId] = {
              nom: o.client_nom || o.nom_client,
              tel: o.client_telephone || o.telephone,
              loc: {
                adresse: o.adresse_client?.adresse ?? "",
                ville: o.adresse_client?.ville ?? "",
                region: o.adresse_client?.region ?? "",
              },
              latitude: o.client_latitude ?? 0,
              longitude: o.client_longitude ?? 0,
              items: [],
            };
          }
          map[o.clientId].items.push(...o.items);
        });

        // 3. poids produits
        const allPids = Array.from(
          new Set(
            Object.values(map).flatMap((c) => c.items.map((i) => i.productId))
          )
        );
        const pMap: Record<string, number> = {};
        await Promise.all(
          allPids.map(async (pid) => {
            const r = await apiFetch(`/products/${pid}`);
            if (r.ok) {
              const p: Product = await r.json();
              pMap[pid] = parseFloat(p.specifications.poids) || 0;
            }
          })
        );

        // 4. liste clients
        let list: ClientWithWeight[] = Object.entries(map).map(([id, c]) => {
          const w = c.items.reduce(
            (s, it) => s + (pMap[it.productId] || 0) * it.quantity,
            0
          );
          return {
            _id: id,
            nom_client: c.nom,
            telephone: c.tel,
            localisation: c.loc,
            totalWeight: w,
            latitude: c.latitude,
            longitude: c.longitude,
          };
        });
        setClients(list);

        // 5. Charger coordonnées du dépôt (une seule fois !)
        let depotCoord: { latitude: number; longitude: number } = {
          latitude: 0,
          longitude: 0,
        };
        const depotRes = await apiFetch(`/api/depots/${depotId}`);
        if (depotRes.ok) {
          const d = await depotRes.json();
          if (
            d.coordonnees &&
            typeof d.coordonnees.latitude === "number" &&
            typeof d.coordonnees.longitude === "number"
          ) {
            depotCoord = d.coordonnees;
          }
        }
        setDepotCoords(depotCoord);

        // 6. CHARGER la flotte de véhicules
        const vRes = await apiFetch(`/vehicles/by-depot?depot=${depotId}`);
        if (!vRes.ok) {
          setFleet([]);
        } else {
          const vehicles: Vehicle[] = await vRes.json();
          const withStaff = vehicles.filter(
            (v) => !!v.chauffeur_id && !!v.livreur_id
          );
          setFleet(
            withStaff.map((v) => ({
              id: v._id,
              start_location: depotCoord,
              end_location: depotCoord,
              shift: { ...defaultShift },
              capacity: v.capacity,
              make: v.make,
              model: v.model,
              license_plate: v.license_plate,
              chauffeur: v.chauffeur_id
                ? `${v.chauffeur_id.prenom} ${v.chauffeur_id.nom}`
                : "",
              livreur: v.livreur_id
                ? `${v.livreur_id.prenom} ${v.livreur_id.nom}`
                : "",
            }))
          );
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [depotId]);

  const handleFleetChange = (idx: number, field: string, value: any) => {
    setFleet((fleet) =>
      fleet.map((v, i) =>
        i === idx ? { ...v, shift: { ...v.shift, [field]: value } } : v
      )
    );
  };

  // 🚨🚨 ADAPTATION DU PAYLOAD POUR L'API 🚨🚨
  const handlePlanifier = () => {
    if (!depotId) return;
    const today = new Date().toISOString().slice(0, 10);

    const stops = clients.map((cl, idx) => ({
      id: cl._id || String(idx + 1), // assure une string
      name: cl.nom_client || null,
      location: { latitude: cl.latitude, longitude: cl.longitude },
      duration: 10,
      load: cl.totalWeight || 1,
      types: null,
      priority: null,
      time_windows: null,
    }));

    const fleetPayload = fleet.map((v, idx) => ({
      id: v.id || String(idx + 1), // assure une string
      start_location: v.start_location,
      end_location: v.end_location,
      shift: v.shift,
      capacity: v.capacity,
      types: null,         
      speed_factor: 1.0
    }));

    const payload = {
      date_interval: {
        start: `${today}T08:00:00`,
        end: `${today}T16:00:00`,
      },
      stops,
      fleet: fleetPayload,
    };

    // Debug du payload pour voir ce qui part à l'API
    console.log("[DEBUG][Planifier][payload envoyé]:", payload);

    // Génération du fichier comme l'API attend
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tournee-payload.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>Erreur : {error}</p>;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>Planifier une tournée</h1>
        <p>
          Dépôt : <b>{depotId}</b>
        </p>

        <button
          onClick={() => setShowFleetModal(true)}
          style={{
            marginBottom: 20,
            background: "#eb984e",
            color: "#fff",
            padding: "0.7rem 1.2rem",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Configurer la flotte 🚚
        </button>

        {showFleetModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(30,40,50,0.15)",
              zIndex: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 30,
                minWidth: 600,
                maxWidth: 1000,
                boxShadow: "0 8px 32px #0002",
                position: "relative",
              }}
            >
              <h2>🚚 Configuration flotte</h2>
              {fleet.length === 0 ? (
                <p>
                  Aucun véhicule avec chauffeur et livreur trouvé dans ce dépôt.
                </p>
              ) : (
                <table
                  style={{ width: "100%", marginTop: 15, marginBottom: 18 }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>ID Véhicule</th>
                      <th style={thStyle}>Plaque</th>
                      <th style={thStyle}>Marque/Modèle</th>
                      <th style={thStyle}>Capacité</th>
                      <th style={thStyle}>Chauffeur</th>
                      <th style={thStyle}>Livreur</th>
                      <th style={thStyle}>Départ (lat/lng)</th>
                      <th style={thStyle}>Arrivée (lat/lng)</th>
                      <th style={thStyle}>Début</th>
                      <th style={thStyle}>Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.map((v, idx) => (
                      <tr key={v.id}>
                        <td style={tdStyle}>{v.id}</td>
                        <td style={tdStyle}>{v.license_plate}</td>
                        <td style={tdStyle}>
                          {v.make} {v.model}
                        </td>
                        <td style={tdStyle}>{v.capacity}</td>
                        <td style={tdStyle}>{v.chauffeur}</td>
                        <td style={tdStyle}>{v.livreur}</td>
                        <td style={tdStyle}>
                          {v.start_location.latitude?.toFixed(5)},{" "}
                          {v.start_location.longitude?.toFixed(5)}
                        </td>
                        <td style={tdStyle}>
                          {v.end_location.latitude?.toFixed(5)},{" "}
                          {v.end_location.longitude?.toFixed(5)}
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="time"
                            value={v.shift.start}
                            onChange={(e) =>
                              handleFleetChange(idx, "start", e.target.value)
                            }
                            style={{ width: 80 }}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="time"
                            value={v.shift.end}
                            onChange={(e) =>
                              handleFleetChange(idx, "end", e.target.value)
                            }
                            style={{ width: 80 }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}
              >
                <button
                  style={{
                    background: "#bbb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    padding: "0.6rem 1.2rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowFleetModal(false)}
                >
                  Fermer
                </button>
              </div>
              <details style={{ marginTop: 6 }}>
                <summary>Debug : Coordonnées du dépôt</summary>
                <pre style={{ fontSize: 13 }}>
                  {JSON.stringify(depotCoords, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {clients.length > 0 && (
          <button
            onClick={handlePlanifier}
            style={{
              margin: "1rem 0",
              padding: "0.8rem 1.6rem",
              background: "#2471a3",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Planifier la tournée
          </button>
        )}

        {clients.length === 0 ? (
          <p style={{ color: "#B22" }}>Aucune commande à livrer.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Téléphone</th>
                  <th style={thStyle}>Adresse</th>
                  <th style={thStyle}>Latitude</th>
                  <th style={thStyle}>Longitude</th>
                  <th style={thStyle}>Poids&nbsp;(kg)</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((cl, i) => (
                  <tr
                    key={cl._id}
                    style={{ background: i % 2 ? "#fafbfc" : "#fff" }}
                  >
                    <td style={tdStyle}>{cl.nom_client}</td>
                    <td style={tdStyle}>{cl.telephone}</td>
                    <td style={tdStyle}>
                      {cl.localisation.adresse}, {cl.localisation.ville},{" "}
                      {cl.localisation.region}
                    </td>
                    <td style={tdStyle}>{cl.latitude?.toFixed(6) ?? "–"}</td>
                    <td style={tdStyle}>{cl.longitude?.toFixed(6) ?? "–"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: "bold",
                        color: "#2471a3",
                      }}
                    >
                      {cl.totalWeight.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default PlanifierTournee;
