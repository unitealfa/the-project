import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Adresse { rue: string; ville: string; code_postal: string; pays: string }
interface Coordonnees { latitude: number; longitude: number }
interface Responsable {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  num: string;
  password?: string; // facultatif si on laisse vide
}

interface DepotDto {
  nom_depot: string;
  type_depot: string;
  capacite: number;
  adresse: Adresse;
  coordonnees?: Coordonnees | null;
  responsable_id?: Responsable;
}

export default function DepotEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dto, setDto] = useState<DepotDto>({
    nom_depot: '',
    type_depot: '',
    capacite: 0,
    adresse: { rue: '', ville: '', code_postal: '', pays: '' },
    coordonnees: { latitude: 0, longitude: 0 },
    responsable_id: { _id: '', nom: '', prenom: '', email: '', num: '' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/depots/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then((data: any) => {
        setDto({
          ...data,
          coordonnees: data.coordonnees || { latitude: 0, longitude: 0 },
          responsable_id: data.responsable_id || { _id: '', nom: '', prenom: '', email: '', num: '' },
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiBase, id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bodyToSend = {
      ...dto,
      responsable: {
        _id: dto.responsable_id?._id,
        nom: dto.responsable_id?.nom,
        prenom: dto.responsable_id?.prenom,
        email: dto.responsable_id?.email,
        num: dto.responsable_id?.num,
        ...(dto.responsable_id?.password ? { password: dto.responsable_id.password } : {}),
      },
    };

    try {
      const res = await fetch(`${apiBase}/depots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyToSend),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      navigate('/depots');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <><Header /><p style={{ padding: '1rem' }}>Chargement…</p></>;
  if (error) return <><Header /><p style={{ color: 'red', padding: '1rem' }}>{error}</p></>;

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Modifier le dépôt</h2>

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

        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Adresse</legend>
          {['rue', 'ville', 'code_postal', 'pays'].map(k => (
            <div key={k}>
              <label>{k.toUpperCase()}</label>
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

        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Coordonnées</legend>
          <div>
            <label>Latitude</label>
            <input
              type="number"
              value={dto.coordonnees?.latitude ?? ''}
              onChange={e =>
                setDto({ ...dto, coordonnees: { ...dto.coordonnees!, latitude: +e.target.value } })
              }
            />
          </div>
          <div>
            <label>Longitude</label>
            <input
              type="number"
              value={dto.coordonnees?.longitude ?? ''}
              onChange={e =>
                setDto({ ...dto, coordonnees: { ...dto.coordonnees!, longitude: +e.target.value } })
              }
            />
          </div>
        </fieldset>

        {dto.responsable_id && (
          <fieldset style={{ marginTop: '1rem' }}>
            <legend>Responsable dépôt</legend>

            <div>
              <label>NOM</label>
              <input
                value={dto.responsable_id.nom}
                onChange={e =>
                  setDto({ ...dto, responsable_id: { ...dto.responsable_id!, nom: e.target.value } })
                }
                required
              />
            </div>

            <div>
              <label>PRENOM</label>
              <input
                value={dto.responsable_id.prenom}
                onChange={e =>
                  setDto({ ...dto, responsable_id: { ...dto.responsable_id!, prenom: e.target.value } })
                }
                required
              />
            </div>

            <div>
              <label>EMAIL</label>
              <input
                type="email"
                value={dto.responsable_id.email}
                onChange={e =>
                  setDto({ ...dto, responsable_id: { ...dto.responsable_id!, email: e.target.value } })
                }
                required
              />
            </div>

            <div>
              <label>NUM</label>
              <input
                value={dto.responsable_id.num}
                onChange={e =>
                  setDto({ ...dto, responsable_id: { ...dto.responsable_id!, num: e.target.value } })
                }
                required
              />
            </div>

            <div>
              <label>Mot de passe (laisser vide si inchangé)</label>
              <input
                type="password"
                value={dto.responsable_id.password || ''}
                onChange={e =>
                  setDto({ ...dto, responsable_id: { ...dto.responsable_id!, password: e.target.value } })
                }
              />
            </div>
          </fieldset>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ marginTop: '1rem' }}>
          Enregistrer
        </button>
      </form>
    </>
  );
}
