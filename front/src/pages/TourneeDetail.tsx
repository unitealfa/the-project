import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  prix_detail: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
}

interface Stop {
  stop_id: string;
  orders: Order[];
  products: OrderItem[];
}

interface Vehicle {
  ordered_stops: Stop[];
}

interface Tournee {
  _id: string;
  depot: string;
  date: string;
  stops: string[];
  vehicles: string[];
  total_travel_time?: number;
  total_travel_distance?: number;
  solution?: {
    date1: Record<string, Vehicle>;
  };
  unscheduled?: any[];
}

export default function TourneeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournee, setTournee] = useState<Tournee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!id) {
      setError('ID de tournée manquant');
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/tournees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Données de la tournée:', data);
        console.log('Solution:', data.solution);
        if (data.solution?.date1) {
          Object.entries(data.solution.date1).forEach(([vehicleId, vehicle]) => {
            const typedVehicle = vehicle as Vehicle;
            console.log(`Véhicule ${vehicleId}:`, typedVehicle);
            typedVehicle.ordered_stops.forEach((stop: Stop, index: number) => {
              console.log(`Arrêt ${index + 1} (${stop.stop_id}):`, {
                orders: stop.orders,
                products: stop.products
              });
            });
          });
        }
        setTournee(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération de la tournée:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiBase, token, id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!tournee) return <div>Aucune tournée trouvée</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Détails de la tournée</h1>
          <button
            onClick={() => navigate('/tournees')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Retour à la liste
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2>Informations générales</h2>
            <p>Date : {new Date(tournee.date).toLocaleDateString()}</p>
            <p>Nombre d'arrêts : {tournee.stops.length}</p>
            <p>Nombre de véhicules : {tournee.vehicles.length}</p>
            {tournee.total_travel_time && (
              <p>Temps de trajet total : {tournee.total_travel_time} minutes</p>
            )}
            {tournee.total_travel_distance && (
              <p>Distance totale : {tournee.total_travel_distance} km</p>
            )}
          </div>

          {tournee.solution?.date1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Produits à charger par véhicule</h2>
              {Object.entries(tournee.solution.date1)
                .filter(([_, vehicle]) => 
                  vehicle.ordered_stops.some(stop => 
                    !stop.stop_id.startsWith('end_') && 
                    stop.products && 
                    stop.products.length > 0
                  )
                )
                .map(([vehicleId, vehicle]) => (
                  <div
                    key={vehicleId}
                    style={{
                      marginBottom: '2rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      backgroundColor: '#fff',
                    }}
                  >
                    <h3>Véhicule {vehicleId}</h3>
                    <div style={{ marginTop: '1rem' }}>
                      {vehicle.ordered_stops
                        .filter(stop => 
                          !stop.stop_id.startsWith('end_') && 
                          stop.products && 
                          stop.products.length > 0
                        )
                        .map((stop, index) => (
                          <div key={stop.stop_id} style={{ marginBottom: '1rem' }}>
                            <h4>Arrêt {index + 1} - Client {stop.stop_id}</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                    Produit
                                  </th>
                                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                    Quantité
                                  </th>
                                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                    Prix unitaire
                                  </th>
                                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {stop.products.map((product, pIndex) => (
                                  <tr key={pIndex}>
                                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                      {product.productName}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                      {product.quantity}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                      {product.prix_detail.toFixed(2)} €
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                      {(product.quantity * product.prix_detail).toFixed(2)} €
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tournee.unscheduled && tournee.unscheduled.length > 0 && (
            <div>
              <h2>Arrêts non planifiés</h2>
              <pre style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                overflow: 'auto'
              }}>
                {JSON.stringify(tournee.unscheduled, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 