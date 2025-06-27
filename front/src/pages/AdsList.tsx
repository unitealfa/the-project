/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImageIcon, Video, Store, BadgeX } from "lucide-react";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import "../pages-css/AdsList.css";          // ← nouveau fichier de style

interface Ad {
  _id:       string;
  company:   { _id: string; nom_company: string } | string | null;
  filePath:  string;
  type:      "image" | "video";
  duration?: number;
  createdAt: string;
  expiresAt: string;
}

const baseUrl = import.meta.env.VITE_API_URL || "";

export default function AdsList() {
  const [ads, setAds] = useState<Ad[]>([]);
  const navigate      = useNavigate();

  /* ─── chargement ─── */
  useEffect(() => {
    apiFetch("/ads")
      .then(r => r.json())
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  /* ─── suppression ─── */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publicité ?")) {
      return;
    }
    try {
      const res = await apiFetch(`/ads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Une erreur est survenue." }));
        throw new Error(errorData.message);
      }
      setAds(curr => curr.filter(a => a._id !== id));
    } catch (error: any) {
      alert(`Erreur lors de la suppression : ${error.message}`);
    }
  };

  /* ─── helper statut / couleur ─── */
  const getStatus = (expires: string) => {
    return new Date(expires) > new Date() ? "En cours" : "Expirée";
  };

  return (
    <div className="page-container">
      <Header />

      <main className="content-container">
        <div className="page-title-wrap">
          <h1 className="page-title">PUBLICITÉS</h1>
          <Link to="/ads/add" className="btn btn-primary">
            ➕ Nouvelle pub
          </Link>
        </div>

        {ads.length === 0 && (
          <p className="no-ads-msg">Aucune publicité enregistrée.</p>
        )}

        {/* grille responsive */}
        <div className="ads-grid">
          {ads.map((ad, idx) => {
            /* nom de la société */
            const companyName =
              typeof ad.company === "object"
                ? ad.company?.nom_company ?? "Inconnue"
                : ad.company ?? "Inconnue";

            const status  = getStatus(ad.expiresAt);
            const expired = status === "Expirée";

            return (
              <div key={ad._id} className="ad-card">
                {/* bandeau haut */}
                <header className="ad-card-header">
                  <div className="ad-type">
                    {ad.type === "image" ? (
                      <ImageIcon className="ad-type-icon" />
                    ) : (
                      <Video className="ad-type-icon" />
                    )}
                    <span className="ad-type-text">
                      {ad.type === "image" ? "IMAGE" : "VIDÉO"}
                    </span>
                  </div>

                  <span className="ad-number">#{String(idx + 1).padStart(2, "0")}</span>
                </header>

                {/* aperçu média */}
                <div className="media-container">
                  {ad.type === "image" ? (
                    <img
                      src={`${baseUrl}/${ad.filePath}`}
                      className="media-img"
                      onError={e => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <video
                      src={`${baseUrl}/${ad.filePath}`}
                      className="media-video"
                      controls
                    />
                  )}
                </div>

                {/* infos entreprise & statut */}
                <div className="ad-meta">
                  <span className="meta-item">
                    <Store className="meta-icon" /> {companyName}
                  </span>
                  <span className={"meta-item " + (expired ? "expired" : "running")}>
                    <BadgeX className="meta-icon" /> {status}
                  </span>
                </div>

                {/* actions */}
                <div className="ad-actions">
                  <button className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/ads/${ad._id}`)}>
                    Voir
                  </button>
                  <button className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/ads/edit/${ad._id}`)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(ad._id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
