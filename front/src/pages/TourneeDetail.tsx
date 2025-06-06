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
  statut_chargement: 'en_cours' | 'charge';
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
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isControleur = user.role === 'Contrôleur';
  
  useEffect(() => {
    console.log('User:', user);
    console.log('Is Controleur:', isControleur);
    console.log('User Role:', user.role);
    console.log('User Role Type:', typeof user.role);
    console.log('Contrôleur Type:', typeof 'Contrôleur');
    console.log('Role Comparison:', user.role === 'Contrôleur');
    console.log('User Role Length:', user.role?.length);
    console.log('Contrôleur Length:', 'Contrôleur'.length);
    console.log('User Role Chars:', user.role?.split('').map((c: string) => `${c} (${c.charCodeAt(0)})`));
    console.log('Contrôleur Chars:', 'Contrôleur'.split('').map((c: string) => `${c} (${c.charCodeAt(0)})`));
    console.log('Tournee:', tournee);
    console.log('Statut Chargement:', tournee?.statut_chargement);
    console.log('Statut Type:', typeof tournee?.statut_chargement);
  }, [user, isControleur, tournee]);

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

  const updateLoadingStatus = async (status: 'en_cours' | 'charge') => {
    try {
      const res = await fetch(`${apiBase}/tournees/${id}/loading-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedTournee = await res.json();
        setTournee(updatedTournee);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de chargement:', error);
    }
  };

  const getLoadingStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return '#3b82f6';
      case 'charge': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getLoadingStatusText = (status: string) => {
    switch (status) {
      case 'en_cours': return 'Chargement en cours';
      case 'charge': return 'Chargé';
      default: return status;
    }
  };

  useEffect(() => {
    console.log('Rendu des boutons:', {
      isControleur,
      statut: tournee?.statut_chargement,
      showValidateButton: isControleur && tournee?.statut_chargement === 'en_cours',
      showCancelButton: isControleur && tournee?.statut_chargement === 'charge'
    });
  }, [isControleur, tournee]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!tournee) return <div>Aucune tournée trouvée</div>;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              color: '#1a1a1a',
              fontSize: '2rem',
              borderBottom: '2px solid #1a1a1a',
              paddingBottom: '0.5rem'
            }}>Détails de la tournée</h1>
            <button
              onClick={() => navigate('/tournees')}
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
              Retour à la liste
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '2rem'
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
              }}>Informations générales</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Date :</strong><br/>
                <span style={{ color: '#666' }}>{new Date(tournee.date).toLocaleDateString()}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Nombre de véhicules :</strong><br/>
                <span style={{ color: '#666' }}>{tournee.vehicles.length}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Statut de chargement :</strong><br/>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: getLoadingStatusColor(tournee.statut_chargement),
                  color: 'white',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem'
                }}>
                  {getLoadingStatusText(tournee.statut_chargement)}
                </span>
              </p>
              {tournee.total_travel_time && (
                <p style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#1a1a1a' }}>Temps de trajet total :</strong><br/>
                  <span style={{ color: '#666' }}>{tournee.total_travel_time} minutes</span>
                </p>
              )}
              {tournee.total_travel_distance && (
                <p>
                  <strong style={{ color: '#1a1a1a' }}>Distance totale :</strong><br/>
                  <span style={{ color: '#666' }}>{tournee.total_travel_distance} km</span>
                </p>
              )}
            </fieldset>

            {isControleur && (
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
                }}>Actions</legend>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {tournee.statut_chargement === 'en_cours' && (
                    <button
                      onClick={() => updateLoadingStatus('charge')}
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
                      Valider le chargement
                    </button>
                  )}
                  {tournee.statut_chargement === 'charge' && (
                    <button
                      onClick={() => updateLoadingStatus('en_cours')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      Annuler la validation
                    </button>
                  )}
                </div>
              </fieldset>
            )}
          </div>

          {tournee.solution?.date1 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{
                color: '#1a1a1a',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '0.5rem'
              }}>Produits à charger par véhicule</h2>
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
                      padding: '1.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <h3 style={{
                      color: '#1a1a1a',
                      fontSize: '1.25rem',
                      marginBottom: '1rem'
                    }}>Véhicule {vehicleId}</h3>
                    <div style={{ marginTop: '1rem' }}>
                      {vehicle.ordered_stops
                        .filter(stop => 
                          !stop.stop_id.startsWith('end_') && 
                          stop.products && 
                          stop.products.length > 0
                        )
                        .map((stop, index) => (
                          <div key={stop.stop_id} style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{
                              color: '#1a1a1a',
                              fontSize: '1.1rem',
                              marginBottom: '1rem'
                            }}>Arrêt {index + 1} - Client {stop.stop_id}</h4>
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              marginTop: '0.5rem',
                              backgroundColor: '#ffffff',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <thead>
                                <tr>
                                  <th style={{
                                    textAlign: 'left',
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    borderBottom: '1px solid #e0e0e0',
                                    color: '#1a1a1a'
                                  }}>Produit</th>
                                  <th style={{
                                    textAlign: 'right',
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    borderBottom: '1px solid #e0e0e0',
                                    color: '#1a1a1a'
                                  }}>Quantité</th>
                                  <th style={{
                                    textAlign: 'right',
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    borderBottom: '1px solid #e0e0e0',
                                    color: '#1a1a1a'
                                  }}>Prix unitaire</th>
                                  <th style={{
                                    textAlign: 'right',
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    borderBottom: '1px solid #e0e0e0',
                                    color: '#1a1a1a'
                                  }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stop.products.map((product, pIndex) => (
                                  <tr key={pIndex}>
                                    <td style={{
                                      padding: '0.75rem',
                                      borderBottom: '1px solid #e0e0e0',
                                      color: '#666'
                                    }}>{product.productName}</td>
                                    <td style={{
                                      textAlign: 'right',
                                      padding: '0.75rem',
                                      borderBottom: '1px solid #e0e0e0',
                                      color: '#666'
                                    }}>{product.quantity}</td>
                                    <td style={{
                                      textAlign: 'right',
                                      padding: '0.75rem',
                                      borderBottom: '1px solid #e0e0e0',
                                      color: '#666'
                                    }}>{product.prix_detail.toFixed(2)} €</td>
                                    <td style={{
                                      textAlign: 'right',
                                      padding: '0.75rem',
                                      borderBottom: '1px solid #e0e0e0',
                                      color: '#666'
                                    }}>{(product.quantity * product.prix_detail).toFixed(2)} €</td>
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
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{
                color: '#1a1a1a',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '0.5rem'
              }}>Arrêts non planifiés</h2>
              <div style={{
                backgroundColor: '#fafafa',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: '#666'
                }}>
                  {JSON.stringify(tournee.unscheduled, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 