import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import { reclamationService, Reclamation } from "../services/reclamationService";
import { orderService, Order } from "../services/orderService";

export default function ReclamationResponse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer la réclamation
        const reclamations = await reclamationService.getReclamationsByOrder(id!);
        if (reclamations && reclamations.length > 0) {
          setReclamation(reclamations[0]);
          
          // Récupérer la commande associée
          const orderData = await orderService.getOrderById(reclamations[0].orderId);
          setOrder(orderData);
        } else {
          setError("Réclamation non trouvée");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reclamation || !response.trim()) return;

    try {
      setSending(true);
      await reclamationService.updateReclamationStatus(reclamation._id, 'resolue', response);
      navigate('/reclamations');
    } catch (err) {
      console.error("Erreur lors de l'envoi de la réponse:", err);
      setError("Erreur lors de l'envoi de la réponse");
    } finally {
      setSending(false);
    }
  };

  const handleReject = async () => {
    if (!reclamation) return;
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter cette réclamation ?")) {
      return;
    }

    try {
      setRejecting(true);
      await reclamationService.updateReclamationStatus(reclamation._id, 'rejeter', 'Réclamation rejetée');
      navigate('/reclamations');
    } catch (err) {
      console.error("Erreur lors du rejet de la réclamation:", err);
      setError("Erreur lors du rejet de la réclamation");
    } finally {
      setRejecting(false);
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
          <h1 style={{ marginBottom: "1rem" }}>Répondre à la réclamation</h1>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem"
        }}>
          {/* Détails de la réclamation et de la commande */}
          <div>
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              marginBottom: "1.5rem"
            }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Détails de la réclamation</h2>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Titre :</strong>
                <p style={{ marginTop: "0.25rem" }}>{reclamation?.titre}</p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Message :</strong>
                <p style={{ marginTop: "0.25rem" }}>{reclamation?.message}</p>
              </div>
              <div>
                <strong>Date de création :</strong>
                <p style={{ marginTop: "0.25rem" }}>
                  {reclamation?.createdAt && new Date(reclamation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {order && (
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Détails de la commande</h2>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Numéro de commande :</strong>
                  <p style={{ marginTop: "0.25rem" }}>#{order._id}</p>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Date de commande :</strong>
                  <p style={{ marginTop: "0.25rem" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Statut :</strong>
                  <p style={{ marginTop: "0.25rem" }}>
                    {order.etat_livraison === 'en_attente' ? 'En attente' :
                     order.etat_livraison === 'en_cours' ? 'En cours de livraison' :
                     order.etat_livraison === 'livree' ? 'Livrée' : order.etat_livraison}
                  </p>
                </div>
                <div>
                  <strong>Articles :</strong>
                  <ul style={{ marginTop: "0.25rem", paddingLeft: "1.5rem" }}>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} - Quantité: {item.quantity} - Prix: {item.prix_detail} €
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de réponse */}
          <div style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <h2 style={{ fontSize: "1.25rem" }}>Répondre au client</h2>
              <button
                onClick={handleReject}
                disabled={rejecting}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  opacity: rejecting ? 0.7 : 1
                }}
              >
                {rejecting ? "Rejet en cours..." : "Rejeter la réclamation"}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Réponse :
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db"
                  }}
                  placeholder="Écrivez votre réponse ici..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  width: "100%",
                  opacity: sending ? 0.7 : 1
                }}
              >
                {sending ? "Envoi en cours..." : "Envoyer la réponse"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
} 