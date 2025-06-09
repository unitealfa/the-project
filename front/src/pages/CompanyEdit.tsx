import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

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
  pfp: string; // ← on attend que le backend envoie la propriété pfp ("images/xxx.png" ou "uploads/xxx.png")
  password?: string;
}

interface FormState {
  nom: string;
  email: string;
  num: string;
  adresse: string;
  password?: string;
}

export default function CompanyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- États pour les données de formulaire ---
  const [data, setData] = useState<CompanyData>({
    nom_company: '',
    gerant_company: '',
    contact: {
      telephone: '',
      email: '',
      adresse: { rue: '', ville: '', code_postal: '', pays: '' },
    },
    pfp: '', // sera remplacé à la première récupération
  });
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordError, setPasswordError] = useState<string>('');

  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  // Pour stocker l'URL temporaire créé avec URL.createObjectURL,
  // afin de pouvoir le révoquer quand on change de fichier ou qu'on démonte :
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // 1) Récupérer la company depuis l'API, incluant pfp
    fetch(`${apiBase}/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((c: CompanyData) => {
        setData({
          nom_company: c.nom_company,
          gerant_company: c.gerant_company,
          contact: {
            telephone: c.contact.telephone,
            email: c.contact.email,
            adresse: {
              rue: c.contact.adresse.rue,
              ville: c.contact.adresse.ville,
              code_postal: c.contact.adresse.code_postal,
              pays: c.contact.adresse.pays,
            },
          },
          pfp: c.pfp,
          password: c.password,
        });
        // 2) Initialiser pfpPreview avec l'URL de l'image courante
        setPfpPreview(`${apiBase}/${c.pfp}`);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiBase, id, token]);

  // Dès que pfpFile est mis à jour, on génère un nouvel URL temporaire
  useEffect(() => {
    if (pfpFile) {
      // Révoquer l'ancien URL s'il existait
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const newUrl = URL.createObjectURL(pfpFile);
      objectUrlRef.current = newUrl;
      setPfpPreview(newUrl);
    }
    // Si on remet pfpFile à null (ie. on retire la sélection), on restaure l'image courante
    // Mais dans ce cas, data.pfp doit toujours contenir l'ancien chemin, alors on peut faire :
    else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      // Restaurer l'URL de l'ancienne image stockée dans data.pfp
      setPfpPreview(`${apiBase}/${data.pfp}`);
    }
    // Lorsque le composant se démonte, on révoque l'URL éventuel aussi
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [pfpFile, data.pfp, apiBase]);

  // Fonction de validation du mot de passe
  const validatePassword = (password: string): boolean => {
    if (!password) return true; // Le mot de passe est optionnel en édition
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
    try {
      const formData = new FormData();
      formData.append('companyData', JSON.stringify({
        nom_company: data.nom_company,
        gerant_company: data.gerant_company,
        contact: data.contact,
        password: data.password, // Ajouter le mot de passe s'il est fourni
      }));
      if (pfpFile) {
        formData.append('pfp', pfpFile);
      }

      // Vérifier le mot de passe avant de soumettre
      if (data.password && !validatePassword(data.password)) {
        return;
      }

      const res = await fetch(`${apiBase}/companies/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Erreur ${res.status}`);
      }
      navigate('/companies');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
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
  if (error) {
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
          <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
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
          }}>Modifier l'entreprise</h1>
        </div>

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

          {/* ─── APERÇU DE LA PHOTO DE PROFIL ──────────────────────────────────── */}
          <div style={{
            marginBottom: '1.5rem', // Espacement sous l'aperçu
            display: 'flex',
            justifyContent: 'center', // Centrer l'image
          }}>
            {pfpPreview ? (
              <img
                src={pfpPreview}
                alt="Aperçu Photo de profil"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #1a1a1a', // Bordure plus prononcée
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: '#666',
                  fontSize: '0.8rem',
                  border: '2px dashed #ccc', // Bordure pointillée pour l'absence d'image
                }}
              >
                Pas d'image
              </div>
            )}
          </div>

          {/* Champs du formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom :</label>
              <input
                value={data.nom_company}
                onChange={e => setData({ ...data, nom_company: e.target.value })}
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
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Gérant :</label>
              <input
                value={data.gerant_company}
                onChange={e => setData({ ...data, gerant_company: e.target.value })}
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
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
              <input
                value={data.contact.telephone}
                onChange={e =>
                  setData({
                    ...data,
                    contact: { ...data.contact, telephone: e.target.value },
                  })
                }
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
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
              <input
                type="email"
                value={data.contact.email}
                onChange={e =>
                  setData({
                    ...data,
                    contact: { ...data.contact, email: e.target.value },
                  })
                }
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Champ de mot de passe */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                Nouveau mot de passe (optionnel) :
              </label>
              <input
                type="password"
                value={data.password || ''}
                onChange={e => {
                  setData({ ...data, password: e.target.value });
                  if (e.target.value) {
                    validatePassword(e.target.value);
                  } else {
                    setPasswordError('');
                  }
                }}
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
            {/* Champ de fichier pour la photo de profil */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Photo de profil :</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPfpFile(e.target.files ? e.target.files[0] : null)}
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
                border: '1px solid #ddd', // Bordure douce pour le fieldset
                borderRadius: '8px', // Coins arrondis
                backgroundColor: '#fafafa', // Fond très léger pour le fieldset
              }}
            >
              <legend
                style={{
                  fontWeight: 'bold',
                  color: '#1a1a1a', // Titre de légende sombre
                  padding: '0 0.5rem',
                  fontSize: '1.1rem', // Taille légèrement augmentée
                }}
              >Adresse</legend>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Rue :</label>
                <input
                  value={data.contact.adresse.rue}
                  onChange={e =>
                    setData({
                      ...data,
                      contact: {
                        ...data.contact,
                        adresse: { ...data.contact.adresse, rue: e.target.value },
                      },
                    })
                  }
                  required
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Ville :</label>
                <input
                  value={data.contact.adresse.ville}
                  onChange={e =>
                    setData({
                      ...data,
                      contact: {
                        ...data.contact,
                        adresse: { ...data.contact.adresse, ville: e.target.value },
                      },
                    })
                  }
                  required
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Code postal :</label>
                <input
                  value={data.contact.adresse.code_postal}
                  onChange={e =>
                    setData({
                      ...data,
                      contact: {
                        ...data.contact,
                        adresse: { ...data.contact.adresse, code_postal: e.target.value },
                      },
                    })
                  }
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
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Pays :</label>
                <input
                  value={data.contact.adresse.pays}
                  onChange={e =>
                    setData({
                      ...data,
                      contact: {
                        ...data.contact,
                        adresse: { ...data.contact.adresse, pays: e.target.value },
                      },
                    })
                  }
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
          </div>
        </form>
      </div>
    </>
  );
}
