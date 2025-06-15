// src/pages/TourneesList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../pages-css/TourneesList.css';

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

  const [seenTournees, setSeenTournees] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('seenTournees');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  const markAsSeen = (id: string) => {
    if (seenTournees.includes(id)) return;
    const updated = [...seenTournees, id];
    setSeenTournees(updated);
    try {
      localStorage.setItem('seenTournees', JSON.stringify(updated));
    } catch {
      // silent
    }
  };

  const recentTournees = [...tournees]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalPages = Math.ceil(tournees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = tournees.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <div className="tl-loading">Chargement...</div>;
  if (error) return <div className="tl-error">{error}</div>;

  return (
    <>
      <Header />
      <main className="tl-page">
        <h1 className="tl-title-card">Tournées du dépôt</h1>

        {tournees.length > 5 && (
          <button
            className="tl-btn tl-btn-green"
            onClick={() => {
              setShowHistory(true);
              setCurrentPage(1);
            }}
          >
            Historique des tournées
          </button>
        )}

        {recentTournees.length === 0 ? (
          <p className="tl-no-data">Aucune tournée trouvée</p>
        ) : (
          <div className="tl-card-list">
            {recentTournees.map((tournee) => {
              const isNew = !seenTournees.includes(tournee._id);
              return (
                <div className="tl-card" key={tournee._id}>
                  <div className="tl-card-header">
                    <h3 className="tl-card-title">
                      Tournée du {new Date(tournee.date).toLocaleDateString()}
                    </h3>
                    {isNew && <span className="tl-badge-new">Nouveau</span>}
                  </div>
                  <p>Nombre d'arrêts : {tournee.stops.length}</p>
                  <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                  {tournee.total_travel_time && (
                    <p>Temps de trajet total : {tournee.total_travel_time} minutes</p>
                  )}
                  {tournee.total_travel_distance && (
                    <p>Distance totale : {tournee.total_travel_distance} km</p>
                  )}
                  <button
                    className="tl-btn tl-btn-purple"
                    onClick={() => {
                      markAsSeen(tournee._id);
                      navigate(`/tournees/${tournee._id}`);
                    }}
                  >
                    Voir les détails
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showHistory && (
        <div className="tl-popup-overlay" onClick={() => setShowHistory(false)}>
          <div className="tl-popup-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="tl-popup-title">Historique complet des tournées</h2>

            {currentItems.length === 0 ? (
              <p className="tl-no-data">Aucune tournée dans l'historique</p>
            ) : (
              <div className="tl-card-list">
                {currentItems.map((tournee) => {
                  const isNew = !seenTournees.includes(tournee._id);
                  return (
                    <div className="tl-card" key={tournee._id}>
                      <div className="tl-card-header">
                        <h3 className="tl-card-title">
                          Tournée du {new Date(tournee.date).toLocaleDateString()}
                        </h3>
                        {isNew && <span className="tl-badge-new">Nouveau</span>}
                      </div>
                      <p>Nombre d'arrêts : {tournee.stops.length}</p>
                      <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                      {tournee.total_travel_time && (
                        <p>Temps de trajet total : {tournee.total_travel_time} minutes</p>
                      )}
                      {tournee.total_travel_distance && (
                        <p>Distance totale : {tournee.total_travel_distance} km</p>
                      )}
                      <button
                        className="tl-btn tl-btn-purple"
                        onClick={() => {
                          markAsSeen(tournee._id);
                          navigate(`/tournees/${tournee._id}`);
                        }}
                      >
                        Voir les détails
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="tl-pagination-controls">
              <button
                className="tl-btn tl-btn-small"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span className="tl-page-indicator">
                Page {currentPage} / {totalPages}
              </span>
              <button
                className="tl-btn tl-btn-small"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>

            <button
              className="tl-btn tl-btn-red tl-close-btn"
              onClick={() => setShowHistory(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
