import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

interface FormData {
  nom_client: string;
  email: string;
  password: string;
  contact: {
    nom_gerant: string;
    telephone: string;
  };
  affectations: Array<{
    entreprise: string;
    depot: string;
  }>;
  localisation: {
    adresse: string;
    ville: string;
    code_postal: string;
    region: string;
    coordonnees: {
      latitude: number;
      longitude: number;
    };
  };
  pfp?: string; // +++
}

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nom_client: '',
    email: '',
    password: '',
    contact: {
      nom_gerant: '',
      telephone: '',
    },
    affectations: [{
      entreprise: '',
      depot: '',
    }],
    localisation: {
      adresse: '',
      ville: '',
      code_postal: '',
      region: '',
      coordonnees: {
        latitude: 0,
        longitude: 0,
      },
    },
  });
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [removePfp, setRemovePfp] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token') || '';
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${apiBase}/clients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        // On ne récupère pas le mot de passe
        const { password, ...clientData } = data;
        
        setFormData({
          ...clientData,
          password: '', // On initialise le mot de passe à vide
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchClient();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('contact.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [key]: value }
      }));
    } else if (name.startsWith('localisation.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        localisation: { 
          ...prev.localisation,
          [key]: value 
        }
      }));
    } else if (name.startsWith('coordonnees.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        localisation: {
          ...prev.localisation,
          coordonnees: {
            ...prev.localisation.coordonnees,
            [key]: parseFloat(value)
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Vérifier le mot de passe avant de soumettre
    if (!validatePassword(formData.password)) {
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        password: formData.password || undefined
      };

      let body;
      let headers;
      if (pfpFile || removePfp) {
        // Si nouvelle image ou suppression → multipart/form-data
        body = new FormData();
        body.append('nom_client', dataToSend.nom_client);
        body.append('email', dataToSend.email);
        if (dataToSend.password) body.append('password', dataToSend.password);
        body.append('contact.nom_gerant', dataToSend.contact.nom_gerant);
        body.append('contact.telephone', dataToSend.contact.telephone);
        body.append('localisation.adresse', dataToSend.localisation.adresse);
        body.append('localisation.ville', dataToSend.localisation.ville);
        body.append('localisation.code_postal', dataToSend.localisation.code_postal);
        body.append('localisation.region', dataToSend.localisation.region);
        body.append('coordonnees.latitude', dataToSend.localisation.coordonnees.latitude.toString());
        body.append('coordonnees.longitude', dataToSend.localisation.coordonnees.longitude.toString());
        if (pfpFile) {
          body.append('pfp', pfpFile);
        }
        if (removePfp) {
          body.append('removePfp', 'true');
        }
        headers = { Authorization: `Bearer ${token}` };
      } else {
        // Sinon → JSON normal
        body = JSON.stringify(dataToSend);
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
      }

      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'PUT',
        headers,
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la modification du client');
      }

      setSuccess('Client modifié avec succès');
      setTimeout(() => navigate('/clients'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!formData) {
    return (
      <>
        <Header />
        {/* Conteneur principal avec fond doux et padding */}
        <div style={{
          backgroundColor: '#f4f7f6',
          padding: '2rem 1rem',
          minHeight: 'calc(100vh - 60px)',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <p>Chargement…</p>
        </div>
      </>
    );
  }

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
          }}>Modifier le client</h1>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

        {/* Formulaire centré et stylisé */}
        <form
          onSubmit={handleSubmit}
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
            onClick={() => navigate(-1)}
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
            <label htmlFor="nom_client" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du client:</label>
            <input
              id="nom_client"
              name="nom_client"
              value={formData.nom_client}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="email" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={e => {
                setFormData({ ...formData, password: e.target.value });
                validatePassword(e.target.value);
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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="nom_gerant" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du gérant:</label>
            <input
              id="nom_gerant"
              name="contact.nom_gerant"
              value={formData.contact.nom_gerant}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="telephone" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone:</label>
            <input
              id="telephone"
              name="contact.telephone"
              value={formData.contact.telephone}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* PFP Section */}
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <label style={{ fontWeight: 'bold', color: '#555' }}>Photo de profil:</label>
            <div 
              style={{
                position: 'relative',
                width: 120,
                height: 120,
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                overflow: 'hidden',
                border: formData.pfp || pfpFile ? '3px solid #1a1a1a' : '2px dashed #ccc',
              }}>
                {(formData.pfp || pfpFile) ? (
                  <img
                    src={pfpFile ? URL.createObjectURL(pfpFile) : `${apiBase}/${formData.pfp}`}
                    alt="Aperçu Photo de profil"
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
              {(formData.pfp || pfpFile) && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  opacity: isHovering ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  cursor: 'pointer',
                }}>
                  <label
                    htmlFor="pfp-upload"
                    style={{
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '1.2rem',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </label>
                  <button
                    type="button"
                    onClick={() => setRemovePfp(!removePfp)}
                    style={{
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '1.2rem',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              )}
              <input
                id="pfp-upload"
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setPfpFile(e.target.files[0]);
                    setRemovePfp(false);
                  } else {
                    setPfpFile(null);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
            {removePfp && (
              <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                L'image sera supprimée lors de l'enregistrement.
              </p>
            )}
          </div>

          <fieldset
            style={{
              marginTop: '1rem',
              padding: '1.5rem',
              border: '1px solid #ddd', // Bordure douce pour le fieldset
              borderRadius: '8px', // Coins arrondis
              backgroundColor: '#fafafa', // Fond très léger pour le fieldset
              display: 'flex', // Utiliser flexbox pour l'organisation interne
              flexDirection: 'column',
              gap: '1rem', // Espacement entre les champs du fieldset
            }}
          >
            <legend
              style={{
                fontWeight: 'bold',
                color: '#1a1a1a', // Titre de légende sombre
                padding: '0 0.5rem',
                fontSize: '1.1rem', // Taille légèrement augmentée
              }}
            >Localisation</legend>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="adresse" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Adresse:</label>
              <input
                id="adresse"
                name="localisation.adresse"
                value={formData.localisation.adresse}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="ville" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Ville:</label>
              <input
                id="ville"
                name="localisation.ville"
                value={formData.localisation.ville}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="code_postal" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Code postal:</label>
              <input
                id="code_postal"
                name="localisation.code_postal"
                value={formData.localisation.code_postal}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="region" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Région:</label>
              <input
                id="region"
                name="localisation.region"
                value={formData.localisation.region}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <fieldset
              style={{
                marginTop: '1rem',
                padding: '1.5rem',
                border: '1px solid #ddd', // Bordure douce pour le fieldset imbriqué
                borderRadius: '8px', // Coins arrondis
                backgroundColor: '#fff', // Fond blanc pour le fieldset imbriqué
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <legend
                style={{
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  padding: '0 0.5rem',
                  fontSize: '1rem', // Taille normale pour la légende imbriquée
                }}
              >Coordonnées</legend>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="latitude" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Latitude:</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="coordonnees.latitude"
                  value={formData.localisation.coordonnees.latitude}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="longitude" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Longitude:</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="coordonnees.longitude"
                  value={formData.localisation.coordonnees.longitude}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </fieldset>
          </fieldset>

          {/* Bouton de soumission */}
          <button
            type="submit"
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
            }}
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </>
  );
}
