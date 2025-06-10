// src/pages/DashboardClient.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  ShoppingCart,
  History,
  Gift,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";
import "../pages-css/DashboardClient.css";  // chargement CSS

interface UserType {
  id: string;
  nom?: string;
  prenom?: string;
  nom_client?: string;
  role: string;
  affectations?: { entreprise: string }[];
}

// Adapter à la forme retournée par l'API ads
interface Advertisement {
  _id: string;
  company: string;
  type: "image" | "video" | string;
  duration?: number;
  filePath: string;
  title?: string;
  description?: string;
  discount?: string;
  color?: string;      // ex: "linear-gradient(to right, #ec4899, #f97316)"
  iconType?: string;   // ex: "Percent", "Star", etc.
}

export default function DashboardClient() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user: UserType | null = raw ? JSON.parse(raw) : null;
  if (!user) return null;

  const displayName = user.prenom && user.nom
    ? `${user.prenom} ${user.nom}`
    : user.nom || user.nom_client || "";

  const companyIds =
    user.affectations?.map((a) => a.entreprise).filter((id) => !!id) || [];

  const [hasAds, setHasAds] = useState<boolean | null>(null);

  useEffect(() => {
    if (companyIds.length === 0) {
      setHasAds(false);
      return;
    }
    Promise.all(
      companyIds.map((id) =>
        apiFetch(`/ads/company/${id}`)
          .then((r) => r.json())
          .catch(() => [] as Advertisement[])
      )
    )
      .then((lists) => {
        const all = lists.flat();
        console.log("Ads reçues:", all);
        setHasAds(all.length > 0);
      })
      .catch(() => setHasAds(false));
  }, [companyIds]);

  const consulterProduits = () => navigate("/productclient");
  const consulterHistorique = () => navigate("/historiqueorders");

  return (
    <div>
      <Header />

      <main className="brutalist-main-content">
        {/* Welcome */}
        <div className="brutalist-welcome-card">
          <p className="brutalist-welcome-greeting">Bienvenue</p>
          <h2 className="brutalist-welcome-name">{displayName}</h2>
          <p className="brutalist-welcome-description">
            Votre tableau de bord fidélité et commandes arrive ici.
          </p>
        </div>

        {/* Status */}
        {companyIds.length === 0 && (
          <Card className="brutalist-status-card brutalist-status-info">
            <CardContent className="brutalist-status-content">
              <AlertCircle className="brutalist-status-icon" />
              <span className="brutalist-status-text">
                Vous n’êtes affecté à aucune entreprise.
              </span>
            </CardContent>
          </Card>
        )}
        {companyIds.length > 0 && hasAds === null && (
          <Card className="brutalist-status-card brutalist-status-loading">
            <CardContent className="brutalist-status-content">
              <Loader2 className="brutalist-status-icon animate-spin" />
              <span className="brutalist-status-text">
                Vérification des offres…
              </span>
            </CardContent>
          </Card>
        )}
        {companyIds.length > 0 && hasAds === false && (
          <Card className="brutalist-status-card brutalist-status-warning">
            <CardContent className="brutalist-status-content">
              <AlertCircle className="brutalist-status-icon" />
              <span className="brutalist-status-text">
                Aucune publicité disponible pour vos entreprises.
              </span>
            </CardContent>
          </Card>
        )}
        {hasAds && <AdvertisementFrame companyIds={companyIds} />}

        {/* Actions */}
        <div className="brutalist-action-grid">
          <div className="brutalist-action-card">
            <CardHeader className="brutalist-action-header brutalist-action-header-products">
              <CardTitle className="brutalist-action-title">
                <ShoppingCart className="w-6 h-6" /> Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="brutalist-action-content">
              <p className="brutalist-action-description">
                Découvrez notre catalogue complet
              </p>
              <Button
                className="brutalist-action-button brutalist-action-button-products"
                onClick={consulterProduits}
              >
                Consulter les produits
              </Button>
            </CardContent>
          </div>

          <div className="brutalist-action-card">
            <CardHeader className="brutalist-action-header brutalist-action-header-history">
              <CardTitle className="brutalist-action-title">
                <History className="w-6 h-6" /> Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="brutalist-action-content">
              <p className="brutalist-action-description">
                Consultez vos commandes passées
              </p>
              <Button
                className="brutalist-action-button brutalist-action-button-history"
                onClick={consulterHistorique}
              >
                Voir l’historique
              </Button>
            </CardContent>
          </div>
        </div>
      </main>
    </div>
  );
}


