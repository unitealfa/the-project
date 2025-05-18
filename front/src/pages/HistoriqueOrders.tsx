import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { orderService } from "@/services/orderService";

interface Order {
  _id: string;
  numero: string;
  createdAt: string;
  total: number;
  items: any[];
  // Ajoute d'autres champs si besoin
}

export default function HistoriqueOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data || []);
      } catch (err) {
        setError("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h2>Historique de mes commandes</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : orders.length === 0 ? (
          <p>Vous n'avez pas encore passé de commande.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Numéro</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Date</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Total</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Nombre d'articles</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{order.numero || order._id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{new Date(order.createdAt).toLocaleString()}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{order.total.toFixed(2)} €</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{order.items.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
} 