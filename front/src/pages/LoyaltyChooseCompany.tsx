"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { API_BASE_URL } from "../constants";
import "../pages-css/LoyaltyChooseCompany.css";

interface Company {
  _id: string;
  nom_company: string;
  pfp?: string;
}

export default function LoyaltyChooseCompany() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const token = localStorage.getItem("token") || "";
  const nav   = useNavigate();

  /* ─── Récupération des sociétés affiliées ─── */
  useEffect(() => {
      fetch(`${API_BASE_URL}/loyalty/available`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setCompanies)
      .catch(console.error);
    }, [token]);

  /* ─── RENDER ─── */
  return (
    <div className="page-container">
      <Header />

      <main className="content-container">
        <h1 className="page-title">MES PROGRAMMES FIDÉLITÉ</h1>

        {companies.length === 0 ? (
          <p>Vous n’êtes affilié à aucun programme actif.</p>
        ) : (
          <div className="companies-grid">
            {companies.map((c) => (
              <div
                key={c._id}
                className="company-card"
                onClick={() => nav(`/loyalty-client/${c._id}`)}
              >
                {/* Logo ou placeholder */}
                <div className="company-logo">
                  {c.pfp ? (
                    <img src={`${API_BASE_URL}/${c.pfp}`} alt={c.nom_company} />
                  ) : (
                    <span className="company-placeholder">🏢</span>
                  )}
                </div>

                {/* Nom */}
                <p className="company-name">
                  {c.nom_company || "Sans nom"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
