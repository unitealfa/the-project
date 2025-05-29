import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

interface User {
  nom: string;
  prenom: string;
  depot?: string;
}

interface Depot {
  _id: string;
  nom_depot: string;
}

export default function DashboardResponsableDepot() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;
  const token = localStorage.getItem("token") || "";
  const apiBase = import.meta.env.VITE_API_URL;

  const [depot, setDepot] = useState<Depot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.depot) return;

    fetch(`${apiBase}/api/depots/${user.depot}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setDepot)
      .catch((err) => setError(err.message));
  }, [user?.depot, apiBase, token]);

  if (!user) return null;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>
          Bonjour {user.prenom} {user.nom}
        </h1>
        <p>
          Rôle : <strong>Responsable dépôt</strong>
        </p>

        {error && (
          <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>
        )}

        {depot && (
          <section style={{ marginTop: "2rem" }}>
            <h2>
              🏬 Dépôt assigné : <strong>{depot.nom_depot}</strong>
            </h2>

            <Link
              to={`/teams/${depot._id}`}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              👥 Gérer l'équipe du dépôt
            </Link>

            <Link
              to={`/clients?depot=${depot._id}`}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                marginLeft: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#10b981",
                color: "#fff",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              👥 Consulter les clients de ce dépôt
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
