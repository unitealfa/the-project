// 📁 src/pages/AddClient.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function AddClient() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const apiBase = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    nom_client: '',
    email: '',
    password: '',
    contact: {
      nom_gerant: '',
      telephone: '',
    },
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

  const [suggestedClient, setSuggestedClient] = useState<any>(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const [verifDone, setVerifDone] = useState(false);

  const clientDejaAffecte = (client: any) => {
    return client.affectations?.some(
      (a: any) => a.depot === user?.depot
    );
  };

  const checkExistingClient = async () => {
    setVerifDone(true);
    setSuggestedClient(null);
    try {
      const res = await fetch(
        `${apiBase}/clients/check?email=${encodeURIComponent(form.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        setShowFullForm(true);
        return;
      }
      const data = await res.json();
      if (data?.nom_client === form.nom_client) {
        setSuggestedClient(data);
      } else {
        setShowFullForm(true);
      }
    } catch {
      setShowFullForm(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, contact: { ...f.contact, [key]: value } }));
    } else if (name.startsWith('localisation.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, localisation: { ...f.localisation, [key]: value } }));
    } else if (name.startsWith('coordonnees.')) {
      const key = name.split('.')[1];
      setForm(f => ({
        ...f,
        localisation: {
          ...f.localisation,
          coordonnees: {
            ...f.localisation.coordonnees,
            [key]: parseFloat(value),
          },
        },
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        affectations: [
          { entreprise: user.entreprise, depot: user.depot }
        ],
      };
      const res = await fetch(`${apiBase}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err.message || err).toString());
      }
      navigate('/clients');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAffecterClient = async () => {
    if (clientDejaAffecte(suggestedClient)) {
      alert('⚠️ Ce client est déjà affecté à votre dépôt.');
      return;
    }
    const res = await fetch(
      `${apiBase}/clients/${suggestedClient._id}/affectation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entreprise: user.company,
          depot: user.depot,
        }),
      }
    );
    if (res.ok) {
      navigate('/clients');
    } else {
      const err = await res.json();
      alert(err.message || "Erreur lors de l'affectation.");
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>➕ Ajouter un client</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}
        >
          <input
            name="nom_client"
            placeholder="Nom client (magasin)"
            required
            onChange={handleChange}
            value={form.nom_client}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            onChange={handleChange}
            value={form.email}
          />
          {!showFullForm && (
            <button
              type="button"
              onClick={checkExistingClient}
              style={{
                padding: '0.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🔍 Vérifier
            </button>
          )}
          {verifDone && suggestedClient && (
            <div
              style={{
                border: '1px solid gray',
                padding: '1rem',
                background: '#f9fafb',
              }}
            >
              <h3>Client déjà existant</h3>
              <p><b>Nom:</b> {suggestedClient.nom_client}</p>
              <p><b>Email:</b> {suggestedClient.email}</p>
              <p><b>Nom gérant:</b> {suggestedClient.contact.nom_gerant}</p>
              <p><b>Téléphone:</b> {suggestedClient.contact.telephone}</p>
              <p><b>Adresse:</b> {suggestedClient.localisation.adresse}</p>
              <p><b>Région:</b> {suggestedClient.localisation.region}</p>
              <p>
                <b>Coordonnées:</b>{' '}
                {suggestedClient.localisation.coordonnees.latitude},{' '}
                {suggestedClient.localisation.coordonnees.longitude}
              </p>
              {clientDejaAffecte(suggestedClient) ? (
                <p style={{ color: 'red', marginTop: '1rem' }}>
                  ⚠️ Client déjà affecté à votre dépôt.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleAffecterClient}
                  style={{
                    marginTop: '1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem',
                    border: 'none',
                  }}
                >
                  ➕ Affecter à mon dépôt
                </button>
              )}
            </div>
          )}
          {verifDone && !suggestedClient && showFullForm && (
            <>
              <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                required
                onChange={handleChange}
              />
              <input
                name="contact.nom_gerant"
                placeholder="Nom gérant"
                required
                onChange={handleChange}
              />
              <input
                name="contact.telephone"
                placeholder="Téléphone"
                required
                onChange={handleChange}
              />
              <input
                name="localisation.adresse"
                placeholder="Adresse"
                required
                onChange={handleChange}
              />
              <input
                name="localisation.ville"
                placeholder="Ville"
                required
                onChange={handleChange}
              />
              <input
                name="localisation.code_postal"
                placeholder="Code postal"
                required
                onChange={handleChange}
              />
              <input
                name="localisation.region"
                placeholder="Région"
                required
                onChange={handleChange}
              />
              <input
                name="coordonnees.latitude"
                type="number"
                step="any"
                placeholder="Latitude"
                required
                onChange={handleChange}
              />
              <input
                name="coordonnees.longitude"
                type="number"
                step="any"
                placeholder="Longitude"
                required
                onChange={handleChange}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Enregistrer
              </button>
            </>
          )}
        </form>
      </main>
    </>
  );
}
