import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";

/* ---------- Types ---------- */
interface OrderItem {
  productId: string;
  quantity: number;
  productName: string;
  prix_detail: number;
  _id?: string;
}

interface Order {
  _id: string;
  clientId: string;
  nom_client: string;
  telephone: string;
  depot: string;
  depot_name?: string;
  numero?: string | null;
  confirmed: boolean;
  adresse_client: {
    adresse?: string;
    ville?: string;
    region?: string;
    code_postal?: string;
    _id?: string;
  };
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
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
}

/* ---------- Styles Tables ---------- */
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

/* ---------- Component ---------- */
const PlanifierTournee: React.FC = () => {
  /* --- query string --- */
  const [searchParams] = useSearchParams();
  const depotId = searchParams.get("depot");

  /* --- state --- */
  const [clients, setClients] = useState<ClientWithWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --- data load --- */
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!depotId) throw new Error("Aucun dépôt spécifié dans l’URL.");

        // 1. Récupère toutes les commandes du dépôt
        const resOrders = await apiFetch(`/api/orders?depot=${depotId}`);
        if (!resOrders.ok) throw new Error("Impossible de charger les commandes.");
        const orders: Order[] = await resOrders.json();

        // 2. Filtrer les commandes non livrées
        const unconfirmedOrders = orders.filter((o) => o.confirmed === false);

        // 3. Grouper par client
        const clientsMap: Record<
          string,
          {
            clientId: string;
            nom_client: string;
            telephone: string;
            localisation: { adresse: string; ville: string; region: string };
            items: OrderItem[];
          }
        > = {};

        for (const o of unconfirmedOrders) {
          if (!clientsMap[o.clientId]) {
            clientsMap[o.clientId] = {
              clientId: o.clientId,
              nom_client: o.nom_client,
              telephone: o.telephone,
              localisation: {
                adresse: o.adresse_client?.adresse ?? "",
                ville: o.adresse_client?.ville ?? "",
                region: o.adresse_client?.region ?? "",
              },
              items: [],
            };
          }
          clientsMap[o.clientId].items.push(...(o.items || []));
        }

        // 4. Récupération poids des produits
        const allProductIds = Array.from(
          new Set(Object.values(clientsMap).flatMap((cl) => cl.items.map((it) => it.productId)))
        );
        const productMap: Record<string, number> = {};

        await Promise.all(
          allProductIds.map(async (pid) => {
            const res = await apiFetch(`/products/${pid}`);
            if (res.ok) {
              const p: Product = await res.json();
              productMap[pid] = parseFloat(p.specifications.poids) || 0;
            }
          })
        );

        // 5. Calcul poids total client
        const clientList: ClientWithWeight[] = Object.values(clientsMap).map((cl) => {
          const totalWeight = cl.items.reduce(
            (sum, it) => sum + (productMap[it.productId] || 0) * it.quantity,
            0
          );
          return {
            _id: cl.clientId,
            nom_client: cl.nom_client,
            telephone: cl.telephone,
            localisation: cl.localisation,
            totalWeight,
          };
        });

        setClients(clientList);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [depotId]);

  /* --- planifier tournée --- */
  const handlePlanifierTournee = async () => {
    if (!depotId) return;
    try {
      const res = await fetch(`/api/tournees/planifier?depotId=${depotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      await res.json();
      alert("Tournée planifiée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la planification de la tournée.");
    }
  };

  /* --- render --- */
  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>Erreur : {error}</p>;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ marginBottom: "1rem" }}>Planifier une tournée</h1>
        <p style={{ marginBottom: "2rem" }}>
          Dépôt : <strong>{depotId}</strong>
        </p>

        {clients.length > 0 && (
          <button
            onClick={handlePlanifierTournee}
            style={{
              background: "#2471a3",
              color: "#fff",
              border: "none",
              padding: "12px 32px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
              marginBottom: "1.8rem",
              boxShadow: "0 2px 6px rgba(36,113,163,0.08)",
              letterSpacing: ".04em",
            }}
          >
            Planifier la tournée
          </button>
        )}

        {clients.length === 0 ? (
          <p>Aucun client en attente de livraison.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              maxWidth: "100vw",
              boxShadow: "0 2px 16px 0 rgba(0,0,0,0.09)",
              borderRadius: "14px",
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
                  <th style={thStyle}>Nom du client</th>
                  <th style={thStyle}>Téléphone</th>
                  <th style={thStyle}>Adresse</th>
                  <th style={thStyle}>Poids total commandé&nbsp;(kg)</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((cl, idx) => (
                  <tr
                    key={cl._id}
                    style={{ background: idx % 2 ? "#fafbfc" : "#fff" }}
                  >
                    <td style={tdStyle}>{cl.nom_client}</td>
                    <td style={tdStyle}>{cl.telephone}</td>
                    <td style={tdStyle}>
                      {cl.localisation.adresse}, {cl.localisation.ville},{" "}
                      {cl.localisation.region}
                    </td>
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
