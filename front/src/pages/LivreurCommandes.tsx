import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  nom_client: string; // Updated to use `nom_client`
  items: OrderItem[];
}

export default function LivreurCommandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const livreurId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/livreurs/${livreurId}/orders`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then((data: Array<{ _id: string; nom_client: string; items: OrderItem[] }>) => setOrders(data))
      .catch(console.error);
  }, [apiBase, livreurId]);

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚚 Commandes à livrer</h1>
        <ul>
          {orders.map(o => (
            <li key={o._id}>
              <strong>{o.nom_client}</strong> {/* Updated to use `nom_client` */}
              <ul>
                {o.items.map((it, i) => (
                  <li key={i}>{it.productName} × {it.quantity}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
