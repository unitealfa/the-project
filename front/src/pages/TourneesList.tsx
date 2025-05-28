import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Tournee {
  _id: string;
  depot: string;
  date: string;
  stops: string[];
  vehicles: string[];
  total_travel_time?: number;
  total_travel_distance?: number;
}

export default function TourneesList() {
  const navigate = useNavigate();
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    if (!user?.depot) {
      setError('Aucun dépôt associé à votre compte');
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/tournees/depot/${user.depot}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTournees(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiBase, token, user?.depot]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tournées du dépôt</h1>

        {tournees.length === 0 ? (
          <p>Aucune tournée trouvée</p>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            {tournees.map((tournee) => (
              <div
                key={tournee._id}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#fff',
                }}
              >
                <h3>Tournée du {new Date(tournee.date).toLocaleDateString()}</h3>
                <p>Nombre d'arrêts : {tournee.stops.length}</p>
                <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                {tournee.total_travel_time && (
                  <p>Temps de trajet total : {tournee.total_travel_time} minutes</p>
                )}
                {tournee.total_travel_distance && (
                  <p>Distance totale : {tournee.total_travel_distance} km</p>
                )}
                <button
                  onClick={() => navigate(`/tournees/${tournee._id}`)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
} 