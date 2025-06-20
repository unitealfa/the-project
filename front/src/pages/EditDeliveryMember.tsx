import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header, { uploadMemberPfp } from '../components/Header';
import { apiFetch } from '../utils/api';

const DELIVERY_ROLES = [
  "Administrateur des ventes",
  "Livreur",
  "Chauffeur"
];

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  num: string;
  poste: 'Livraison';
  role: string;
  pfp?: string;
  password?: string;
}

export default function EditPreventeMember() {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const nav = useNavigate();
  const [f, setF] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState('');
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/teams/members/${memberId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const data = await res.json();
        setF({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          num: data.num,
          poste: 'Livraison',
          role: DELIVERY_ROLES.includes(data.role) ? data.role : DELIVERY_ROLES[0],
          pfp: data.pfp,
        });
        if (data.pfp) {
          setPfpPreview(`${import.meta.env.VITE_API_URL}/${data.pfp}`);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur');
      }
    })();
  }, [memberId]);

  useEffect(() => {
    if (pfpFile) {
      const url = URL.createObjectURL(pfpFile);
      setPfpPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (f?.pfp) {
      setPfpPreview(`${import.meta.env.VITE_API_URL}/${f.pfp}`);
    } else {
      setPfpPreview('');
    }
  }, [pfpFile, f?.pfp]);

  // Nouvelle validation du mot de passe (optionnel)
  function validatePassword(pw: string): string {
    if (!pw) return "";
    if (pw.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    if (!/[A-Z]/.test(pw)) return "Le mot de passe doit contenir au moins une lettre majuscule";
    if (!/[0-9]/.test(pw)) return "Le mot de passe doit contenir au moins un chiffre";
    return "";
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f) return;
    setError("");
    setEmailError("");
    setSaving(true);
    const pwErr = validatePassword(f.password || "");
    setPasswordError(pwErr);
    if (f.password && pwErr) {
      setSaving(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/teams/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        let msg = 'Une erreur est survenue';
        try {
          const data = await res.json();
          if (data && data.message) msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } catch {}
        if (msg.toLowerCase().includes('email déjà utilisé')) {
          setEmailError('Cet email est déjà utilisé.');
        } else {
          setError(msg);
        }
        setSaving(false);
        return;
      }
      if (pfpFile) {
        await uploadMemberPfp(memberId, pfpFile);
      }
      nav(-1);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <><Header />{/* Conteneur principal avec fond doux et padding */}<div style={{ backgroundColor: '#f4f7f6', padding: '2rem 1rem', minHeight: 'calc(100vh - 60px)', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ color: 'red' }}>{error}</p></div></>;
  if (!f) return <><Header />{/* Conteneur principal avec fond doux et padding */}<div style={{ backgroundColor: '#f4f7f6', padding: '2rem 1rem', minHeight: 'calc(100vh - 60px)', fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ padding: '1rem' }}>Chargement…</p></div></>;

  return (
    <>
      <Header />
      {/* Conteneur principal avec fond doux et padding */}
      <div style={{
        backgroundColor: '#f4f7f6', // Fond doux
        padding: '2rem 1rem', // Padding haut/bas et latéral
        minHeight: 'calc(100vh - 60px)', // Occupe la majorité de l'écran (soustrait la hauteur du header)
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* En-tête moderne */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800, // Aligner avec le formulaire
          margin: '0 auto',
        }}>
           <h1 style={{
            fontSize: '2rem', // Augmenter légèrement la taille
            fontWeight: 'bold',
            color: '#1a1a1a', // Noir plus prononcé
            margin: 0,
            flexGrow: 1, // Permet au titre de prendre l'espace restant
            textAlign: 'center', // Centrer le titre
            textTransform: 'uppercase', // Mettre en majuscules
            letterSpacing: '0.05em', // Espacement entre les lettres
          }}>Modifier membre Livraison</h1>
        </div>

        {/* Formulaire centré et stylisé */}
        <form
          onSubmit={submit}
          style={{
            maxWidth: 800, // Largeur max pour centrer
            margin: '0 auto', // Centrer le formulaire
            backgroundColor: '#ffffff', // Fond blanc pour la carte principale
            padding: '2rem',
            borderRadius: '8px', // Coins arrondis
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
            display: 'flex', // Utiliser flexbox pour l'organisation interne
            flexDirection: 'column',
            gap: '1.5rem', // Espacement entre les champs
          }}
        >
          {/* Bouton Retour */}
          <button
            type="button"
            onClick={() => nav(-1)}
            style={{
              alignSelf: 'flex-start', // Aligner à gauche dans le flex container
              marginBottom: '1.5rem', // Espacement sous le bouton
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a', // Bouton noir
              color: '#ffffff', // Texte blanc
              border: 'none',
              borderRadius: '20px', // Coins arrondis
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>

          {/* PFP Section */}
          <div style={{
            marginBottom: '1.5rem', // Espacement sous l'aperçu
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centrer l'image et le champ
            gap: '1rem',
          }}>
            <label style={{ fontWeight: 'bold', color: '#555' }}>Photo de profil:</label>
            <div style={{
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              overflow: 'hidden',
              border: f?.pfp || pfpFile ? '3px solid #1a1a1a' : '2px dashed #ccc', // Bordure dynamique
            }}>
              {(f?.pfp || pfpFile) ? (
                <img
                  src={pfpFile ? URL.createObjectURL(pfpFile) : `${import.meta.env.VITE_API_URL}/${f?.pfp}`}
                  alt="Photo de profil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '0.8rem',
                  }}
                >
                  Pas d'image
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPfpFile(e.target.files?.[0] || null)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
                width: '100%', // Largeur ajustée
              }}
            />
          </div>

          {/* Champs du formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
            <input placeholder="Nom" value={f?.nom || ''} onChange={e => setF(f ? { ...f, nom: e.target.value } : null)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prénom :</label>
            <input placeholder="Prénom" value={f?.prenom || ''} onChange={e => setF(f ? { ...f, prenom: e.target.value } : null)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
            <input
              type="email"
              value={f.email}
              onChange={e => {
                setF({ ...f, email: e.target.value });
                if (emailError) setEmailError("");
              }}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {emailError && (
              <span style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: '0.3rem' }}>{emailError}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
            <input placeholder="Téléphone" value={f?.num || ''} onChange={e => setF(f ? { ...f, num: e.target.value } : null)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }} />
          </div>

          {/* Rôle Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Rôle :</label>
            <select value={f?.role || DELIVERY_ROLES[0]} onChange={e => setF(f ? { ...f, role: e.target.value } : null)} required style={{
              padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
            }}>
              {DELIVERY_ROLES.map(jt => (
                <option key={jt} value={jt}>{jt}</option>
              ))}
            </select>
          </div>

          {/* Mot de passe Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
            <input
              type="password"
              value={f.password || ""}
              onChange={e => {
                setF({ ...f, password: e.target.value });
                if (passwordError) setPasswordError("");
              }}
              onBlur={e => setPasswordError(validatePassword(e.target.value))}
              style={{ padding: '0.75rem', border: passwordError ? '1px solid #dc2626' : '1px solid #ccc', borderRadius: '4px' }}
            />
            {passwordError && (
              <span style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: '0.3rem' }}>{passwordError}</span>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={saving || !f}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              backgroundColor: saving || !f ? '#ccc' : '#1a1a1a', // Gris si sauvegarde en cours ou formulaire vide
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: saving || !f ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
            }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </>
  );
}