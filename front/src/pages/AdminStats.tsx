import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";

interface DepotStats {
  _id: string;
  depot_name: string;
  totalOrders: number;
  totalAmount: number;
  ordersInDelivery: number;
  ordersDelivered: number;
}

interface Stats {
  totalOrders: number;
  totalAmount: number;
  ordersInDelivery: number;
  ordersDelivered: number;
  totalReclamations: number;
  reclamationsEnAttente: number;
  reclamationsRejetees: number;
  reclamationsResolues: number;
  topClients: Array<{
    clientId: string;
    nom: string;
    prenom: string;
    nombreCommandes: number;
    montantTotal: number;
    depotName: string;
  }>;
  topProducts: Array<{
    _id: string;
    nom: string;
    totalQuantity: number;
    totalAmount: number;
  }>;
  depotStats: DepotStats[];
}

const AdminStats: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [selectedDepot, setSelectedDepot] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch(`/api/orders/stats/global?period=${period}`);
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div>Chargement des statistiques...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }}
          >
            ← Retour
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              marginBottom: "1rem"
            }}
          >
            ← Retour
          </button>
          <h1 style={{ marginBottom: "1rem" }}>Statistiques globales</h1>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ marginRight: "1rem" }}>Période :</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month' | 'all')}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db"
              }}
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="all">Tout le temps</option>
            </select>
          </div>
        </div>

        {stats && (
          <div style={{ display: "grid", gap: "2rem" }}>
            {/* Statistiques globales */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem"
            }}>
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Commandes totales</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalOrders}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Chiffre d'affaires total</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalAmount.toFixed(2)} €</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>En cours de livraison</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.ordersInDelivery}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Commandes livrées</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.ordersDelivered}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Réclamations totales</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalReclamations}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Réclamations en attente</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>{stats.reclamationsEnAttente}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Réclamations rejetées</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444" }}>{stats.reclamationsRejetees}</p>
              </div>

              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Réclamations résolues</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>{stats.reclamationsResolues}</p>
              </div>
            </div>

            {/* Top clients et statistiques par dépôt */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "2rem"
            }}>
              {/* Top clients */}
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ marginBottom: "1rem" }}>Top 5 des clients les plus fidèles</h2>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {stats.topClients.map((client, index) => (
                    <div
                      key={client.clientId}
                      style={{
                        padding: "1rem",
                        background: "#f9fafb",
                        borderRadius: "0.375rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{index + 1}. {client.nom}</span>
                        <span>{client.nombreCommandes} commandes</span>
                      </div>
                      <div style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
                        Dépôt : {client.depotName}
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        Montant total : {client.montantTotal.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top produits */}
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ marginBottom: "1rem" }}>Top 5 des produits les plus vendus</h2>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {stats.topProducts?.map((product, index) => (
                    <div
                      key={product._id}
                      style={{
                        padding: "1rem",
                        background: "#f9fafb",
                        borderRadius: "0.375rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{index + 1}. {product.nom}</span>
                        <span>{product.totalQuantity} unités</span>
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        Montant total : {product.totalAmount.toFixed(2)} €
                      </div>
                    </div>
                  )) || <p>Aucun produit trouvé</p>}
                </div>
              </div>
            </div>

            {/* Statistiques par dépôt */}
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ marginBottom: "1rem" }}>Statistiques par dépôt</h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {stats.depotStats.map((depot) => (
                  <div
                    key={depot._id}
                    style={{
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      border: selectedDepot === depot._id ? "2px solid #4f46e5" : "none"
                    }}
                    onClick={() => setSelectedDepot(depot._id === selectedDepot ? null : depot._id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span 
                        style={{ 
                          fontWeight: "bold",
                          color: "#4f46e5",
                          textDecoration: "underline",
                          cursor: "pointer"
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche le déclenchement du onClick du parent
                          navigate(`/admin/stats-ventes?depot=${depot._id}`, { replace: false });
                        }}
                      >
                        {depot.depot_name}
                      </span>
                      <span>{depot.totalOrders} commandes</span>
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      Chiffre d'affaires : {depot.totalAmount.toFixed(2)} €
                    </div>
                    {selectedDepot === depot._id && (
                      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                          En cours de livraison : {depot.ordersInDelivery}
                        </div>
                        <div>
                          Commandes livrées : {depot.ordersDelivered}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default AdminStats; 