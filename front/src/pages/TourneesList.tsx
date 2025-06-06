// src/pages/TourneesList.tsx
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
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  // On affiche uniquement les 5 dernières tournées sur la page principale
  const recentTournees = tournees.slice(-5);

  // Pagination logic for history
  const totalPages = Math.ceil(tournees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = tournees.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tournées du dépôt</h1>

        {/* Bouton pour afficher l'historique complet */}
        {tournees.length > 5 && (
          <button
            onClick={() => {
              setShowHistory(true);
              setCurrentPage(1);
            }}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Historique des tournées
          </button>
        )}

        {recentTournees.length === 0 ? (
          <p>Aucune tournée trouvée</p>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            {recentTournees.map((tournee) => (
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
                <h3>
                  Tournée du {new Date(tournee.date).toLocaleDateString()}
                </h3>
                <p>Nombre d'arrêts : {tournee.stops.length}</p>
                <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                {tournee.total_travel_time && (
                  <p>
                    Temps de trajet total : {tournee.total_travel_time} minutes
                  </p>
                )}
                {tournee.total_travel_distance && (
                  <p>
                    Distance totale : {tournee.total_travel_distance} km
                  </p>
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

      {/* Pop-up Historique (affiche toutes les tournées) */}
      {showHistory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>
              Historique complet des tournées
            </h2>

            {currentItems.map((tournee) => (
              <div
                key={tournee._id}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <h3>
                  Tournée du {new Date(tournee.date).toLocaleDateString()}
                </h3>
                <p>Nombre d'arrêts : {tournee.stops.length}</p>
                <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                {tournee.total_travel_time && (
                  <p>
                    Temps de trajet total : {tournee.total_travel_time} minutes
                  </p>
                )}
                {tournee.total_travel_distance && (
                  <p>
                    Distance totale : {tournee.total_travel_distance} km
                  </p>
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

            {/* Pagination controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: currentPage === 1 ? '#d1d5db' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                }}
              >
                Précédent
              </button>

              <span>
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor:
                    currentPage === totalPages ? '#d1d5db' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                }}
              >
                Suivant
              </button>
            </div>

            <button
              onClick={() => setShowHistory(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
