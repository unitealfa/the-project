import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import "../pages-css/EditAd.css"; // Import CSS
interface Ad {
  _id: string;
  company: { _id: string; nom_company: string } | string | null;
  type: "image" | "video";
  duration?: number;
  filePath: string;
  expiresAt: string;
}

export default function EditAd() {
  const { id } = useParams<{ id: string }>();
  const [type, setType] = useState<"image" | "video">("image");
  const [duration, setDuration] = useState<number | undefined>(5);
  const [initialDuration, setInitialDuration] = useState<number | undefined>();
  const [expiresAt, setExpiresAt] = useState("");
  const [initialExpiresAt, setInitialExpiresAt] = useState("");
  const [filePath, setFilePath] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);


  useEffect(() => {
    if (!id) return;
    apiFetch(`/ads/${id}`)
      .then((r) => r.json())
      .then((ad: Ad) => {
        setType(ad.type);
        const dur = ad.duration ?? (ad.type === "image" ? 5 : undefined);
        const exp = ad.expiresAt.split("T")[0];
        setDuration(dur);
        setExpiresAt(exp);
        setInitialDuration(dur);
        setInitialExpiresAt(exp);
        setFilePath(ad.filePath);
        setCurrentUrl(`${baseUrl}/${ad.filePath}`); // Add current URL
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // No media modification: only track existing filePath for preview

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const fd = new FormData();
    if (type === "image") {
      fd.append("duration", duration?.toString() ?? "");
    }
    fd.append("expiresAt", expiresAt);

    const res = await fetch(`${baseUrl}/ads/${id}`, {
      method: "PATCH",
      body: fd,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) navigate(`/ads/${id}`);
    else alert("Erreur lors de la mise à jour");
  };
  if (loading) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center" }}>Chargement…</p>
      </>
    );
  }
  return (
    <>
      <Header />
      <form onSubmit={submit} className="edit-wrapper">
        <h1>Modifier la publicité</h1>

        {/* ---- APERÇUS -------------------------------------------------- */}
        {currentUrl && (
          <div className="preview-grid">
            {/* média ACTUEL toujours affiché */}
            <figure>
              <figcaption>Actuel</figcaption>
              {type === "image" ? (
                <img src={currentUrl} alt="Actuel" />
              ) : (
                <video src={currentUrl} controls />
              )}
            </figure>

          </div>
        )}

        <br />
        {type === "image" ? (
          <label>
            Durée d’affichage (s) :
            <select
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              style={{ marginLeft: 8 }}
            >
              {[5, 15, 30].map((sec) => (
                <option key={sec} value={sec}>
                  {sec} s
                </option>
              ))}
            </select>
            <span className="hint" style={{ marginLeft: "0.5rem" }}>
              (actuelle : {initialDuration ?? "n/a"} s)
            </span>
          </label>
        ) : duration === undefined ? (
          <p style={{ margin: "0.5rem 0", color: "#888" }}>
            Chargement durée de la vidéo…
          </p>
        ) : (
          <p style={{ margin: "0.5rem 0" }}>
            Durée (auto) : <strong>{duration} s</strong>
          </p>
        )}
        <br />
        <label className="date-field">
          Date de fin :
          <input
            type="date"
            value={expiresAt}
            min={minDate}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
          />
          <span className="hint">
            (actuelle : {new Date(initialExpiresAt).toLocaleDateString()})
          </span>
        </label>
        <br />
        <div className="btn-row">
          <button className="btn btn-primary" type="submit">
            Enregistrer
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}