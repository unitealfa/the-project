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

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  nom_client?: string;
  role: string;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const parsedUser = JSON.parse(raw);
        setUser(parsedUser);
        console.log("Logged in user role:", parsedUser.role);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

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
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
          <div>Chargement...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          <button
            onClick={() => navigate(-1)}
            style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontSize: '1rem'
            }}
          >
            ← Retour
          </button>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div style={{
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ marginBottom: '1rem' }}>Commande non trouvée</div>
          <button
            onClick={() => navigate(-1)}
            style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontSize: '1rem'
            }}
          >
            ← Retour
          </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              marginBottom: '2rem',
              fontSize: '1rem'
            }}
          >
            ← Retour
          </button>
          <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            Détails de la commande {order.numero || order._id}
          </h1>

        <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
        }}>
            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
          }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Informations de la commande</legend>
            <p><strong>Numéro :</strong> {order.numero || order._id}</p>
            <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Total :</strong> {order.total?.toFixed(2) || '0.00'} €</p>
            <p>
                <strong>État de livraison :</strong>{' '}
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
            </fieldset>

            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Informations client</legend>
              <p><strong>Nom :</strong> {order.nom_client || '-'}</p>
              <p><strong>Téléphone :</strong> {order.telephone || '-'}</p>
              <p><strong>Adresse :</strong> {order.adresse_client?.adresse || '-'}</p>
              <p><strong>Ville :</strong> {order.adresse_client?.ville || '-'}</p>
              <p><strong>Code postal :</strong> {order.adresse_client?.code_postal || '-'}</p>
              <p><strong>Région :</strong> {order.adresse_client?.region || '-'}</p>
            </fieldset>
          </div>

          <fieldset style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: '#fafafa',
            marginBottom: '2rem'
          }}>
            <legend style={{
              padding: '0 1rem',
              color: '#1a1a1a',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>Articles commandés</legend>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', color: '#1a1a1a' }}>{item.productName} × {item.quantity} — {item.prix_detail.toFixed(2)} €</li>
              ))}
            </ul>
          </fieldset>

          {/* Réclamations */}
          {user?.role !== 'Administrateur des ventes' && (
            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa',
              marginBottom: '2rem'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Réclamations</legend>
              <form onSubmit={handleSubmitReclamation} style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Titre"
                  value={newReclamationTitre}
                  onChange={e => setNewReclamationTitre(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    marginRight: '1rem',
                    marginBottom: '0.5rem',
                    width: '200px'
                  }}
                  required
                />
                <textarea
                  placeholder="Votre réclamation"
                  value={newReclamation}
                  onChange={e => setNewReclamation(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    marginRight: '1rem',
                    marginBottom: '0.5rem',
                    width: '100%',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  required
                ></textarea>
              <button
                type="submit"
                disabled={submitting}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
              >
                  Envoyer
              </button>
            </form>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {reclamations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                    <strong>{rec.titre}</strong> — {rec.message}
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </div>
      </div>
    </>
  );
} 