// front/src/pages/CreateCompany.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

interface Adresse {
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface Contact {
  telephone: string;
  email: string;
  adresse: Adresse;
}

interface CompanyData {
  nom_company: string;
  gerant_company: string;
  contact: Contact;
}

interface AdminData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  num: string;
}

export default function CreateCompany() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  // ─── États existants ──────────────────────────────────────────────────────────
  const [companyData, setCompanyData] = useState<CompanyData>({
    nom_company: '',
    gerant_company: '',
    contact: {
      telephone: '',
      email: '',
      adresse: { rue: '', ville: '', code_postal: '', pays: '' },
    },
  });
  const [adminData, setAdminData] = useState<AdminData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    num: '',
  });
  const [error, setError] = useState<string>('');

  // ─── NOUVEL ÉTAT POUR LA PFP ──────────────────────────────────────────────────
  const [pfpFile, setPfpFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';

      // ─── ON CRÉE UN FORMDATA AU LIEU D'UN JSON SIMPLE ─────────────────────────
      const formData = new FormData();
      formData.append('companyData', JSON.stringify(companyData));
      formData.append('adminData', JSON.stringify(adminData));

      // Si une PFP a été sélectionnée, on l'ajoute au formData
      if (pfpFile) {
        formData.append('pfp', pfpFile);
      }

      const res = await fetch(`${apiBase}/companies`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne PAS mettre 'Content-Type' ici, fetch détermine le multipart/form-data
        },
        body: formData,
      });

      if (res.status === 401) {
        throw new Error('Non autorisé – vérifiez votre authentification');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur création');
      }

      navigate('/companies');
    } catch (err: any) {
      setError(err.message);
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
        {/* En-tête moderne - Suppression du bouton Retour ici */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800, // Aligner avec le formulaire
          margin: '0 auto',
        }}>
          {/* Bouton Retour - SUPPRIMÉ ICI */}
          {/* <button
            onClick={() => navigate(-1)}
            style={{
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button> */}
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
            flexGrow: 1,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Créer une nouvelle entreprise</h1>
        </div>

        {/* Formulaire centré et stylisé */}
        <form onSubmit={handleSubmit} style={{
          maxWidth: 800, // Largeur max pour centrer
          margin: '0 auto', // Centrer le formulaire
          backgroundColor: '#ffffff', // Fond blanc pour la carte principale
          padding: '2rem',
          borderRadius: '8px', // Coins arrondis
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
          display: 'flex', // Utiliser flexbox pour l'organisation interne
          flexDirection: 'column',
          gap: '1.5rem', // Espacement entre les sections
        }}>

          {/* Bouton Retour - AJOUTÉ ICI à l'intérieur du formulaire/carte */}
          <button
            onClick={() => navigate(-1)} // Revenir à la page précédente
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

          {/* Section Info Société */}
          <div style={{
             border: '1px solid #e5e7eb', // Bordure légère
             borderRadius: '6px',
             padding: '1.5rem',
             backgroundColor: '#fafafa', // Léger fond pour la section
             display: 'grid', // Utiliser grid pour les champs
             gridTemplateColumns: '1fr 1fr', // Deux colonnes
             gap: '1rem', // Espacement entre les éléments de la grille
          }}>
            <h3 style={{
              gridColumn: '1 / -1',
              marginTop: 0,
              marginBottom: '1.2rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1a1a1a',
            }}>Info Société</h3>
            {/* Champs existants pour Info Société */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
              <input
                name="nom_company"
                value={companyData.nom_company}
                onChange={e => setCompanyData({ ...companyData, nom_company: e.target.value })}
                required
                style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Gérant :</label>
              <input
                name="gerant_company"
                value={companyData.gerant_company}
                onChange={e => setCompanyData({ ...companyData, gerant_company: e.target.value })}
                required
                style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
              <input
                name="telephone"
                value={companyData.contact.telephone}
                onChange={e => setCompanyData({
                  ...companyData,
                  contact: { ...companyData.contact, telephone: e.target.value },
                })}
                required
                style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email Société :</label>
              <input
                type="email"
                name="email"
                value={companyData.contact.email}
                onChange={e => setCompanyData({
                  ...companyData,
                  contact: { ...companyData.contact, email: e.target.value },
                })}
                required
                style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

             {/* Section Adresse imbriquée, pas besoin de fieldset ici, div suffit */}
            <div style={{
               gridColumn: '1 / -1', // Cette section prend toute la largeur
               border: '1px solid #e5e7eb', // Bordure légère pour l'adresse
               borderRadius: '6px',
               padding: '1rem',
               backgroundColor: '#f0f0f0', // Fond encore plus léger pour l'adresse
               display: 'grid',
               gridTemplateColumns: '1fr 1fr',
               gap: '1rem',
             }}>
              <h4 style={{
                gridColumn: '1 / -1',
                marginTop: 0,
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#333',
              }}>Adresse</h4>
              {/* Champs existants pour Adresse */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Rue :</label>
                <input
                  name="rue"
                  value={companyData.contact.adresse.rue}
                  onChange={e => setCompanyData({
                    ...companyData,
                    contact: { ...companyData.contact, adresse: { ...companyData.contact.adresse, rue: e.target.value } },
                  })}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Ville :</label>
                <input
                  name="ville"
                  value={companyData.contact.adresse.ville}
                  onChange={e => setCompanyData({
                    ...companyData,
                    contact: { ...companyData.contact, adresse: { ...companyData.contact.adresse, ville: e.target.value } },
                  })}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Code postal :</label>
                <input
                  name="code_postal"
                  value={companyData.contact.adresse.code_postal}
                  onChange={e => setCompanyData({
                    ...companyData,
                    contact: { ...companyData.contact, adresse: { ...companyData.contact.adresse, code_postal: e.target.value } },
                  })}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Pays :</label>
                <input
                  name="pays"
                  value={companyData.contact.adresse.pays}
                  onChange={e => setCompanyData({
                    ...companyData,
                    contact: { ...companyData.contact, adresse: { ...companyData.contact.adresse, pays: e.target.value } },
                  })}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div> {/* Fin section Adresse */}

          </div> {/* Fin section Info Société */}

          {/* Section Upload PFP */}
          <div style={{
            border: '1px solid #e5e7eb', // Bordure légère
            borderRadius: '6px',
            padding: '1.5rem',
            backgroundColor: '#fafafa', // Léger fond
            display: 'flex', // Utiliser flexbox
            flexDirection: 'column',
            gap: '0.5rem', // Espacement entre éléments
          }}>
             <h3 style={{
               gridColumn: '1 / -1',
               marginTop: 0,
               marginBottom: '1.2rem',
               fontSize: '1.2rem',
               fontWeight: 'bold',
               color: '#1a1a1a',
             }}>Logo / Photo de profil</h3>
             <label style={{ fontWeight: 'bold', color: '#555' }}>Sélectionner un fichier :</label>
             <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setPfpFile(e.target.files[0]);
                } else {
                  setPfpFile(null);
                }
              }}
              style={{
                  padding: '0.75rem', // Ajouter padding
                  border: '1px solid #ccc', // Bordure
                  borderRadius: '4px', // Coins arrondis
                  backgroundColor: '#fff', // Fond blanc
                  cursor: 'pointer',
              }}
            />
            {pfpFile && (
                <p style={{ fontSize: '0.9rem', color: '#333', margin: '0.5rem 0 0 0' }}>Fichier sélectionné : {pfpFile.name}</p>
            )}
            <p style={{ fontSize: '0.9rem', color: '#555', margin: '0.25rem 0 0 0' }}>
              (facultatif – si vous ne mettez pas d'image, le logo par défaut sera utilisé)
            </p>
          </div> {/* Fin Section Upload PFP */}

          {/* Section Compte Admin */}
          <div style={{
             border: '1px solid #e5e7eb', // Bordure légère
             borderRadius: '6px',
             padding: '1.5rem',
             backgroundColor: '#fafafa', // Léger fond
             display: 'grid', // Utiliser grid pour les champs
             gridTemplateColumns: '1fr 1fr', // Deux colonnes
             gap: '1rem', // Espacement entre les éléments de la grille
          }}>
            <h3 style={{
              gridColumn: '1 / -1',
              marginTop: 0,
              marginBottom: '1.2rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1a1a1a',
            }}>Compte Admin</h3>
            {/* Champs existants pour Compte Admin */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
              <input
                name="nom"
                value={adminData.nom}
                onChange={e => setAdminData({ ...adminData, nom: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prénom :</label>
              <input
                name="prenom"
                value={adminData.prenom}
                onChange={e => setAdminData({ ...adminData, prenom: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
              <input
                type="email"
                name="email"
                value={adminData.email}
                onChange={e => setAdminData({ ...adminData, email: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
              <input
                type="password"
                name="password"
                value={adminData.password}
                onChange={e => setAdminData({ ...adminData, password: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Tél. Admin :</label>
              <input
                name="num"
                value={adminData.num}
                onChange={e => setAdminData({ ...adminData, num: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div> {/* Fin Section Compte Admin */}

          {error && <p style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</p>}

          {/* Bouton de soumission stylisé */}
          <button type="submit" style={{
            marginTop: '1.5rem', // Espacement au-dessus
            padding: '1rem 2rem',
            backgroundColor: '#1a1a1a', // Fond noir
            color: '#ffffff', // Texte blanc
            border: 'none',
            borderRadius: '20px', // Coins arrondis
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            alignSelf: 'center', // Centrer le bouton
            transition: 'background-color 0.3s ease', // Transition douce
          }}>
            Créer l'entreprise et son Admin
          </button>
        </form>
      </div>
    </>
  );
}
