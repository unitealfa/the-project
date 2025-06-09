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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState<string>('');
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
    if (!data) return;
    setError('');
    setSuccess('');

    // Vérifier le mot de passe avant de soumettre
    if (data.responsable_id?.password && !validatePassword(data.responsable_id.password)) {
      return;
    }

    try {
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
        throw new Error(err.message || `Erreur ${res.status}`);
      }
      setSuccess('Dépôt modifié avec succès');
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <>
        <Header />
        <div style={{
          backgroundColor: '#f4f7f6',
          padding: '2rem 1rem',
          minHeight: 'calc(100vh - 60px)',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ color: 'red', textAlign: 'center', fontSize: '1.1rem' }}>{error}</div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
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
      <div style={{
        backgroundColor: '#f4f7f6',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 60px)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800,
          margin: '0 auto',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
            flexGrow: 1,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Modifier le dépôt</h1>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start',
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="nom_depot" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du dépôt:</label>
            <input
              id="nom_depot"
              name="nom_depot"
              value={data.nom_depot}
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
            <label htmlFor="type_depot" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Type de dépôt:</label>
            <input
              id="type_depot"
              name="type_depot"
              value={data.type_depot}
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
            <label htmlFor="capacite" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Capacité:</label>
            <input
              id="capacite"
              name="capacite"
              type="number"
              value={data.capacite}
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

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Adresse</legend>

            {(['rue', 'ville', 'code_postal', 'pays'] as const).map(k => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor={`adresse.${k}`} style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}:
                </label>
                <input
                  id={`adresse.${k}`}
                  name={`adresse.${k}`}
                  value={(data.adresse as any)[k]}
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
            ))}
          </fieldset>

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Coordonnées</legend>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="coordonnees.latitude" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Latitude:</label>
              <input
                id="coordonnees.latitude"
                name="coordonnees.latitude"
                type="number"
                value={data.coordonnees?.latitude || 0}
                onChange={handleChange}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="coordonnees.longitude" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Longitude:</label>
              <input
                id="coordonnees.longitude"
                name="coordonnees.longitude"
                type="number"
                value={data.coordonnees?.longitude || 0}
                onChange={handleChange}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </fieldset>

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Responsable</legend>

            {(['nom', 'prenom', 'email', 'num'] as (keyof UserRef)[]).map(k => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor={`responsable_id.${k}`} style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}:
                </label>
                <input
                  id={`responsable_id.${k}`}
                  name={`responsable_id.${k}`}
                  type={k === 'email' ? 'email' : 'text'}
                  value={(data.responsable_id as any)?.[k] || ''}
                  onChange={handleChange}
                  required={k !== 'email'}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nouveau mot de passe (optionnel) :</label>
              <input
                type="password"
                name="responsable_id.password"
                value={data.responsable_id?.password || ''}
                onChange={e => {
                  setData({
                    ...data,
                    responsable_id: {
                      ...data.responsable_id!,
                      password: e.target.value
                    }
                  });
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
          </fieldset>

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
