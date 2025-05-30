import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { orderService } from "../services/orderService";
import { reclamationService, Reclamation } from "../services/reclamationService";

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
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [newReclamation, setNewReclamation] = useState("");
  const [newReclamationTitre, setNewReclamationTitre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError("ID de commande manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [orderData, reclamationsData] = await Promise.all([
          orderService.getOrderById(orderId),
          reclamationService.getReclamationsByOrder(orderId)
        ]);
        
        if (orderData && typeof orderData === 'object') {
          setOrder(orderData);
        } else {
          setError("Format de données invalide");
        }
        setReclamations(reclamationsData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const handleSubmitReclamation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !newReclamation.trim() || !newReclamationTitre.trim()) return;

    try {
      setSubmitting(true);
      const reclamation = await reclamationService.createReclamation(
        orderId,
        newReclamationTitre.trim(),
        newReclamation.trim()
      );
      setReclamations([reclamation, ...reclamations]);
      setNewReclamation("");
      setNewReclamationTitre("");
    } catch (err) {
      console.error("Erreur lors de l'envoi de la réclamation:", err);
      alert("Erreur lors de l'envoi de la réclamation");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'en_cours': return '#3b82f6';
      case 'livree': return '#10b981';
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

  if (!order) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1rem" }}>Commande non trouvée</div>
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
          <h1 style={{ marginBottom: "1rem" }}>Détails de la commande {order.numero || order._id}</h1>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          <div style={{ 
            background: "white", 
            padding: "1.5rem", 
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Informations de la commande</h2>
            <p><strong>Numéro :</strong> {order.numero || order._id}</p>
            <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Total :</strong> {order.total?.toFixed(2) || '0.00'} €</p>
            <p>
              <strong>État de livraison :</strong>{" "}
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: getStatusColor(order.etat_livraison || 'en_attente'),
                color: 'white',
                fontSize: '0.875rem'
              }}>
                {getStatusText(order.etat_livraison || 'en_attente')}
              </span>
            </p>
          </div>

          <div style={{ 
            background: "white", 
            padding: "1.5rem", 
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Informations client</h2>
            <p><strong>Nom :</strong> {order.nom_client || "-"}</p>
            <p><strong>Téléphone :</strong> {order.telephone || "-"}</p>
            <p><strong>Adresse :</strong> {order.adresse_client?.adresse || "-"}</p>
            <p><strong>Ville :</strong> {order.adresse_client?.ville || "-"}</p>
            <p><strong>Code postal :</strong> {order.adresse_client?.code_postal || "-"}</p>
            <p><strong>Région :</strong> {order.adresse_client?.region || "-"}</p>
          </div>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Articles commandés</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "left" }}>Produit</th>
                <th style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "center" }}>Quantité</th>
                <th style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right" }}>Prix unitaire</th>
                <th style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "0.75rem" }}>{item.productName}</td>
                  <td style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right" }}>{item.prix_detail?.toFixed(2) || '0.00'} €</td>
                  <td style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right" }}>{((item.prix_detail || 0) * (item.quantity || 0)).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right", fontWeight: "bold" }}>Total</td>
                <td style={{ border: "1px solid #ddd", padding: "0.75rem", textAlign: "right", fontWeight: "bold" }}>{order.total?.toFixed(2) || '0.00'} €</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Réclamations</h2>
          
          <form onSubmit={handleSubmitReclamation} style={{ marginBottom: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label 
                htmlFor="reclamation-titre" 
                style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "500"
                }}
              >
                Titre de la réclamation
              </label>
              <input
                id="reclamation-titre"
                type="text"
                value={newReclamationTitre}
                onChange={(e) => setNewReclamationTitre(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem"
                }}
                placeholder="Titre de votre réclamation"
                required
              />
              <label 
                htmlFor="reclamation" 
                style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "500"
                }}
              >
                Message
              </label>
              <textarea
                id="reclamation"
                value={newReclamation}
                onChange={(e) => setNewReclamation(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem"
                }}
                placeholder="Décrivez votre réclamation ici..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? "Envoi en cours..." : "Envoyer la réclamation"}
            </button>
          </form>

          {reclamations.length > 0 ? (
            <div>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Historique des réclamations</h3>
              {reclamations.map((reclamation) => (
                <div
                  key={reclamation._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "0.375rem",
                    padding: "1rem",
                    marginBottom: "1rem"
                  }}
                >
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Date :</strong> {new Date(reclamation.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Titre :</strong> {reclamation.titre}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Message :</strong>
                    <p style={{ marginTop: "0.25rem" }}>{reclamation.message}</p>
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Statut :</strong>{" "}
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
                  {reclamation.reponse && (
                    <div style={{ 
                      marginTop: "1rem",
                      padding: "1rem",
                      background: "#f3f4f6",
                      borderRadius: "0.375rem"
                    }}>
                      <strong>Réponse :</strong>
                      <p style={{ marginTop: "0.25rem" }}>{reclamation.reponse}</p>
                      {reclamation.reponseDate && (
                        <small style={{ color: "#6b7280" }}>
                          Répondu le {new Date(reclamation.reponseDate).toLocaleString()}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Aucune réclamation pour cette commande.</p>
          )}
        </div>
      </main>
    </>
  );
} 