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
  poste   : 'Prévente';        // fixe ici
  role    : JobTitle;          // parmi JOB_TITLES['Prévente']
}

export default function AddPrevente() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav               = useNavigate();

  const [f, setF] = useState<FormState>({
    nom:'', prenom:'', email:'', num:'', password:'',
    poste:'Prévente',
    role: JOB_TITLES['Prévente'][0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Fonction de validation du mot de passe
  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 6;

    if (!hasUpperCase) {
      setPasswordError('Le mot de passe doit contenir au moins une lettre majuscule');
      return false;
    }
    if (!hasNumber) {
      setPasswordError('Le mot de passe doit contenir au moins un chiffre');
      return false;
    }
    if (!hasMinLength) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Vérifier le mot de passe avant de soumettre
    if (!validatePassword(f.password)) {
      setSaving(false);
      return;
    }

    try {
      await apiFetch(`/api/teams/${depotId}/members`, {
        method:'POST',
        body: JSON.stringify(f),
      });
      nav(`/teams/${depotId}/prevente`, { replace:true });
    } catch(err:any) {
      setError(err.message || 'Une erreur est survenue');
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
          }}>Nouveau membre – Pré-vente</h1>
        </div>

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
            <input placeholder='Nom'      value={f.nom}
                   onChange={e=>setF({...f, nom:e.target.value})}      required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prénom :</label>
            <input placeholder='Prénom'   value={f.prenom}
                   onChange={e=>setF({...f, prenom:e.target.value})}   required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
            <input type='email' placeholder='Email' value={f.email}
                   onChange={e=>setF({...f, email:e.target.value})}    required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
            <input placeholder='Téléphone' value={f.num}
                   onChange={e=>setF({...f, num:e.target.value})}      required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

        {/* Sélection de la fonction (role) */}
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Rôle :</label>
             <select value={f.role}
                     onChange={e=>setF({...f, role:e.target.value as JobTitle})}
                     required
                     style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              >
               {JOB_TITLES['Prévente'].map((jt: string) =>
                 <option key={jt} value={jt}>{jt}</option>
               )}
             </select>
           </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
            <input
              type="password"
              value={f.password}
              onChange={e => {
                setF({ ...f, password: e.target.value });
                if (e.target.value) {
                  validatePassword(e.target.value);
                } else {
                  setPasswordError('');
                }
              }}
              required
              style={{ 
                padding: '0.75rem', 
                border: passwordError ? '1px solid #dc2626' : '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
            {passwordError && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {passwordError}
              </p>
            )}
          </div>

          <button type='submit' disabled={saving}
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
                  }}>
            {saving ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </div>
    </>
  );
}
