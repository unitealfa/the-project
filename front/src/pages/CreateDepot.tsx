// front/src/pages/CreateDepot.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface CreateDepotDto {
  nom_depot: string;
  type_depot: string;
  capacite: number;
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  responsable: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    num: string;
  };
}

export default function CreateDepot() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  const [dto, setDto] = useState<CreateDepotDto>({
    nom_depot: '',
    type_depot: '',
    capacite: 0,
    adresse: { rue: '', ville: '', code_postal: '', pays: '' },
    coordonnees: { latitude: 0, longitude: 0 },
    responsable: { nom: '', prenom: '', email: '', password: '', num: '' },
  });
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);
  const [error, setError] = useState('');

  // Mettre à jour le preview à chaque fois que pfpFile change
  useEffect(() => {
    if (pfpFile) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const newUrl = URL.createObjectURL(pfpFile);
      objectUrlRef.current = newUrl;
      setPfpPreview(newUrl);
    } else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPfpPreview(''); 
    }
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [pfpFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${apiBase}/api/depots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erreur ${res.status}`);
      }
      navigate('/depots');
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
          }}>Nouveau dépôt</h1>
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

          {/* Section Infos de base */}
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
            }}>Infos de base</h3>
            {/* Champs existants pour Infos de base */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du dépôt :</label>
              <input
                value={dto.nom_depot}
                onChange={e => setDto({ ...dto, nom_depot: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Type de dépôt :</label>
              <input
                value={dto.type_depot}
                onChange={e => setDto({ ...dto, type_depot: e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Capacité :</label>
              <input
                type="number"
                value={dto.capacite}
                onChange={e => setDto({ ...dto, capacite: +e.target.value })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div> {/* Fin Section Infos de base */}

          {/* Section Adresse */}
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
            }}>Adresse</h3>
            {/* Champs existants pour Adresse */}
            {[{
                key: 'rue', label: 'Rue'
            }, {
                key: 'ville', label: 'Ville'
            }, {
                key: 'code_postal', label: 'Code postal'
            }, {
                key: 'pays', label: 'Pays'
            }].map(({key, label}) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>{label} :</label>
                <input
                  value={(dto.adresse as any)[key]}
                  onChange={e => setDto({ ...dto, adresse: { ...dto.adresse, [key]: e.target.value } })}
                  required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            ))}
          </div> {/* Fin Section Adresse */}

          {/* Section Coordonnées */}
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
            }}>Coordonnées</h3>
            {/* Champs existants pour Coordonnées */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Latitude :</label>
              <input
                type="number"
                value={dto.coordonnees?.latitude ?? ''}
                onChange={e =>
                  setDto({
                    ...dto,
                    coordonnees: { ...dto.coordonnees!, latitude: parseFloat(e.target.value) },
                  })
                }
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Longitude :</label>
              <input
                type="number"
                value={dto.coordonnees?.longitude ?? ''}
                onChange={e =>
                  setDto({
                    ...dto,
                    coordonnees: { ...dto.coordonnees!, longitude: parseFloat(e.target.value) },
                  })
                }
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div> {/* Fin Section Coordonnées */}

          {/* Section Responsable dépôt */}
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
            }}>Responsable dépôt</h3>
            {/* Champs existants pour Responsable dépôt */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
              <input
                value={dto.responsable.nom}
                onChange={e => setDto({ ...dto, responsable: { ...dto.responsable, nom: e.target.value } })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prénom :</label>
              <input
                value={dto.responsable.prenom}
                onChange={e => setDto({ ...dto, responsable: { ...dto.responsable, prenom: e.target.value } })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
              <input
                type="email"
                value={dto.responsable.email}
                onChange={e => setDto({ ...dto, responsable: { ...dto.responsable, email: e.target.value } })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
              <input
                type="password"
                value={dto.responsable.password}
                onChange={e => setDto({ ...dto, responsable: { ...dto.responsable, password: e.target.value } })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
              <input
                value={dto.responsable.num}
                onChange={e => setDto({ ...dto, responsable: { ...dto.responsable, num: e.target.value } })}
                required
                 style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            {/* Champ pour uploader la PFP du responsable */}
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Photo de profil du responsable :</label>
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
                (facultatif – sinon image par défaut)
              </p>
            </div>

            {/* Aperçu de l'image sélectionnée */}
            {pfpPreview && (
              <div style={{ marginTop: 16, gridColumn: '1 / -1' }}>
                <img
                  src={pfpPreview}
                  alt="Aperçu photo du responsable"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
            )}
          </div> {/* Fin Section Responsable dépôt */}

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
            Créer le dépôt
          </button>
        </form>
      </div>
    </>
  );
}