function AdvertisementFrame({ companyIds }: { companyIds: string[] }) {
  const [ads, setAds] = useState<Advertisement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function fetchAds() {
      setLoading(true);
      setError(null);
      try {
        const lists = await Promise.all(
          companyIds.map((id) =>
            apiFetch(`/ads/company/${id}`)
              .then((res) => res.json() as Promise<Advertisement[]>)
              .catch(() => [])
          )
        );
        const all = lists.flat();
        if (!cancelled) {
          console.log("Ads finales:", all);
          setAds(all);
          setIdx(0);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError("Erreur lors de la récupération des publicités");
          setAds([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAds();
    return () => { cancelled = true; };
  }, [companyIds]);

  const decoItems = React.useMemo(() => {
    const items: { top: string; left: string; size: string; rotate: string }[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      items.push({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 20 + 10}px`,
        rotate: `${Math.random() * 360}deg`,
      });
    }
    return items;
  }, [idx, ads?.length]);

  if (loading) {
    return (
      <Card className="brutalist-status-card brutalist-status-loading">
        <CardContent className="brutalist-status-content">
          <Loader2 className="brutalist-status-icon animate-spin" />
          <span className="brutalist-status-text">Chargement des publicités…</span>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="brutalist-status-card brutalist-status-warning">
        <CardContent className="brutalist-status-content">
          <AlertCircle className="brutalist-status-icon" />
          <span className="brutalist-status-text">{error}</span>
        </CardContent>
      </Card>
    );
  }
  if (!ads || ads.length === 0) {
    return null;
  }

  const ad = ads[idx];
  const prev = () => setIdx((i) => (i - 1 + ads.length) % ads.length);
  const next = () => setIdx((i) => (i + 1) % ads.length);

  const base = import.meta.env.VITE_API_URL || "";
  const mediaUrl = ad.filePath.startsWith("http")
    ? ad.filePath
    : `${base}/${ad.filePath}`;

  const backgroundStyle = ad.color
    ? { background: ad.color }
    : { background: "linear-gradient(to right, #ec4899, #f97316)" };

  let IconComponent = Sparkles;
  if (ad.iconType === "Star") IconComponent = Star;

  return (
    <div className="ad-container">
      <div className="ad-header">
        <div className="ad-header-title">
          <Gift className="ad-header-icon" />
          OFFRES EXCLUSIVES
        </div>
        <div className="ad-header-right">
          <span className="ad-pagination">
            {idx + 1}/{ads.length}
          </span>
          <div className="ad-dots">
            {ads.map((_, i) => (
              <span
                key={i}
                className={i === idx ? "ad-dot ad-dot-active" : "ad-dot ad-dot-inactive"}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="ad-slide" style={backgroundStyle}>
        <div className="ad-background">
          {decoItems.map((item, i) => (
            <div
              key={i}
              className="ad-background-star"
              style={{
                top: item.top,
                left: item.left,
                fontSize: item.size,
                transform: `rotate(${item.rotate})`,
              }}
            >
              ★
            </div>
          ))}
        </div>

        <button className="ad-nav-button ad-nav-left" onClick={prev}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="ad-content">
          <div className="ad-text">
            {ad.title && <h2 className="ad-title">{ad.title}</h2>}
            {ad.description && <p className="ad-desc">{ad.description}</p>}

            <div className="ad-media-wrapper">
              {ad.type === "video" ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="ad-media"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={ad.title || "Publicité"}
                  className="ad-media"
                />
              )}
            </div>


          </div>

          {ad.discount && (
            <div className="ad-promo">
              <div className="ad-promo-inner">
                <span className="ad-promo-discount">{ad.discount}</span>
              </div>
              <div className="ad-star-badge">
                <Star className="w-4 h-4 text-black" />
              </div>
            </div>
          )}
        </div>

        <button className="ad-nav-button ad-nav-right" onClick={next}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="ad-footer">
        <span>{companyIds.length} entreprise(s) avec des offres actives</span>

      </div>
    </div>
  );
}
