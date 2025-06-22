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

  // Helper function to get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'en_attente': return '#f59e0b'; // Yellow-orange
      case 'en_cours': return '#3b82f6'; // Blue
      case 'livree': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      default: return status || '';
    }
  };

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
        alert("Erreur lors du chargement des données");
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
      alert("Erreur lors de l'envoi de la réponse");
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
      alert("Erreur lors du rejet de la réclamation");
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{
          padding: "2rem",
          maxWidth: "1000px", // Increased max width slightly
          margin: "0 auto",
          backgroundColor: '#f4f7f6', // Soft background color
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
         }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Softer shadow
          }}>
            <div>Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{
          padding: "2rem",
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div> {/* Red color for error */}
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: '#4a5568', // Darker gray for secondary action
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
            >
              ← Retour
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{
        padding: "2rem",
        maxWidth: "1000px", // Increased max width slightly
        margin: "0 auto",
        backgroundColor: '#f4f7f6', // Soft background color
        minHeight: 'calc(100vh - 64px)',
        fontFamily: 'Arial, sans-serif'
       }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Softer shadow
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#4a5568', // Darker gray for secondary action
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              marginBottom: '2rem',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            ← Retour
          </button>
          <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            Répondre à la réclamation
          </h1>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", // Responsive grid
            gap: "2rem",
            marginBottom: "2rem"
          }}>
            {/* Détails de la réclamation */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fff', // White background for cards
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' // Subtle shadow for cards
            }}>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Détails de la réclamation</h2>
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: '#555' }}>Titre :</strong>
                <p style={{ marginTop: "0.5rem", color: '#333' }}>{reclamation?.titre}</p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: '#555' }}>Message :</strong>
                <p style={{ marginTop: "0.5rem", color: '#333' }}>{reclamation?.message}</p>
              </div>
              <div>
                <strong style={{ color: '#555' }}>Date de création :</strong>
                <p style={{ marginTop: "0.5rem", color: '#333' }}>
                  {reclamation?.createdAt && new Date(reclamation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Détails de la commande */}
            {order && (
              <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff', // White background for cards
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
              }}>
                <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Détails de la commande</h2>
                <div style={{ marginBottom: "1rem" }}>
                  <strong style={{ color: '#555' }}>Numéro de commande :</strong>
                  <p style={{ marginTop: "0.5rem", color: '#333' }}>#{order._id}</p>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong style={{ color: '#555' }}>Date de commande :</strong>
                  <p style={{ marginTop: "0.5rem", color: '#333' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <strong style={{ color: '#555' }}>Statut :</strong>
                  {/* Apply styling to the status text */}
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px', // Pill shape
                    backgroundColor: getStatusColor(order.etat_livraison),
                    color: 'white',
                    fontSize: '0.875rem', // Smaller font size
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(order.etat_livraison)}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#555' }}>Articles :</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", color: '#333' }}>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} - Quantité: {item.quantity} - Prix: {item.prix_detail} DZD
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de réponse */}
          <div style={{
             border: '1px solid #e0e0e0',
             borderRadius: '8px',
             padding: '1.5rem',
             backgroundColor: '#fff', // White background for cards
             boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
             marginTop: '2rem' // Ensure spacing if only one detail section is shown
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem", // Increased spacing
              paddingBottom: '1rem', // Added padding bottom
              borderBottom: '1px solid #eee' // Added border bottom
            }}>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem' }}>Répondre au client</h2>
              <button
                onClick={handleReject}
                disabled={rejecting}
                style={{
                  backgroundColor: "#e53e3e", // Red color for reject
                  color: "white",
                  border: 'none',
                  borderRadius: '20px', // Making it more rounded
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  opacity: rejecting ? 0.7 : 1,
                  fontSize: '1rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {rejecting ? "Rejet en cours..." : "Rejeter la réclamation"}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="reponse" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 'bold', color: '#555' }}>
                  Votre réponse :
                </label>
                <textarea
                  id="reponse"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    padding: '0.75rem',
                    border: '1px solid #ccc', // Lighter border
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    // Add focus style if needed later
                    // ':focus': { borderColor: '#007bff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' }
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                style={{
                  backgroundColor: '#1a1a1a', // Dark button
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  opacity: sending ? 0.7 : 1,
                  transition: 'background-color 0.2s ease'
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