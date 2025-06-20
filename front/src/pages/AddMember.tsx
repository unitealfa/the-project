// src/pages/AddMember.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header               from '@/components/Header';
import { apiFetch }         from '@/utils/api';
import { JOB_TITLES, JobTitle } from '@/constants/team';

interface FormState {
  nom     : string;
  prenom  : string;
  email   : string;
  num     : string;
  password: string;
  poste   : 'Livraison';     // fixe ici à "Livraison"
  role    : JobTitle;        // parmi JOB_TITLES['Livraison']
}

export default function AddMember() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav               = useNavigate();

  const [f, setF] = useState<FormState>({
    nom: '',
    prenom: '',
    email: '',
    num: '',
    password: '',
    poste: 'Livraison',
    role : JOB_TITLES['Livraison'][0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Validation du mot de passe
  function validatePassword(pw: string): string {
    if (pw.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    if (!/[A-Z]/.test(pw)) return "Le mot de passe doit contenir au moins une lettre majuscule";
    if (!/[0-9]/.test(pw)) return "Le mot de passe doit contenir au moins un chiffre";
    return "";
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setEmailError("");
    const pwErr = validatePassword(f.password);
    setPasswordError(pwErr);
    if (pwErr) {
      setSaving(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/teams/${depotId}/members`, {
        method: 'POST',
        body  : JSON.stringify(f),
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
      nav(`/teams/${depotId}/livraison`, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Une erreur est survenue';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

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
          }}>Nouveau membre – Livraison</h1>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee2e2', 
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Formulaire centré et stylisé */}
        <form onSubmit={submit} style={{
          maxWidth: 800, // Largeur max pour centrer
          margin: '0 auto', // Centrer le formulaire
          backgroundColor: '#ffffff', // Fond blanc pour la carte principale
          padding: '2rem',
          borderRadius: '8px', // Coins arrondis
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
          display: 'flex', // Utiliser flexbox pour l'organisation interne
          flexDirection: 'column',
          gap: '1.5rem', // Espacement entre les champs
        }}>

          {/* Bouton Retour - AJOUTÉ ICI à l'intérieur du formulaire/carte */}
          <button
            onClick={() => nav(-1)} // Revenir à la page précédente
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

          {/* Champs du formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
            <input
              placeholder="Nom"
              value={f.nom}
              onChange={e => setF({ ...f, nom: e.target.value })}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prénom :</label>
            <input
              placeholder="Prénom"
              value={f.prenom}
              onChange={e => setF({ ...f, prenom: e.target.value })}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
            <input
              type="email"
              placeholder="Email"
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
            <input
              placeholder="Téléphone"
              value={f.num}
              onChange={e => setF({ ...f, num: e.target.value })}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          {/* Sélection de la fonction (role) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Rôle :</label>
            <select
              value={f.role}
              onChange={e => setF({ ...f, role: e.target.value as JobTitle })}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {JOB_TITLES['Livraison'].map((jt: string) => (
                <option key={jt} value={jt}>
                  {jt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={f.password}
              onChange={e => {
                setF({ ...f, password: e.target.value });
                if (passwordError) setPasswordError("");
              }}
              onBlur={e => setPasswordError(validatePassword(e.target.value))}
              required
              style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {passwordError && (
              <span style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: '0.3rem' }}>{passwordError}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: '1.5rem', // Espacement au-dessus
              padding: '1rem 2rem',
              backgroundColor: saving ? '#6b7280' : '#1a1a1a', // Gris si désactivé, noir sinon
              color: 'white',
              border: 'none',
              borderRadius: '20px', // Coins arrondis
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center', // Centrer le bouton
              transition: 'background-color 0.3s ease', // Transition douce
            }}
          >
            {saving ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </div>
    </>
  );
}
