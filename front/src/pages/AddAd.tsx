import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import { API_URL } from "../constants";
import "../pages-css/AddAd.css";                        /* <-- importe le fichier ci-dessus */

interface Company { _id: string; nom_company: string; }

export default function AddAd() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"image" | "video">("image");
  const [duration, setDuration] = useState<number | undefined>(5);
  const [expiresAt, setExpiresAt] = useState("");
  const navigate = useNavigate();

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  /* --- Chargement entreprises --- */
  useEffect(() => {
    apiFetch("/companies")
      .then(res => res.json())
      .then(setCompanies)
      .catch(console.error);
  }, []);

  /* --- Ajuste durée selon type --- */
  useEffect(() => {
    setDuration(type === "image" ? 5 : undefined);
  }, [type]);

  /* --- Durée auto pour vidéo --- */
  useEffect(() => {
    if (type === "video" && file) {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setDuration(Math.ceil(video.duration));
        URL.revokeObjectURL(url);
      };
    }
  }, [type, file]);

  /* --- Soumission --- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("company", company);
    fd.append("type", type);
    fd.append("duration", duration?.toString() || "");
    fd.append("expiresAt", expiresAt);

    const res = await fetch(`${API_URL}/ads`, {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) navigate("/ads");
    else alert(`Erreur (${res.status}) : ${await res.text()}`);
  };

  /* --- Rendu --- */
  return (
    <>
      <Header />
      <div className="ad-page">
        <form className="ad-form" onSubmit={submit}>
          <h1>Ajouter une publicité</h1>

          {/* Entreprise */}
          <div className="ad-group">
            <label className="ad-label" htmlFor="company">Entreprise</label>
            <select
              id="company"
              className="ad-select"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
            >
              <option value="">-- Choisir --</option>
              {companies.length
                ? companies.map(c => (
                    <option key={c._id} value={c._id}>{c.nom_company}</option>
                  ))
                : <option disabled>— Aucune entreprise —</option>}
            </select>
          </div>

          {/* Type */}
          <div className="ad-group">
            <label className="ad-label" htmlFor="type">Type</label>
            <select
              id="type"
              className="ad-select"
              value={type}
              onChange={e => setType(e.target.value as "image" | "video")}
            >
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
            </select>
          </div>

          {/* Fichier */}
          <div className="ad-group">
            <label className="ad-label" htmlFor="file">Fichier</label>
            <input
              id="file"
              type="file"
              accept="image/*,video/*"
              className="ad-file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          {/* Durée */}
          {type === "image" ? (
            <div className="ad-group">
              <label className="ad-label">Durée d’affichage (s)</label>
              <select
                className="ad-select"
                value={duration}
                onChange={e => setDuration(+e.target.value)}
              >
                {[15, 30].map(sec => (
                  <option key={sec} value={sec}>{sec} s</option>
                ))}
              </select>
            </div>
          ) : duration === undefined ? (
            <p className="ad-info">Chargement de la durée de la vidéo…</p>
          ) : (
            <p className="ad-info"><b>Durée (auto) :</b> {duration} s</p>
          )}

          {/* Date d’expiration */}
          <div className="ad-group">
            <label className="ad-label" htmlFor="date">Date de fin</label>
            <input
              id="date"
              type="date"
              className="ad-input"
              value={expiresAt}
              min={minDate}
              onChange={e => setExpiresAt(e.target.value)}
              required
            />
          </div>

          <button className="ad-btn" type="submit">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
