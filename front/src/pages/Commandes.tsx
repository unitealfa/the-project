import React, { ChangeEvent, useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import Header from "@/components/Header";

interface OrderItem {
  productId: string;
  productName: string;
  prix_detail: number;
  quantity: number;
}

interface AdresseClient {
  adresse?: string;
  ville?: string;
  code_postal?: string;
  region?: string;
}

interface Order {
  _id: string;
  numero?: string; // champ optionnel si tu veux un "beau" numéro de commande
  nom_client: string;
  telephone: string;
  total: number;
  createdAt: string;
  depot?: string;
  depot_name?: string;
  entreprise?: { nom_company?: string };
  items: OrderItem[];
  adresse_client?: AdresseClient;
}

export default function Commandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la recherche
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // revenir à la page 1 dès qu'on modifie le filtre
  };

  const resetFilter = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Filtrer sur nom_client, telephone ou date (createdAt)
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const nom = order.nom_client.toLowerCase();
    const telephone = order.telephone.toLowerCase();
    const dateLocale = new Date(order.createdAt).toLocaleString().toLowerCase();

    return (
      nom.includes(term) ||
      telephone.includes(term) ||
      dateLocale.includes(term)
    );
  });

  // Pagination sur filteredOrders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h2>Liste des commandes</h2>
        {/* Barre de recherche + Reset */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Recherche par nom, téléphone ou date..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={resetFilter}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            disabled={!searchTerm}
          >
            Réinitialiser
          </button>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : filteredOrders.length === 0 ? (
          <p>Aucune commande pour le moment</p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #eee", padding: "8px" }}>
                    Nom du client
                  </th>
                  <th style={{ border: "1px solid #eee", padding: "8px" }}>
                    Numéro du client
                  </th>
                  <th style={{ border: "1px solid #eee", padding: "8px" }}>
                    Total
                  </th>
                  <th style={{ border: "1px solid #eee", padding: "8px" }}>
                    Date
                  </th>
                  <th style={{ border: "1px solid #eee", padding: "8px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ border: "1px solid #eee", padding: "8px" }}>
                      {order.nom_client}
                    </td>
                    <td style={{ border: "1px solid #eee", padding: "8px" }}>
                      {order.telephone}
                    </td>
                    <td style={{ border: "1px solid #eee", padding: "8px" }}>
                      {order.total?.toFixed(2)} DZD
                    </td>
                    <td style={{ border: "1px solid #eee", padding: "8px" }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td style={{ border: "1px solid #eee", padding: "8px" }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "0.25rem 0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Contrôles de pagination */}
            {filteredOrders.length > ordersPerPage && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      currentPage === 1 ? "#ddd" : "#4f46e5",
                    color: currentPage === 1 ? "#666" : "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Précédent
                </button>
                <span style={{ alignSelf: "center" }}>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      currentPage === totalPages ? "#ddd" : "#4f46e5",
                    color:
                      currentPage === totalPages ? "#666" : "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal pour voir le BL */}
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
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "2rem",
                minWidth: "320px",
                maxWidth: "95vw",
              }}
            >
              <h3>Bon de Livraison</h3>
              <div
                style={{
                  background: "#f3f4f6",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                {/* AJOUT ICI */}
                  <div style={{ marginBottom: 8 }}>
                    <b>Numéro de commande :</b> {selectedOrder?.numero || selectedOrder?._id?.slice(-6).toUpperCase() || "-"}<br />
                    <b>Client :</b> {selectedOrder.nom_client || "-"}<br />
                    <b>Téléphone :</b> {selectedOrder.telephone || "-"}<br />
                    <b>Adresse :</b>{" "}
                      {(selectedOrder.adresse_client?.adresse || "-") +
                        (selectedOrder.adresse_client?.ville ? ", " + selectedOrder.adresse_client.ville : "") +
                        (selectedOrder.adresse_client?.code_postal ? ", " + selectedOrder.adresse_client.code_postal : "")}<br />
                    <b>Date :</b> {new Date(selectedOrder.createdAt).toLocaleString()}<br />
                    <b>Nom du dépôt :</b> {selectedOrder?.depot_name || "-"}
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
                          {item.prix_detail?.toFixed(2)} DZD
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: 4 }}>
                          {(item.prix_detail * item.quantity).toFixed(2)} DZD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total général : {selectedOrder.total?.toFixed(2)} DZD
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: 4,
                  marginRight: 8,
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
