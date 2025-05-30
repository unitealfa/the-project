import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  nom_client: string;
  items: OrderItem[];
  etat_livraison: 'en_attente' | 'en_cours' | 'livree';
}

export default function LivreurCommandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const livreurId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, [apiBase, livreurId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiBase}/livreurs/${livreurId}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const updateDeliveryStatus = async (orderId: string, status: 'en_attente' | 'en_cours' | 'livree') => {
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders(); // Rafraîchir la liste des commandes
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
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

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚚 Commandes à livrer</h1>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map(o => (
            <div key={o._id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{o.nom_client}</h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: getStatusColor(o.etat_livraison),
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {getStatusText(o.etat_livraison)}
                </span>
              </div>
              <ul style={{ margin: '0 0 1rem 0', padding: '0 0 0 1.5rem' }}>
                {o.items.map((it, i) => (
                  <li key={i}>{it.productName} × {it.quantity}</li>
                ))}
              </ul>
              {o.etat_livraison !== 'livree' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {o.etat_livraison === 'en_attente' && (
                    <button
                      onClick={() => updateDeliveryStatus(o._id, 'en_cours')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Commencer la livraison
                    </button>
                  )}
                  {o.etat_livraison === 'en_cours' && (
                    <button
                      onClick={() => updateDeliveryStatus(o._id, 'livree')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Valider la livraison
                    </button>
                  )}
                </div>
              )}
              {o.etat_livraison === 'livree' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => updateDeliveryStatus(o._id, 'en_cours')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler la validation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
