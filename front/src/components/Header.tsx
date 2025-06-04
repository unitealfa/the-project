import React, { useRef, useState, useCallback } from 'react';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage'; // utilitaire de recadrage

const ACCENT = '#4f46e5';

export default function Header() {
  const navigate = useNavigate();

  // → Récupère l’utilisateur depuis localStorage
  const [user, setUser] = useState<{
    id: string;
    nom?: string;
    prenom?: string;
    nom_client?: string;
    role: string;
    company?: string;
    email?: string;
    contact?: { telephone?: string };
    pfp?: string;
  } | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  // ------------------- états pour ouvrir/fermer le modal Profil -------------------
  const [showProfile, setShowProfile] = useState(false);

  // ------------------- gestion du cropping -------------------
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

  // Une fois le crop terminé, on récupère les coordonnées en pixels
  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Lorsque l’utilisateur clique sur le crayon, on ouvre directement l’explorateur de fichiers
  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  // Dès qu’il choisit un fichier, on l’enregistre (ouvre le cropper automatiquement)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
    }
  };

  // Quand l’utilisateur clique sur “Confirmer” dans le cropper :
  // 1) on extrait le Blob recadré
  // 2) on demande “Voulez-vous vraiment modifier… ?”
  // 3) si OK → upload ; sinon on annule
  const handleCropConfirm = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(selectedFile, croppedAreaPixels);
      // On crée un File à partir du Blob
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: croppedBlob.type,
      });

      // Nouvelle confirmation avant envoi
      const ok = window.confirm('Voulez-vous vraiment modifier votre photo de profil ?');
      if (!ok) {
        // Annule le cropper et on ne touche pas à l’ancien pfp
        setSelectedFile(null);
        setCroppedAreaPixels(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        return;
      }

      // Si confirmé, on prépare le FormData et on envoie au backend
      const form = new FormData();
      form.append('pfp', croppedFile);

      const token = localStorage.getItem('token') || '';
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/clients/${user.id}/pfp`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      if (!res.ok) throw new Error('Erreur lors du téléversement');

      const data = await res.json();
      // On met à jour le localStorage et l’état avec la nouvelle URL
      const updated = { ...user, pfp: data.pfp };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      console.error(err);
      alert('Impossible de mettre à jour la photo');
    } finally {
      // Dans tous les cas, on ferme le cropper
      setSelectedFile(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  // Annuler le cropper sans rien envoyer
  const handleCropCancel = () => {
    setSelectedFile(null);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  // ------------------- rendu du Header + Modal Profil -------------------
  const isClient = user.role.toLowerCase().includes('client');
  const displayName = isClient
    ? user.nom_client || ''
    : `${user.nom ?? ''} ${user.prenom ?? ''}`.trim();
  const pfpSrc =
    isClient && user.pfp
      ? `${import.meta.env.VITE_API_URL}/${user.pfp}`
      : null;
  const phone = user.contact?.telephone ?? '';

  return (
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: ACCENT,
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1
          style={{ margin: 0, fontSize: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          Routimize
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {pfpSrc && (
            <div
              onClick={() => setShowProfile(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #fff',
                cursor: 'pointer',
              }}
            >
              <img
                src={pfpSrc}
                alt="Profil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <span>
            Bonjour <strong>{displayName}</strong>{' '}
            <em style={{ opacity: 0.8 }}>({user.role})</em>
          </span>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '.35rem .9rem',
              background: '#fff',
              color: ACCENT,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Tableau de bord
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate('/', { replace: true });
            }}
            style={{
              padding: '.35rem .9rem',
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,.8)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Modal Profil */}
      {showProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowProfile(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: 8,
              width: '90%',
              maxWidth: 320,
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowProfile(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            {pfpSrc && (
              <div
                style={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                }}
              >
                <img
                  src={pfpSrc}
                  alt="Profil"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <button
                  onClick={handleEditClick}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    transform: 'translate(25%, 25%)',
                    background: '#fff',
                    borderRadius: '50%',
                    border: '1px solid #ccc',
                    padding: 4,
                    cursor: 'pointer',
                  }}
                >
                  <Edit size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            )}

            <h3 style={{ margin: '0.75rem 0 0.25rem' }}>{displayName}</h3>
            {user.email && <p style={{ margin: 0 }}>{user.email}</p>}
            {phone && <p style={{ margin: 0 }}>{phone}</p>}
          </div>
        </div>
      )}

      {/* Modal de cropping (s’affiche si selectedFile est non null) */}
      {selectedFile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              height: 400,
              background: '#333',
            }}
          >
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

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={handleCropCancel}
              style={{
                padding: '0.5rem 1rem',
                background: '#bbb',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#000',
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleCropConfirm}
              style={{
                padding: '0.5rem 1rem',
                background: ACCENT,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
