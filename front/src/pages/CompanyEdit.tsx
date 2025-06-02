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
  pfp: string; // ← on attend que le backend envoie la propriété pfp ("images/xxx.png” ou “uploads/xxx.png”)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('companyData', JSON.stringify({
        nom_company: data.nom_company,
        gerant_company: data.gerant_company,
        contact: data.contact,
      }));
      if (pfpFile) {
        formData.append('pfp', pfpFile);
      }

      const res = await fetch(`${apiBase}/companies/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Pas de Content-Type ici
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
        <p style={{ padding: '1rem' }}>Chargement…</p>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Modifier l’entreprise</h2>

        {/* ─── APERÇU DE LA PHOTO DE PROFIL ──────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          {pfpPreview ? (
            <img
              src={pfpPreview}
              alt="Aperçu Photo de profil"
              style={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid #ccc',
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
              }}
            >
              Pas d’image
            </div>
          )}
        </div>

        <div>
          <label>Nom :</label>
          <input
            value={data.nom_company}
            onChange={e => setData({ ...data, nom_company: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Gérant :</label>
          <input
            value={data.gerant_company}
            onChange={e => setData({ ...data, gerant_company: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Téléphone :</label>
          <input
            value={data.contact.telephone}
            onChange={e =>
              setData({
                ...data,
                contact: { ...data.contact, telephone: e.target.value },
              })
            }
            required
          />
        </div>
        <div>
          <label>Email :</label>
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
          />
        </div>
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Adresse</legend>
          <div>
            <label>Rue :</label>
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
            />
          </div>
          <div>
            <label>Ville :</label>
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
            />
          </div>
          <div>
            <label>Code postal :</label>
            <input
              value={data.contact.adresse.code_postal}
              onChange={e =>
                setData({
                  ...data,
                  contact: {
                    ...data.contact,
                    adresse: {
                      ...data.contact.adresse,
                      code_postal: e.target.value,
                    },
                  },
                })
              }
              required
            />
          </div>
          <div>
            <label>Pays :</label>
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
            />
          </div>
        </fieldset>

        {/* ─── CHAMP POUR UPLOADER LA NOUVELLE PFP ────────────────────────────────── */}
        <div style={{ marginTop: '1rem' }}>
          <label>Changer la photo de profil :</label>
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
          />
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Laissez vide si vous ne voulez pas changer l’image actuelle.
          </p>
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Enregistrer les modifications
        </button>
      </form>
    </>
  );
}
