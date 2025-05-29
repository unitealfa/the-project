import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

/* ————————————————
   Types / state
   ———————————————— */
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
  const [error, setError] = useState('');

  /* ————————————————
     Soumission
     ———————————————— */
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
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      navigate('/depots');
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ————————————————
     UI
     ———————————————— */
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
        </fieldset>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ marginTop: '1rem' }}>
          Créer le dépôt
        </button>
      </form>
    </>
  );
}
