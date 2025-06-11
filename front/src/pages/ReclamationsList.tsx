import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { reclamationService, Reclamation } from "../services/reclamationService";
import { useNavigate } from "react-router-dom";
import { PaginationSearch } from "../components/PaginationSearch";
import "../pages-css/ReclamationsList.css";

export default function ReclamationsList() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [filteredReclamations, setFilteredReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true);
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        let data: Reclamation[];
        if (user?.role.toLowerCase() === "administrateur des ventes" && user.depot) {
          data = await reclamationService.getReclamationsByDepot(user.depot);
        } else {
          data = await reclamationService.getReclamationsByClient();
        }
        console.log("🔔 fetched reclamations:", data); // Log fetched data
        setReclamations(data);
        setFilteredReclamations(data);
      } catch {
        setError("Erreur lors du chargement des réclamations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  useEffect(() => {
    const filtered = reclamations.filter(r => {
      const text = searchTerm.toLowerCase();
      const matchText =
        r.titre.toLowerCase().includes(text) || // Verify correct field names
        r.message.toLowerCase().includes(text) ||
        r.orderId.toLowerCase().includes(text);
      const matchStatus = !selectedStatus || r.status === selectedStatus;
      return matchText && matchStatus;
    });
    setFilteredReclamations(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, reclamations]);

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredReclamations.slice(indexFirst, indexLast);

  const handleReject = async (id: string) => {
    if (!confirm("Rejeter cette réclamation ?")) return;
    setRejectingId(id);
    try {
      await reclamationService.updateReclamationStatus(id, "rejeter", "Réclamation rejetée");
      setReclamations(rs => rs.map(r => r._id === id ? { ...r, status: "rejeter", reponse: "Réclamation rejetée" } : r));
    } finally {
      setRejectingId(null);
    }
  };

  const statusColor = (s: string) =>
    s === "en_attente" ? "#f59e0b" : s === "resolue" ? "#10b981" : s === "rejeter" ? "#ef4444" : "#6b7280";
  const statusText = (s: string) =>
    s === "en_attente" ? "En attente" : s === "resolue" ? "Résolue" : s === "rejeter" ? "Rejetée" : s;

  if (loading) return <><Header/><main className="main"><div className="card">Chargement…</div></main></>;
  if (error)   return <><Header/><main className="main"><div className="card error">{error}</div></main></>;

  return (
    <>
      <Header />
      <main className="main">
        <div className="card header-card">
          <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>
          <h1>Réclamations des clients</h1>
        </div>

        <div className="card search-card">
          <input
            type="text"
            placeholder="Rechercher titre, message ou numéro…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="resolue">Résolue</option>
            <option value="rejeter">Rejetée</option>
          </select>
        </div>

        {filteredReclamations.length > 0 ? (
          currentItems.map(rec => ( // Render paginated slice
            <div key={rec._id} className="card rec-card">
              <div className="rec-header">
                <h2>{rec.titre}</h2>
                <span className="rec-status" style={{ background: statusColor(rec.status) }}>
                  {statusText(rec.status)}
                </span>
              </div>
              <p className="rec-order">Commande #{rec.orderId}</p>
              <p className="rec-msg">{rec.message}</p>
              <div className="rec-footer">
                <span>Le {new Date(rec.createdAt).toLocaleString()}</span>
                <div className="actions">
                  {rec.status === "en_attente" && (
                    <button
                      className="btn-reject"
                      disabled={rejectingId === rec._id}
                      onClick={() => handleReject(rec._id)}
                    >
                      {rejectingId === rec._id ? "Rejet…" : "Rejeter"}
                    </button>
                  )}
                  <button className="btn-respond" onClick={() => navigate(`/reclamations/${rec.orderId}/response`)}>
                    {rec.status === "resolue" ? "Modifier" : rec.status === "rejeter" ? "Modifier" : "Répondre"}
                  </button>
                </div>
              </div>
              {rec.reponse && (
                <div className="rec-response">
                  <strong>Réponse :</strong>
                  <p>{rec.reponse}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card">Aucune réclamation trouvée</div>
        )}

        <div className="pagination">
          <PaginationSearch
            totalItems={filteredReclamations.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </main>
    </>
  );
}
