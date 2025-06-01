import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { orderService } from "../services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderItem {
  productId: string;
  productName: string;
  prix_detail: number;
  quantity: number;
}
interface Order {
  _id: string;
  numero: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
  nom_client?: string;
  telephone?: string;
  adresse_client?: {
    adresse?: string;
    ville?: string;
    code_postal?: string;
    region?: string;
  };
  depot_name?: string;
  entreprise?: { nom_company?: string };
  etat_livraison: 'en_attente' | 'en_cours' | 'livree';
  statut_chargement: 'en_attente' | 'en_cours' | 'charge';
}

export default function HistoriqueOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  const blRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrders();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError("Format de données invalide");
          setOrders([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError("Erreur lors du chargement des commandes");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleExportPDF = async () => {
    if (!blRef.current) return;
    const canvas = await html2canvas(blRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const imgWidth = 500;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 50, 40, imgWidth, imgHeight);
    pdf.save("bon-de-livraison.pdf");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'en_cours': return '#3b82f6';
      case 'livree': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getLoadingStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'en_cours': return '#3b82f6';
      case 'charge': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      default: return status;
    }
  };

  const getLoadingStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'charge': return 'Chargé';
      default: return status;
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase().trim();
    const numeroStr = (order.numero || order._id).toLowerCase();
    const matchesNumber = numeroStr.includes(term) || order._id.toLowerCase().includes(term);
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString().toLowerCase() : "";
    const matchesDate = dateStr.includes(term);
    const matchesTerm = term === "" || matchesNumber || matchesDate;

    const matchesStatus = selectedStatus === "" || order.etat_livraison === selectedStatus;

    return matchesTerm && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h2>Historique de mes commandes</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Recherche par numéro ou date..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}
          >
            <option value="">Tous états</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="livree">Livrée</option>
          </select>
          <button
            onClick={resetFilters}
            disabled={!searchTerm && !selectedStatus}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: !searchTerm && !selectedStatus ? "not-allowed" : "pointer",
            }}
          >
            Réinitialiser
          </button>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p>Aucun résultat trouvé.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Numéro</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Date</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Total</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Nombre d'articles</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>État de livraison</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>État de chargement</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <button
                      onClick={() => handleOrderClick(order._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontSize: "inherit"
                      }}
                    >
                      {order.numero || order._id}
                    </button>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {order.total.toFixed(2)} €
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {order.items.length}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: getStatusColor(order.etat_livraison),
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {getStatusText(order.etat_livraison)}
                    </span>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: getLoadingStatusColor(order.statut_chargement),
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {getLoadingStatusText(order.statut_chargement)}
                    </span>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.25rem 0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Voir BL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filteredOrders.length > ordersPerPage && (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f3f4f6",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Précédent
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f3f4f6",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* ----------- Modal BL ------------- */}
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 8,
                padding: "2rem",
                minWidth: "320px",
                maxWidth: "95vw",
              }}
            >
              <h3>Bon de Livraison</h3>
              <div
                ref={blRef}
                style={{
                  background: "#f3f4f6",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <b>Numéro de commande :</b> {selectedOrder.numero || selectedOrder._id.slice(-6).toUpperCase()}
                  <br />
                  <b>Client :</b> {selectedOrder.nom_client || "-"}
                  <br />
                  <b>Téléphone :</b> {selectedOrder.telephone || "-"}
                  <br />
                  <b>Adresse :</b>{" "}
                  {(selectedOrder.adresse_client?.adresse || "-") +
                    (selectedOrder.adresse_client?.ville
                      ? ", " + selectedOrder.adresse_client.ville
                      : "") +
                    (selectedOrder.adresse_client?.code_postal
                      ? ", " + selectedOrder.adresse_client.code_postal
                      : "")}
                  <br />
                  <b>Date :</b> {new Date(selectedOrder.createdAt).toLocaleString()}
                  <br />
                  <b>Nom du dépôt :</b> {selectedOrder.depot_name || "-"}
                  <br />
                  <b>Entreprise :</b> {selectedOrder.entreprise?.nom_company || "-"}
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 8,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Produit
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Quantité
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Prix unitaire
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #ddd", padding: 4 }}>
                          {item.productName}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: 4,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: 4 }}>
                          {item.prix_detail?.toFixed(2)} €
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: 4 }}>
                          {(item.prix_detail * item.quantity).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total général : {selectedOrder.total?.toFixed(2)} €
                </div>
              </div>
              <button
                onClick={handleExportPDF}
                style={{
                  background: "#1c1917",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: 4,
                  marginRight: 8,
                }}
              >
                Télécharger le BL en PDF
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "#6366f1",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
