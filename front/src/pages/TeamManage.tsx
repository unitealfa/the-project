// front/src/pages/TeamManage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import Header                         from "../components/Header";
import { apiFetch }                   from "../utils/api";
import {
  Truck, ShoppingCart, Warehouse,
} from "lucide-react";
import "../pages-css/TeamManage.css";            // ← nouveau fichier de style

/* ---------- Types ---------- */
interface Depot { _id:string; nom_depot:string }

/* ---------- Composant ---------- */
export default function TeamManage () {
  /* params + navigation */
  const { depotId = "" } = useParams<{ depotId:string }>();
  const navigate          = useNavigate();

  /* state */
  const [depot,  setDepot]  = useState<Depot | null>(null);
  const [error,  setError]  = useState("");
  const [hover,  setHover]  = useState<number|null>(null);
  const [loading,setLoading]= useState(true);

  /* charge le nom du dépôt */
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/depots/${depotId}`);
        if (cancel) return;
        setDepot(await res.json());
      } catch { !cancel && setError("Impossible de charger le dépôt"); }
      finally  { !cancel && setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [depotId]);

  /* ────────── Carte cliquable ────────── */
  interface CardProps {
    idx:    number;
    title:  string;
    suffix: string;
    Icon:   React.FC<React.SVGProps<SVGSVGElement>>;
    color:  string;
  }

  const Card = ({ idx, title, suffix, Icon, color }:CardProps) => {
    const isHover = hover === idx;
    return (
      <div
        className={`team-card ${isHover ? "hover" : ""}`}
        style={{ backgroundColor: color }}
        onMouseEnter={() => setHover(idx)}
        onMouseLeave={() => setHover(null)}
        onClick      ={() => navigate(`/teams/${depotId}/${suffix}`)}
      >
        <Icon className="team-card-icon" />
        <span className="team-card-title">{title}</span>
      </div>
    );
  };
  /* ───────────────────────────────────── */

  return (
    <>
      <Header />

      <div className="team-manage">

        {/* décor ballon flou pastel */}
        <div className="bg-blob tm-blob-1"></div>
        <div className="bg-blob tm-blob-2"></div>

        {/* titre */}
        <div className="tm-title-wrap">
          {/* ⬇️  nouveau conteneur  */}
          <div className="tm-title-card">
            <h1 className="tm-title">
              Gestion de l’équipe
              {depot && !loading && (
                <> du dépôt&nbsp;«&nbsp;{depot.nom_depot}&nbsp;»</>
              )}
            </h1>
          </div>
        </div>
        {error && <p className="tm-error">{error}</p>}

        {/* grille de cartes */}
        <div className="team-grid">
          <Card
            idx={0}
            title="Équipe Livraison"
            suffix="livraison"
            Icon={Truck}
            color="#fffff"
          />
          <Card
            idx={1}
            title="Équipe Pré-vente"
            suffix="prevente"
            Icon={ShoppingCart}
            color="#fffff"
          />
          <Card
            idx={2}
            title="Équipe Entrepôt"
            suffix="entrepot"
            Icon={Warehouse}
            color="#fffff"
          />
        </div>
      </div>
    </>
  );
}
