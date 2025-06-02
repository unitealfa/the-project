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
      const formData = new FormData();
      formData.append('nom_depot', dto.nom_depot);
      formData.append('type_depot', dto.type_depot);
      formData.append('capacite', dto.capacite.toString());
      formData.append('adresse', JSON.stringify(dto.adresse));
      if (dto.coordonnees) {
        formData.append('coordonnees', JSON.stringify(dto.coordonnees));
      }
      formData.append('responsable', JSON.stringify(dto.responsable));
      if (pfpFile) {
        formData.append('pfp', pfpFile);
      }

      const res = await fetch(`${apiBase}/api/depots`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      navigate('/depots');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Nouveau dépôt</h2>

        {/*   Infos de base   */}
        <div>
          <label>Nom du dépôt</label>
          <input
            value={dto.nom_depot}
            onChange={e => setDto({ ...dto, nom_depot: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Type de dépôt</label>
          <input
            value={dto.type_depot}
            onChange={e => setDto({ ...dto, type_depot: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Capacité</label>
          <input
            type="number"
            value={dto.capacite}
            onChange={e => setDto({ ...dto, capacite: +e.target.value })}
            required
          />
        </div>

        {/*   Adresse   */}
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Adresse</legend>
          {['rue', 'ville', 'code_postal', 'pays'].map(k => (
            <div key={k}>
              <label>{k.replace('_', ' ').toUpperCase()}</label>
              <input
                value={(dto.adresse as any)[k]}
                onChange={e =>
                  setDto({ ...dto, adresse: { ...dto.adresse, [k]: e.target.value } })
                }
                required
              />
            </div>
          ))}
        </fieldset>

        {/*   Coordonnées   */}
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Coordonnées</legend>
          <div>
            <label>Latitude</label>
            <input
              type="number"
              value={dto.coordonnees?.latitude ?? 0}
              onChange={e =>
                setDto({
                  ...dto,
                  coordonnees: { ...dto.coordonnees!, latitude: parseFloat(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label>Longitude</label>
            <input
              type="number"
              value={dto.coordonnees?.longitude ?? 0}
              onChange={e =>
                setDto({
                  ...dto,
                  coordonnees: { ...dto.coordonnees!, longitude: parseFloat(e.target.value) },
                })
              }
            />
          </div>
        </fieldset>

        {/*   Responsable dépôt   */}
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Responsable dépôt</legend>

          <div>
            <label>Nom</label>
            <input
              value={dto.responsable.nom}
              onChange={e =>
                setDto({ ...dto, responsable: { ...dto.responsable, nom: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Prénom</label>
            <input
              value={dto.responsable.prenom}
              onChange={e =>
                setDto({ ...dto, responsable: { ...dto.responsable, prenom: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={dto.responsable.email}
              onChange={e =>
                setDto({ ...dto, responsable: { ...dto.responsable, email: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={dto.responsable.password}
              onChange={e =>
                setDto({ ...dto, responsable: { ...dto.responsable, password: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Téléphone</label>
            <input
              value={dto.responsable.num}
              onChange={e =>
                setDto({ ...dto, responsable: { ...dto.responsable, num: e.target.value } })
              }
              required
            />
          </div>

          {/* Champ pour uploader la PFP du responsable */}
          <div style={{ marginTop: '1rem' }}>
            <label>Photo de profil du responsable :</label>
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
              (facultatif – sinon image par défaut)
            </p>
          </div>

          {/* Aperçu de l'image sélectionnée */}
          {pfpPreview && (
            <div style={{ marginTop: 16 }}>
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
        </fieldset>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ marginTop: '1rem' }}>
          Créer le dépôt
        </button>
      </form>
    </>
  );
}
