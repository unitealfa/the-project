"use client";

import { useEffect, useState } from "react";
import { Clock, ImageIcon, Video } from "lucide-react";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";        // ← ta fonction helper
import "../pages-css/AdminAds.css";             // ← le fichier de style ci-dessous

interface Ad {
  _id:        string;
  filePath:   string;
  type:       "image" | "video";
  expiresAt:  string;            // ISO string envoyée par le back
  duration?:  number;            // (optionnel)
}

/* Téléphone affiché quand on n’a aucune pub */
const SUPER_ADMIN_PHONE = "06 00 00 00 00";

/* Durée max qu’on veut représenter pour la jauge (30 j) */
const MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export default function AdminAds() {
  const [ads,     setAds]     = useState<Ad[]>([]);
  const [timers,  setTimers]  = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_URL || "";

  /* ───────────────────────── 1. CHARGEMENT ───────────────────────── */
  useEffect(() => {
    const raw  = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const companyId = user?.company;
    if (!companyId) { setLoading(false); return; }

    apiFetch(`/ads/company/${companyId}`)
      .then(r => r.json())
      .then((list: Ad[]) => {
        /* On garde seulement celles encore valides */
        const now   = Date.now();
        const valid = list.filter(ad => new Date(ad.expiresAt).getTime() > now);

        /* Timers initiaux */
        const t: Record<string, number> = {};
        valid.forEach(ad => {
          t[ad._id] = new Date(ad.expiresAt).getTime() - now;
        });

        setAds(valid);
        setTimers(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ─────────────── 2. DÉCRÉMENTE LES TIMERS TOUTES LES 1 s ─────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      setTimers(curr => {
        const next: Record<string, number> = {};
        Object.keys(curr).forEach(key => {
          next[key] = Math.max(0, curr[key] - 1000);
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ─────────────────────────── HELPERS ─────────────────────────── */
  const format = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return d > 0
      ? `${d}j ${h}h ${m}m ${s}s`
      : `${h}h ${m}m ${s}s`;
  };

  const percent = (ms: number) =>
    Math.min(100, (ms / MAX_DURATION_MS) * 100);

  const barColor = (ms: number) => {
    const d = ms / 86400000;   // ms → jour
    if (d < 1) return "progress-bar-red";
    if (d < 3) return "progress-bar-yellow";
    return "progress-bar-green";
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div className="page-container">
      <Header />
      <main className="content-container">
        <h1 className="page-title">MES PUBLICITÉS</h1>

        {/* CHARGEMENT */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span className="loading-text">Chargement…</span>
          </div>
        )}

        {/* AUCUNE PUB */}
        {!loading && ads.length === 0 && (
          <div className="empty-state">
            <h3 className="empty-state-title">Aucune publicité pour le moment</h3>
            <p className="empty-state-text">
              Pour afficher une pub à vos clients, consultez le super admin au{" "}
              <strong>{SUPER_ADMIN_PHONE}</strong>.
            </p>
          </div>
        )}

        {/* GRILLE DES PUBS */}
        {!loading && ads.length > 0 && (
          <div className="ads-grid">
            {ads.map((ad, idx) => {
              const timeLeft = timers[ad._id] ?? 0;
              return (
                <div key={ad._id} className="ad-card">
                  {/* HEADER */}
                  <div className="ad-card-header">
                    <div className="ad-type">
                      {ad.type === "image"
                        ? <ImageIcon  className="ad-type-icon" />
                        : <Video      className="ad-type-icon" />
                      }
                      <span className="ad-type-text">
                        {ad.type === "image" ? "IMAGE" : "VIDÉO"}
                      </span>
                    </div>
                    <span className="ad-number">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* MEDIA */}
                  <div className="media-container">
                    <div className="media-preview">
                      {ad.type === "image" ? (
                        <img
                          src={`${baseUrl}/${ad.filePath}`}
                          alt="Publicité"
                          className="media-preview-img"
                          onError={e => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="video-container">
                          <Video className="video-icon" />
                          <video
                            src={`${baseUrl}/${ad.filePath}`}
                            className="video-element"
                            controls
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TIMER */}
                  <div className="timer-container">
                    <div className="timer-header">
                      <div className="timer-label">
                        <Clock className="timer-icon" />
                        <span className="timer-text">EXPIRE DANS</span>
                      </div>
                      <div className="timer-value">{format(timeLeft)}</div>
                    </div>

                    {/* BARRE DE PROGRESSION */}
                    <div className="progress-container">
                      <div
                        className={`progress-bar ${barColor(timeLeft)}`}
                        style={{ width: `${percent(timeLeft)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
