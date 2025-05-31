import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";

interface Order {
  _id: string;
  clientId: string;
  nom_client: string;
  telephone: string;
  depot: string;
  depot_name?: string;
  numero?: string;
  confirmed: boolean;
  adresse_client?: {
    adresse?: string;
    ville?: string;
    code_postal?: string;
    region?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    productName: string;
    prix_detail: number;
  }>;
  total: number;
  etat_livraison: 'en_attente' | 'en_cours' | 'livree';
  createdAt: string;
  photosLivraison?: Array<{ url: string; takenAt: string }>;

}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProofFilter, setSelectedProofFilter] = useState<"toutes" | "avec" | "sans">("toutes");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  const rawUser = localStorage.getItem("user");
  const user: {
    depot?: string;
  } | null = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.depot) {
        setError("Aucun dépôt associé à votre compte");
        setLoading(false);
        return;
      }

      try {
        const response = await apiFetch(`/api/orders?depot=${user.depot}`);
        const data = await response.json();
        // Trier les commandes par date décroissante (du plus récent au plus ancien)
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.depot]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' };
  const tdStyle: React.CSSProperties = { padding: '12px', verticalAlign: 'middle' };
  const seeButtonStyle: React.CSSProperties = {
    padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem'
  };
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  };
  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '16px', borderRadius: '8px',
    maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', position: 'relative'
  };
  const closeBtnStyle: React.CSSProperties = {
    position: 'absolute', top: '8px', right: '8px',
    background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer'
  };

  const apiBase = import.meta.env.VITE_API_URL; // ex: "http://localhost:3000"

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDate(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleProofFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProofFilter(e.target.value as any);
    setCurrentPage(1);
  };

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const resetFilters = () => {
    setSearchName("");
    setSearchDate("");
    setSelectedStatus("");
    setSelectedProofFilter("toutes");
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter(order => {
    const termName = searchName.toLowerCase().trim();
    const matchesClient =
      (order.nom_client?.toLowerCase().includes(termName) || 
       order.telephone?.toLowerCase().includes(termName)) ||
      termName === "";

    const dateStr = new Date(order.createdAt)
      .toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
      .toLowerCase();
    const termDate = searchDate.toLowerCase().trim();
    const matchesDate = termDate === "" || dateStr.includes(termDate);

    const matchesStatus = selectedStatus === "" || order.etat_livraison === selectedStatus;

    let matchesProof = true;
    if (selectedProofFilter === "avec") {
      matchesProof = Array.isArray(order.photosLivraison) && order.photosLivraison.length > 0;
    } else if (selectedProofFilter === "sans") {
      matchesProof = !order.photosLivraison || order.photosLivraison.length === 0;
    }

    return matchesClient && matchesDate && matchesStatus && matchesProof;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>Commandes des clients</h1>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Rechercher par client…"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          <input
            type="text"
            placeholder="Rechercher par date…"
            value={searchDate}
            onChange={e => { setSearchDate(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "180px",
            }}
          />

          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <option value="">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="livree">Livrée</option>
          </select>

          <select
            value={selectedProofFilter}
            onChange={e => { setSelectedProofFilter(e.target.value as any); setCurrentPage(1); }}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#fff",
            }}
          >
            <option value="toutes">Toutes preuves</option>
            <option value="avec">Avec preuves</option>
            <option value="sans">Sans preuves</option>
          </select>

          <button
            onClick={() => {
              setSearchName("");
              setSearchDate("");
              setSelectedStatus("");
              setSelectedProofFilter("toutes");
              setCurrentPage(1);
            }}
            disabled={!searchName && !searchDate && !selectedStatus && selectedProofFilter === "toutes"}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor:
                !searchName && !searchDate && !selectedStatus && selectedProofFilter === "toutes"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Réinitialiser
          </button>
        </div>
        {loading ? (
          <p>Chargement des commandes...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p>Aucune commande trouvée pour ce dépôt</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Montant total</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Preuves</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px" }}>
                      {order.nom_client}
                      <br />
                      <small style={{ color: "#6b7280" }}>{order.telephone}</small>
                    </td>
                    <td style={{ padding: "12px" }}>{formatDate(order.createdAt)}</td>
                    <td style={{ padding: "12px" }}>{order.total.toFixed(2)} €</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: order.etat_livraison === "livree" ? "#10b981" : 
                                       order.etat_livraison === "en_cours" ? "#f59e0b" : "#ef4444",
                        color: "white",
                        fontSize: "0.875rem"
                      }}>
                        {order.etat_livraison === "livree" ? "Livrée" :
                         order.etat_livraison === "en_cours" ? "En cours" : "En attente"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {order.etat_livraison === 'livree' && order.photosLivraison?.length
                        ? <button
                            style={seeButtonStyle}
                            onClick={() => {
                              setModalPhotos(order.photosLivraison!.map(p => p.url));
                              setShowModal(true);
                            }}
                          >
                            Voir preuves ({order.photosLivraison.length})
                          </button>
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredOrders.length > ordersPerPage && (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === 1 ? "#ddd" : "#4f46e5",
                color: currentPage === 1 ? "#666" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
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
                backgroundColor: currentPage === totalPages ? "#ddd" : "#4f46e5",
                color: currentPage === totalPages ? "#666" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Suivant →
            </button>
          </div>
        )}
      </main>
      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={closeBtnStyle}>×</button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {modalPhotos.map((relUrl, i) => (
                <img
                  key={i}
                  src={`${apiBase}${relUrl}`}
                  alt={`Preuve ${i+1}`}
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;