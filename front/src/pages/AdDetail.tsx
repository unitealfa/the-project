"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImageIcon, Video, Loader2 } from "lucide-react";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import "../pages-css/AdDetail.css"; // ← nouveau fichier de style

interface Ad {
  _id: string;
  company: { _id: string; nom_company: string } | string | null;
  filePath: string;
  type: "image" | "video";
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("Inconnue");

  /* ─────────── Fetch de la pub ─────────── */
  useEffect(() => {
    if (!id) return;
    apiFetch(`/ads/${id}`)
      .then((r) => r.json())
      .then(setAd)
      .catch(() => setAd(null))
      .finally(() => setLoading(false));
  }, [id]);
    useEffect(() => {
    if (!ad) return;
    if (ad.company) {
      if (typeof ad.company === "object") {
        setCompanyName(ad.company.nom_company);
      } else {
        apiFetch(`/companies/${ad.company}`)
          .then((r) => r.json())
          .then((c) => setCompanyName(c.nom_company))
          .catch(() => setCompanyName("Inconnue"));
      }
    } else {
      setCompanyName("Inconnue");
    }
  }, [ad]);

  /* ─────────── Loader ─────────── */
  if (loading)
    return (
      <>
        <Header />
        <div className="detail-loading">
          <Loader2 className="spinner" />
          <span>Chargement…</span>
        </div>
      </>
    );

  if (!ad)
    return (
      <>
        <Header />
        <p className="detail-error">Publicité introuvable.</p>
      </>
    );


  /* ─────────── Page ─────────── */
  return (
    <div className="detail-page">
      <Header />

      <main className="detail-container">
        {/* Carte */}
        <section className="detail-card">
          {/* Header de carte */}
          <header className="detail-card-header">
            <div className="detail-type">
              {ad.type === "image" ? (
                <ImageIcon className="detail-type-icon" />
              ) : (
                <Video className="detail-type-icon" />
              )}
              <span className="detail-type-text">
                {ad.type === "image" ? "IMAGE" : "VIDÉO"}
              </span>
            </div>
          </header>

          {/* Aperçu média */}
          <div className="detail-media">
            {ad.type === "image" ? (
              <img
                src={`${baseUrl}/${ad.filePath}`}
                alt="Publicité"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "/placeholder.svg")
                }
              />
            ) : (
              <video
                src={`${baseUrl}/${ad.filePath}`}
                controls
                poster="/placeholder.svg"
              />
            )}
          </div>

          {/* Métadonnées */}
          <ul className="detail-meta">
            <li>
              <span className="label">Entreprise&nbsp;:</span>
              <span>{companyName}</span>
            </li>
            <li>
              <span className="label">Durée&nbsp;:</span>
              <span>{ad.duration ?? "n/a"} s</span>
            </li>
            <li>
              <span className="label">Créée le&nbsp;:</span>
              <span>{new Date(ad.createdAt).toLocaleString()}</span>
            </li>
            <li>
              <span className="label">Dernière modif&nbsp;:</span>
              <span>{new Date(ad.updatedAt).toLocaleString()}</span>
            </li>
          </ul>

          {/* Actions */}
          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/ads/edit/${ad._id}`)}
            >
              Modifier
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ⬅ Retour
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
