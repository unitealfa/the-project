import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { orderService } from "../services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../pages-css/HistoriqueOrders.css";

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
  etat_livraison: "en_attente" | "en_cours" | "livree" | "non_livree";
  statut_chargement: "en_attente" | "en_cours" | "charge";
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

  /* --- Chargement des commandes --- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await orderService.getClientOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setError("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --- PDF --- */
  const handleExportPDF = async () => {
    if (!blRef.current) return;
    const canvas = await html2canvas(blRef.current);
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 500;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 50, 40, imgWidth, imgHeight);
    pdf.save("bon-de-livraison.pdf");
  };

  /* --- Helpers --- */
  const statusColors: Record<string, string> = {
    en_attente: "#f59e0b",
    en_cours: "#3b82f6",
    livree: "#10b981",
  };
  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    en_cours: "En cours",
    livree: "Livrée",
  };

  /* --- Filtrage & pagination --- */
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase().trim();
    const byNum =
      (o.numero || o._id).toLowerCase().includes(term) ||
      o._id.toLowerCase().includes(term);
    const byDate = new Date(o.createdAt)
      .toLocaleString()
      .toLowerCase()
      .includes(term);
    const termOK = term === "" || byNum || byDate;
    const statusOK = selectedStatus === "" || o.etat_livraison === selectedStatus;
    return termOK && statusOK;
  });
  const lastIdx = currentPage * ordersPerPage;
  const currentOrders = filteredOrders.slice(lastIdx - ordersPerPage, lastIdx);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  /* --- Handlers --- */
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

  /* --- Render --- */
  return (
    <>
      <Header />
      <main className="ho-page">
        <h2 className="ho-title">Historique de mes commandes</h2>

        {/* Filtres */}
        <div className="ho-controls">
          <input
            type="text"
            placeholder="Recherche par numéro ou date…"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select value={selectedStatus} onChange={handleStatusChange}>
            <option value="">Tous états</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="livree">Livrée</option>
          </select>
          <button
            className="ho-reset-btn"
            onClick={resetFilters}
            disabled={!searchTerm && !selectedStatus}
          >
            Réinitialiser
          </button>
        </div>

        {/* Tableau */}
        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p>Aucun résultat trouvé.</p>
        ) : (
          <table className="ho-table" aria-label="Historique des commandes">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Total</th>
                <th>Articles</th>
                <th>État</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <button
                      style={{
                        background: "none",
                        border: 0,
                        color: "#4f46e5",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                      onClick={() => navigate(`/orders/${o._id}`)}
                    >
                      {o.numero || o._id}
                    </button>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.total.toFixed(2)} DZD</td>
                  <td style={{ textAlign: "center" }}>{o.items.length}</td>
                  <td>
                    <span
                      className="ho-status-badge"
                      style={{ background: statusColors[o.etat_livraison] }}
                    >
                      {statusLabels[o.etat_livraison]}
                    </span>
                  </td>
                  <td>
                    <button
                      className="ho-btn"
                      style={{ background: "#4f46e5", color: "#fff" }}
                      onClick={() => setSelectedOrder(o)}
                    >
                      Voir BL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className="ho-pagination">
            <button
              className="ho-btn"
              style={{ background: "#f3f4f6" }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Précédent
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button
              className="ho-btn"
              style={{ background: "#f3f4f6" }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Modal BL */}
        {selectedOrder && (
          <div
            className="ho-modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="ho-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
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
                <p>
                  <b>Numéro&nbsp;:</b> {selectedOrder.numero || selectedOrder._id}
                  <br />
                  <b>Client&nbsp;:</b> {selectedOrder.nom_client || "-"}
                  <br />
                  <b>Téléphone&nbsp;:</b> {selectedOrder.telephone || "-"}
                  <br />
                  <b>Adresse&nbsp;:</b>{" "}
                  {(selectedOrder.adresse_client?.adresse || "-") +
                    (selectedOrder.adresse_client?.ville
                      ? ", " + selectedOrder.adresse_client.ville
                      : "") +
                    (selectedOrder.adresse_client?.code_postal
                      ? ", " + selectedOrder.adresse_client.code_postal
                      : "")}
                  <br />
                  <b>Date&nbsp;:</b>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                  <br />
                  <b>Dépôt&nbsp;:</b> {selectedOrder.depot_name || "-"}
                  <br />
                  <b>Entreprise&nbsp;:</b>{" "}
                  {selectedOrder.entreprise?.nom_company || "-"}
                </p>
                <table className="ho-table" style={{ marginBottom: 8 }}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Qté</th>
                      <th>PU</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.productName}</td>
                        <td style={{ textAlign: "center" }}>{it.quantity}</td>
                        <td>{it.prix_detail.toFixed(2)} DZD</td>
                        <td>{(it.prix_detail * it.quantity).toFixed(2)} DZD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total général&nbsp;: {selectedOrder.total.toFixed(2)} DZD
                </p>
              </div>
              <button
                className="ho-btn"
                style={{ background: "#1c1917", color: "#fff", marginRight: 8 }}
                onClick={handleExportPDF}
              >
                Télécharger le PDF
              </button>
              <button
                className="ho-btn"
                style={{ background: "#6366f1", color: "#fff" }}
                onClick={() => setSelectedOrder(null)}
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
