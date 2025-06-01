import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { reclamationService, Reclamation } from "../services/reclamationService";
import { useNavigate } from "react-router-dom";
import { PaginationSearch } from "@/components/PaginationSearch";

export default function ReclamationsList() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [filteredReclamations, setFilteredReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer l'utilisateur connecté
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;

        let data;
        if (user?.role === "Administrateur des ventes" && user?.depot) {
          // Si c'est un admin des ventes, récupérer les réclamations de son dépôt
          data = await reclamationService.getReclamationsByDepot(user.depot);
        } else {
          // Sinon, récupérer les réclamations du client connecté
          data = await reclamationService.getReclamationsByClient();
        }
        
        setReclamations(data);
        setFilteredReclamations(data);
      } catch (err) {
        console.error("Erreur lors du chargement des réclamations:", err);
        setError("Erreur lors du chargement des réclamations");
      } finally {
        setLoading(false);
      }
    };
    fetchReclamations();
  }, []);

  useEffect(() => {
    // Filtrer les réclamations en fonction du terme de recherche et du statut
    const filtered = reclamations.filter(reclamation => {
      const matchesSearch = 
        reclamation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reclamation.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reclamation.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === '' || reclamation.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredReclamations(filtered);
    setCurrentPage(1); // Réinitialiser la page courante lors d'un nouveau filtre
  }, [searchTerm, selectedStatus, reclamations]);

  // Calculer les réclamations à afficher pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReclamations.slice(indexOfFirstItem, indexOfLastItem);

  const handleReject = async (reclamationId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter cette réclamation ?")) {
      return;
    }

    try {
      setRejectingId(reclamationId);
      await reclamationService.updateReclamationStatus(reclamationId, 'rejeter', 'Réclamation rejetée');
      // Rafraîchir la liste des réclamations
      const updatedReclamations = reclamations.map(r => 
        r._id === reclamationId ? { ...r, status: 'rejeter' as const, reponse: 'Réclamation rejetée' } : r
      );
      setReclamations(updatedReclamations);
    } catch (err) {
      console.error("Erreur lors du rejet de la réclamation:", err);
      setError("Erreur lors du rejet de la réclamation");
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'resolue': return '#10b981';
      case 'rejeter': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'resolue': return 'Résolue';
      case 'rejeter': return 'Rejetée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div>Chargement...</div>
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
          <h1 style={{ marginBottom: "1rem" }}>Réclamations des clients</h1>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <PaginationSearch
            totalItems={filteredReclamations.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Rechercher par titre, message ou numéro de commande..."
          />
          
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ fontWeight: "bold" }}>Filtrer par statut :</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                backgroundColor: "white"
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="resolue">Résolue</option>
              <option value="rejeter">Rejetée</option>
            </select>
          </div>
        </div>

        {currentItems.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gap: "1rem"
          }}>
            {currentItems.map((reclamation) => (
              <div
                key={reclamation._id}
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem"
                }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{reclamation.titre}</h2>
                    <p style={{ color: "#6b7280" }}>
                      Commande #{reclamation.orderId}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: getStatusColor(reclamation.status),
                    color: 'white',
                    fontSize: '0.875rem'
                  }}>
                    {getStatusText(reclamation.status)}
                  </span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Message :</strong>
                  <p style={{ marginTop: "0.25rem" }}>{reclamation.message}</p>
                </div>

                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <span>
                    Créée le {new Date(reclamation.createdAt).toLocaleString()}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {reclamation.status === 'en_attente' ? (
                      <>
                        <button
                          onClick={() => handleReject(reclamation._id)}
                          disabled={rejectingId === reclamation._id}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            opacity: rejectingId === reclamation._id ? 0.7 : 1
                          }}
                        >
                          {rejectingId === reclamation._id ? "Rejet en cours..." : "Rejeter"}
                        </button>
                        <button
                          onClick={() => navigate(`/reclamations/${reclamation.orderId}/response`)}
                          style={{
                            background: "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          Répondre
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/reclamations/${reclamation.orderId}/response`)}
                        style={{
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          padding: "0.5rem 1rem",
                          cursor: "pointer",
                          fontSize: "0.875rem"
                        }}
                      >
                        {reclamation.status === 'resolue' ? "Modifier la réponse" : "Modifier le rejet"}
                      </button>
                    )}
                  </div>
                </div>

                {reclamation.reponse && (
                  <div style={{ 
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "#f3f4f6",
                    borderRadius: "0.375rem"
                  }}>
                    <strong>Réponse :</strong>
                    <p style={{ marginTop: "0.25rem" }}>{reclamation.reponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem",
            background: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <p>Aucune réclamation trouvée</p>
          </div>
        )}
      </main>
    </>
  );
} 