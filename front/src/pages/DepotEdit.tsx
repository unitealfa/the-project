import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface UserRef {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  num: string;
  password?: string;
}

interface DepotDto {
  nom_depot: string;
  type_depot: string;
  capacite: number;
  adresse: { rue: string; ville: string; code_postal: string; pays: string };
  coordonnees?: { latitude: number; longitude: number } | null;
  responsable_id?: UserRef | null;
}

export default function DepotEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DepotDto | null>(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/api/depots/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error(`Erreur ${res.status}`); return res.json(); })
      .then((d: any) => setData({
        nom_depot: d.nom_depot,
        type_depot: d.type_depot,
        capacite: d.capacite,
        adresse: d.adresse,
        coordonnees: d.coordonnees,
        responsable_id: d.responsable_id,
      }))
      .catch(err => setError(err.message));
  }, [apiBase, id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!data) return;
    const { name, value } = e.target;
    if (name.startsWith('adresse.')) {
      const k = name.split('.')[1] as keyof DepotDto['adresse'];
      setData({ ...data, adresse: { ...data.adresse, [k]: value } });
    } else if (name.startsWith('coordonnees.')) {
      const k = name.split('.')[1] as keyof NonNullable<DepotDto['coordonnees']>;
      setData({
        ...data,
        coordonnees: { ...(data.coordonnees ?? { latitude: 0, longitude: 0 }), [k]: Number(value) },
      });
    } else if (name.startsWith('responsable_id.')) {
      const k = name.split('.')[1] as keyof UserRef;
      setData({
        ...data,
        responsable_id: {
          ...data.responsable_id!,
          [k]: value,
        },
      });
    } else {
      setData({ ...data, [name]: name === 'capacite' ? Number(value) : value } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const body = {
      ...data,
      responsable: {
        nom: data.responsable_id?.nom,
        prenom: data.responsable_id?.prenom,
        email: data.responsable_id?.email,
        num: data.responsable_id?.num,
        password: data.responsable_id?.password,
      },
    };
    const res = await fetch(`${apiBase}/api/depots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.message || `Erreur ${res.status}`);
    } else {
      navigate('/depots');
    }
  };

  if (error) return <><Header /><p style={{ padding: '1rem', color:'red' }}>{error}</p></>;
  if (!data) return <><Header /><p style={{ padding: '1rem' }}>Chargement…</p></>;

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Modifier le dépôt</h2>

        <label>Nom</label>
        <input name="nom_depot" value={data.nom_depot} onChange={handleChange} required />

        <label>Type</label>
        <input name="type_depot" value={data.type_depot} onChange={handleChange} required />

        <label>Capacité</label>
        <input name="capacite" type="number" value={data.capacite} onChange={handleChange} required />

        <fieldset>
          <legend>Adresse</legend>
          {(['rue','ville','code_postal','pays'] as const).map(k => (
            <div key={k}>
              <label>{k}</label>
              <input name={`adresse.${k}`} value={(data.adresse as any)[k]} onChange={handleChange} required />
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Coordonnées</legend>
          <div>
            <label>Latitude</label>
            <input name="coordonnees.latitude" type="number" value={data.coordonnees?.latitude||0} onChange={handleChange} />
          </div>
          <div>
            <label>Longitude</label>
            <input name="coordonnees.longitude" type="number" value={data.coordonnees?.longitude||0} onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Responsable</legend>
          {(['nom','prenom','email','num','password'] as (keyof UserRef)[]).map(k => (
            <div key={k}>
              <label>{k}</label>
              <input
                name={`responsable_id.${k}`}
                type={k==='email'?'email': k==='password'?'password':'text'}
                value={(data.responsable_id as any)?.[k]||''}
                onChange={handleChange}
                required={k!=='password'}
              />
            </div>
          ))}
        </fieldset>

        <button type="submit" style={{ marginTop:'1rem' }}>Enregistrer</button>
      </form>
    </>
  );
}
