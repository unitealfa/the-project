import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import "../pages-css/EditAd.css"; // Import CSS

interface Company {
  _id: string;
  nom_company: string;
}
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [duration, setDuration] = useState<number | undefined>(5); // Default duration for images
  const [initialDuration, setInitialDuration] = useState<number | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [initialExpiresAt, setInitialExpiresAt] = useState("");
  const [filePath, setFilePath] = useState("");
  const [preview, setPreview] = useState("");
  const [currentUrl, setCurrentUrl] = useState(""); // Media already saved
  const [previewNew, setPreviewNew] = useState(""); // Freshly chosen media
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    apiFetch("/companies")
      .then((r) => r.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/ads/${id}`)
      .then((r) => r.json())
      .then((ad: Ad) => {
        const compId = ad.company
          ? typeof ad.company === "object"
            ? ad.company._id
            : ad.company
          : "";
        setCompany(compId);
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

  useEffect(() => {
    if (type === "video" && file) {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setDuration(Math.ceil(video.duration)); // Automatically set duration for videos
        URL.revokeObjectURL(url);
      };
    }
  }, [type, file]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(filePath ? `${baseUrl}/${filePath}` : "");
  }, [file, filePath]);

  useEffect(() => {
    // Cleanup for previewNew
    return () => {
      if (previewNew) URL.revokeObjectURL(previewNew);
    };
  }, [previewNew]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const fd = new FormData();
    if (file) fd.append("file", file);
    fd.append("company", company);
    fd.append("type", type);
    fd.append("duration", duration?.toString() ?? ""); // Always send duration
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
        <label>
          Entreprise:
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          >
            <option value="">-- Choisir --</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nom_company}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <br />
        <label>
          Nouveau fichier (optionnel):
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              setPreviewNew(f ? URL.createObjectURL(f) : ""); // Immediate preview
            }}
          />
        </label>

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

            {/* média NOUVEAU : rendu UNIQUEMENT si previewNew existe */}
            {previewNew && (
              <figure>
                <figcaption>Nouveau</figcaption>
                {type === "image" ? (
                  <img src={previewNew} alt="Nouveau" />
                ) : (
                  <video src={previewNew} controls />
                )}
              </figure>
            )}
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
