import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function DashboardLivreur() {
  const raw = localStorage.getItem("user");
  const u = raw
    ? (JSON.parse(raw) as { nom: string; prenom: string; role: string })
    : null;
  if (!u) return null;
  if (u.role !== "Livreur") return <div>Accès non autorisé</div>;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1>
          Bienvenue {u.prenom} {u.nom}
        </h1>
        <p>
          Rôle : <strong>Livreur</strong>
        </p>

        <section style={{ marginTop: "2rem" }}>
          <h2>🚚 Tournées prévues aujourd'hui</h2>

          <Link
            to="/livreur/commandes"
            style={{
              display: "inline-block",
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Voir mes commandes
          </Link>
        </section>
      </main>
    </>
  );
}
