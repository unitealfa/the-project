// src/pages/TourneesList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../pages-css/TourneesList.css";

interface Tournee {
  _id: string;
  depot: string;
  date: string;
  stops: string[];
  vehicles: string[];
  total_travel_time?: number;
  total_travel_distance?: number;
}

interface Retour {
  _id: string;
  nom_client: string;
  nonLivraisonCause?: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function TourneesList() {
  const navigate = useNavigate();
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [retours, setRetours] = useState<Retour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "tournees" | "retours"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 15;

  const [seenTournees, setSeenTournees] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("seenTournees");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [seenRetours, setSeenRetours] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("seenRetours");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    if (!user?.depot) {
      setError("Aucun dépôt associé à votre compte");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${apiBase}/tournees/depot/${user.depot}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiBase}/api/orders?confirmed=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([tRes, oRes]) => {
        if (!tRes.ok) throw new Error(`Erreur ${tRes.status}`);
        const tours = await tRes.json();
        if (!oRes.ok) throw new Error(`Erreur ${oRes.status}`);
        const orders = await oRes.json();

        setTournees(tours);
        const filtered = orders.filter(
          (o: any) => o.etat_livraison === "non_livree"
        );
        setRetours(filtered);
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
      localStorage.setItem("seenTournees", JSON.stringify(updated));
    } catch {
      // silent
    }
  };

  const markRetourAsSeen = (id: string) => {
    if (seenRetours.includes(id)) return;
    const updated = [...seenRetours, id];
    setSeenRetours(updated);
    try {
      localStorage.setItem("seenRetours", JSON.stringify(updated));
    } catch {
      // silent
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [historyFilter, searchTerm]);

  const retoursByDate: Record<string, Retour[]> = retours.reduce((acc, o) => {
    const d = new Date(o.updatedAt || o.createdAt || "")
      .toISOString()
      .slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(o);
    return acc;
  }, {} as Record<string, Retour[]>);

  const filteredRetoursByDate: Record<string, Retour[]> = Object.entries(
    retoursByDate
  ).reduce((acc, [date, list]) => {
    if (historyFilter === "tournees") return acc;
    const matchDate = date.includes(searchTerm.toLowerCase());
    const filteredList = list.filter(
      (o) =>
        !searchTerm ||
        matchDate ||
        o.nom_client.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredList.length) acc[date] = filteredList;
    return acc;
  }, {} as Record<string, Retour[]>);

  const filteredTournees =
    historyFilter === "retours"
      ? []
      : tournees.filter((t) => {
          const d = new Date(t.date).toISOString().slice(0, 10);
          return !searchTerm || d.includes(searchTerm.toLowerCase());
        });

  const recentTournees = [...tournees]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalPages = Math.ceil(filteredTournees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTournees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

        {user?.role === "Contrôleur" && tournees.length > 0 && (
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

        {recentTournees.length === 0 &&
        Object.keys(retoursByDate).length === 0 ? (
          <p className="tl-no-data">Aucune tournée trouvée</p>
        ) : (
          <div className="tl-card-list">
            {Object.entries(retoursByDate).map(([date, list]) => (
              <div className="tl-card" key={`r-${date}`}>
                <div className="tl-card-header">
                  <h3 className="tl-card-title">
                    Retours - Tournée du {new Date(date).toLocaleDateString()}
                  </h3>
                </div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {list.map((o) => {
                    const isNew = !seenRetours.includes(o._id);
                    return (
                      <li key={o._id} style={{ marginBottom: "0.5rem" }}>
                        {o.nom_client} - {o.nonLivraisonCause || ""}
                        {isNew && (
                          <span
                            className="tl-badge-new"
                            style={{ marginLeft: "0.5rem" }}
                          >
                            Nouveau
                          </span>
                        )}
                        <button
                          className="tl-btn tl-btn-purple"
                          style={{ marginLeft: "0.5rem" }}
                          onClick={() => {
                            markRetourAsSeen(o._id);
                            navigate(`/orders/${o._id}`);
                          }}
                        >
                          Voir les détails
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
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
                    <p>
                      Temps de trajet total : {tournee.total_travel_time}{" "}
                      minutes
                    </p>
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
          <div
            className="tl-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="tl-popup-title">Historique complet des tournées</h2>
            <div className="tl-history-controls">
              <select
                value={historyFilter}
                onChange={(e) =>
                  setHistoryFilter(
                    e.target.value as "all" | "tournees" | "retours"
                  )
                }
              >
                <option value="all">Tout</option>
                <option value="tournees">Tournées</option>
                <option value="retours">Retours</option>
              </select>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {currentItems.length === 0 &&
            Object.keys(filteredRetoursByDate).length === 0 ? (
              <p className="tl-no-data">Aucune tournée dans l'historique</p>
            ) : (
              <div className="tl-card-list">
                {Object.entries(filteredRetoursByDate).map(([date, list]) => (
                  <div className="tl-card" key={`hist-r-${date}`}>
                    <div className="tl-card-header">
                      <h3 className="tl-card-title">
                        Retours - Tournée du{" "}
                        {new Date(date).toLocaleDateString()}
                      </h3>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {list.map((o) => {
                        const isNew = !seenRetours.includes(o._id);
                        return (
                          <li key={o._id} style={{ marginBottom: "0.5rem" }}>
                            {o.nom_client} - {o.nonLivraisonCause || ""}
                            {isNew && (
                              <span
                                className="tl-badge-new"
                                style={{ marginLeft: "0.5rem" }}
                              >
                                Nouveau
                              </span>
                            )}
                            <button
                              className="tl-btn tl-btn-purple"
                              style={{ marginLeft: "0.5rem" }}
                              onClick={() => {
                                markRetourAsSeen(o._id);
                                navigate(`/orders/${o._id}`);
                              }}
                            >
                              Voir les détails
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {currentItems.map((tournee) => {
                  const isNew = !seenTournees.includes(tournee._id);
                  return (
                    <div className="tl-card" key={tournee._id}>
                      <div className="tl-card-header">
                        <h3 className="tl-card-title">
                          Tournée du{" "}
                          {new Date(tournee.date).toLocaleDateString()}
                        </h3>
                        {isNew && <span className="tl-badge-new">Nouveau</span>}
                      </div>
                      <p>Nombre d'arrêts : {tournee.stops.length}</p>
                      <p>Nombre de véhicules : {tournee.vehicles.length}</p>
                      {tournee.total_travel_time && (
                        <p>
                          Temps de trajet total : {tournee.total_travel_time}{" "}
                          minutes
                        </p>
                      )}
                      {tournee.total_travel_distance && (
                        <p>
                          Distance totale : {tournee.total_travel_distance} km
                        </p>
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
