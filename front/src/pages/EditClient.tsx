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
  const [error, setError] = useState('');
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
  const [pfpFile, setPfpFile] = useState<File | null>(null); // +++

  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token') || '';
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    fetch(`${apiBase}/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const client = data.find((c: any) => c._id === id);
        if (!client) throw new Error('Client introuvable');
        setFormData(client);
      })
      .catch(err => setError(err.message));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let body;
      let headers;

      if (pfpFile) {
        // Si nouvelle image → multipart/form-data
        body = new FormData();
        body.append('nom_client', formData.nom_client);
        body.append('email', formData.email);
        if (formData.password) body.append('password', formData.password);
        body.append('contact.nom_gerant', formData.contact.nom_gerant);
        body.append('contact.telephone', formData.contact.telephone);
        body.append('localisation.adresse', formData.localisation.adresse);
        body.append('localisation.ville', formData.localisation.ville);
        body.append('localisation.code_postal', formData.localisation.code_postal);
        body.append('localisation.region', formData.localisation.region);
        body.append('coordonnees.latitude', formData.localisation.coordonnees.latitude.toString());
        body.append('coordonnees.longitude', formData.localisation.coordonnees.longitude.toString());
        body.append('pfp', pfpFile); // +++
        headers = { Authorization: `Bearer ${token}` };
      } else {
        // Sinon → JSON normal
        const dataToSend = { ...formData, ...(formData.password ? {} : { password: undefined }) };
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
        const error = await res.json();
        throw new Error(error.message || 'Erreur lors de la modification');
      }

      setSuccess('Client modifié avec succès');
      setTimeout(() => navigate('/clients'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!formData) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>✏️ Modifier le client</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}>
          <div style={formGroup}>
            <label htmlFor="nom_client" style={labelStyle}>Nom du client:</label>
            <input
              id="nom_client"
              name="nom_client"
              value={formData.nom_client}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="email" style={labelStyle}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="password" style={labelStyle}>Nouveau mot de passe (optionnel):</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Laissez vide pour ne pas modifier"
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="nom_gerant" style={labelStyle}>Nom du gérant:</label>
            <input
              id="nom_gerant"
              name="contact.nom_gerant"
              value={formData.contact.nom_gerant}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="telephone" style={labelStyle}>Téléphone:</label>
            <input
              id="telephone"
              name="contact.telephone"
              value={formData.contact.telephone}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="adresse" style={labelStyle}>Adresse:</label>
            <input
              id="adresse"
              name="localisation.adresse"
              value={formData.localisation?.adresse || ''}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="ville" style={labelStyle}>Ville:</label>
            <input
              id="ville"
              name="localisation.ville"
              value={formData.localisation?.ville || ''}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="code_postal" style={labelStyle}>Code postal:</label>
            <input
              id="code_postal"
              name="localisation.code_postal"
              value={formData.localisation?.code_postal || ''}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="region" style={labelStyle}>Région:</label>
            <input
              id="region"
              name="localisation.region"
              value={formData.localisation?.region || ''}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="latitude" style={labelStyle}>Latitude:</label>
            <input
              type="number"
              step="any"
              id="latitude"
              name="coordonnees.latitude"
              value={formData.localisation?.coordonnees?.latitude || 0}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroup}>
            <label htmlFor="longitude" style={labelStyle}>Longitude:</label>
            <input
              type="number"
              step="any"
              id="longitude"
              name="coordonnees.longitude"
              value={formData.localisation?.coordonnees?.longitude || 0}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {formData.pfp && (
            <div style={{ marginBottom: '1rem' }}>
              <img
                src={`${apiBase}/public/${formData.pfp}`}
                alt="Photo de profil"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid #ccc',
                }}
                onError={e => (e.currentTarget.src = `${apiBase}/public/images/default-pfp-client.jpg`)}
              />
            </div>
          )}
          <label style={{ fontSize: '0.9rem' }}>
            Modifier la photo de profil :
          </label>
          <input
            name="pfp"
            type="file"
            accept="image/*"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setPfpFile(e.target.files[0]);
              }
            }}
          />

          <button type="submit" style={submitButton}>
            Enregistrer les modifications
          </button>
        </form>
      </main>
    </>
  );
}

const formGroup = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#374151',
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem',
};

const submitButton = {
  padding: '0.75rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
  ':hover': {
    backgroundColor: '#2563eb',
  },
};
