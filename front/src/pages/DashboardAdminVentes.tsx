import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: {
    _id: string;
    nom: string;
    prenom: string;
  };
  livreur_id: {
    _id: string;
    nom: string;
    prenom: string;
  };
}

const DashboardAdminVentes: React.FC = () => {
  const rawUser = localStorage.getItem("user");
  const user: {
    nom: string;
    prenom: string;
    company?: string;
    role?: string;
    depot?: string;
  } | null = rawUser ? JSON.parse(rawUser) : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadVehicles = async () => {
    if (!user?.depot) {
      setError("Aucun dépôt associé à votre compte");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch(`/vehicles?depot=${user.depot}`);
      const data = await response.json();

      // Filter vehicles that have both chauffeur and livreur assigned
      const vehiclesWithPersonnel = data.filter(
        (v: Vehicle) => v.chauffeur_id && v.livreur_id
      );
      setVehicles(vehiclesWithPersonnel);

      if (vehiclesWithPersonnel.length === 0) {
        setError(
          "Aucun véhicule avec chauffeur et livreur trouvé dans ce dépôt"
        );
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: isModalOpen ? "flex" : "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      position: "relative" as const,
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "8px",
      width: "80%",
      maxWidth: "800px",
      maxHeight: "80vh",
      overflow: "auto",
    },
    closeButton: {
      position: "absolute" as const,
      top: "1rem",
      right: "1rem",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
    },
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadVehicles();
  };

  if (!user) {
    return <p>Utilisateur non trouvé. Veuillez vous reconnecter.</p>;
  }

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>Tableau de Bord - Administrateur des Ventes</h1>
        <p>
          Bonjour {user.prenom} {user.nom}
        </p>
        {user.company && (
          <p>
            Société: <strong>{user.company}</strong>
          </p>
        )}
        {user.depot && (
          <p>
            Dépôt: <strong>{user.depot}</strong>
          </p>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <Link to="/admin-ventes/vehicules">
            <button
              type="button"
              style={{
                padding: "10px 15px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Gérer les véhicules
            </button>
          </Link>

          <Link to={`/clients?depot=${user.depot}`}>
            <button
              type="button"
              style={{
                padding: "10px 15px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Voir les clients du dépôt
            </button>
          </Link>

          <button
            onClick={handleOpenModal}
            style={{
              padding: "10px 15px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Voir les véhicules avec personnel
          </button>

          {/* Nouveau lien pour planifier une tournée */}
          <Link to={`/admin-ventes/planifier-tournee?depot=${user.depot}`}>
            <button
              type="button"
              style={{
                padding: "10px 15px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Planifier une tournée
            </button>
          </Link>
        </div>

        <section style={{ marginTop: "2rem" }}>
          <h2>📈 Suivi des comptes-clients</h2>
          <p style={{ opacity: 0.7 }}>Module en développement…</p>
        </section>

        {/* Modal pour la liste des véhicules avec personnel */}
        {isModalOpen && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={modalStyles.closeButton}
              >
                ✕
              </button>
              <h2 style={{ marginTop: 0 }}>
                Véhicules avec chauffeur et livreur
              </h2>

              {loading ? (
                <p>Chargement des véhicules...</p>
              ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "1rem",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Véhicule
                      </th>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Chauffeur
                      </th>
                      <th
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        Livreur
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr
                        key={v._id}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "12px 15px" }}>
                          {v.make} {v.model} ({v.license_plate})
                        </td>
                        <td style={{ padding: "12px 15px" }}>
                          {v.chauffeur_id.prenom} {v.chauffeur_id.nom}
                        </td>
                        <td style={{ padding: "12px 15px" }}>
                          {v.livreur_id.prenom} {v.livreur_id.nom}
                        </td>
                      </tr>
                    ))}
                    {vehicles.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "center", padding: "1rem" }}
                        >
                          Aucun véhicule avec chauffeur et livreur trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default DashboardAdminVentes;
