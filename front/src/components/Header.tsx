import React, { useRef, useState, useCallback } from "react";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import "../pages-css/header/Header.css"; // <-- Import du CSS brutalist

const ACCENT = "#4f46e5";

export default function Header() {
  const navigate = useNavigate();

  // Récupération de l’utilisateur en localStorage
  const [user, setUser] = useState<{
    id: string;
    nom?: string;
    prenom?: string;
    nom_client?: string;
    role: string;
    email?: string;
    contact?: { telephone?: string };
    pfp?: string;
  } | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // État pour afficher/masquer la popup Profil
  const [showProfile, setShowProfile] = useState(false);

  // État pour gérer le crop image
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  // Callback lorsque le crop se termine
  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Ouvre l’explorateur de fichiers
  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  // Lorsqu’un fichier est sélectionné
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
    }
  };

  // Confirme le crop, envoie au backend
  const handleCropConfirm = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(selectedFile, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: croppedBlob.type,
      });

      if (
        !window.confirm("Voulez-vous vraiment modifier votre photo de profil ?")
      ) {
        // Annulation
        setSelectedFile(null);
        setCroppedAreaPixels(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        return;
      }

      // Envoi au backend
      const form = new FormData();
      form.append("pfp", croppedFile);
      const token = localStorage.getItem("token") || "";
      const endpoint = `/clients/${user.id}/pfp`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Erreur lors du téléversement");

      const data = await res.json();
      const updated = { ...user, pfp: data.pfp };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour la photo");
    } finally {
      setSelectedFile(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  // Annule le crop
  const handleCropCancel = () => {
    setSelectedFile(null);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const isClient = user.role.toLowerCase().includes("client");
  const displayName = isClient
    ? user.nom_client || ""
    : `${user.nom ?? ""} ${user.prenom ?? ""}`.trim();
  const pfpSrc = user.pfp
    ? `${import.meta.env.VITE_API_URL}/${user.pfp}`
    : null;
  const phone = user.contact?.telephone ?? "";

  return (
    <>
      {/* ---------- HEADERVISUEL ---------- */}
      <header className="brutalist-header">
        {/* Titre / Logo textuel (clique → dashboard) */}
        <a
          className="brutalist-header__title"
          onClick={() => navigate("/dashboard")}
        ></a>

        <div className="brutalist-header__content">
          {/* Si l’utilisateur a une photo de profil */}
          {pfpSrc && (
            <div
              className="brutalist-popup__avatar"
              onClick={() => setShowProfile(true)}
              style={{ width: 45, height: 45, cursor: "pointer"} }
            >
              <img
                src={pfpSrc}
                alt="Profil"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Affiche simplement le nom (sans “Bonjour”) */}
          {displayName && (
            <span className="brutalist-header__username">{displayName}</span>
          )}
        </div>
      </header>

      {/* ---------- POPUP “PROFIL” ---------- */}
      {showProfile && (
        <div
          className="brutalist-popup-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div className="brutalist-popup" onClick={(e) => e.stopPropagation()}>
            {/* Bouton de fermeture “×” */}
            <button
              className="brutalist-popup__close"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>

            <div className="brutalist-popup__header">
              {pfpSrc && (
                <div style={{ position: "relative" }}>
                  <div className="brutalist-popup__avatar">
                    <img src={pfpSrc} alt="Profil" />
                  </div>

                  {/* Bouton flottant en dehors de l’avatar */}
                  <button
                    onClick={handleEditClick}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      transform: "translate(50%, 50%)",
                      background: "#fff",
                      borderRadius: "50%",
                      border: "2px solid #000",
                      padding: 3,
                      cursor: "pointer",
                      zIndex: 100, // BIEN au-dessus
                    }}
                  >
                    <Edit size={20} color="#000" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* Nom / Email / Téléphone */}
              <h3 className="brutalist-popup__name">{displayName}</h3>
              {user.email && (
                <p className="brutalist-popup__email">{user.email}</p>
              )}
              {phone && <p className="brutalist-popup__phone">{phone}</p>}
            </div>

            {/* Bouton “Déconnexion” */}
            <button
              className="brutalist-button"
              onClick={() => {
                localStorage.clear();
                navigate("/", { replace: true });
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* ---------- POPUP “CROPPER” ---------- */}
      {selectedFile && (
        <div className="cropper-overlay">
          <div className="cropper-container">
            <Cropper
              image={URL.createObjectURL(selectedFile)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="cropper-buttons">
            <button className="btn-cancel" onClick={handleCropCancel}>
              Annuler
            </button>
            <button className="btn-confirm" onClick={handleCropConfirm}>
              Confirmer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Fonction utilitaire pour uploader le pfp côté “équipe” (si besoin)
 */
export async function uploadMemberPfp(memberId: string, file: File) {
  const form = new FormData();
  form.append("pfp", file);
  const token = localStorage.getItem("token") || "";
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/teams/members/${memberId}/pfp`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  if (!res.ok) throw new Error("Erreur lors de la mise à jour");
  return res.json();
}
