import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import Header from '@/components/Header';

interface Order {
  _id: string;
  nom_client: string;
  telephone: string;
  total: number;
  createdAt: string;
}

export default function Commandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
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

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h2>Liste des commandes</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : orders.length === 0 ? (
          <p>Aucune commande pour le moment</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #eee', padding: '8px' }}>Nom du client</th>
                <th style={{ border: '1px solid #eee', padding: '8px' }}>Numéro du client</th>
                <th style={{ border: '1px solid #eee', padding: '8px' }}>Total</th>
                <th style={{ border: '1px solid #eee', padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ border: '1px solid #eee', padding: '8px' }}>{order.nom_client}</td>
                  <td style={{ border: '1px solid #eee', padding: '8px' }}>{order.telephone}</td>
                  <td style={{ border: '1px solid #eee', padding: '8px' }}>{order.total.toFixed(2)} €</td>
                  <td style={{ border: '1px solid #eee', padding: '8px' }}>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
