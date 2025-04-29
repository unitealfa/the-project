import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import Header                           from '../components/Header';

interface Adresse { rue: string; ville: string; code_postal: string; pays: string; }
interface Contact { telephone: string; email: string; adresse: Adresse; }
interface CompanyData { nom_company: string; gerant_company: string; contact: Contact; }

export default function CompanyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CompanyData>({
    nom_company: '', gerant_company: '',
    contact: { telephone: '', email: '', adresse: { rue: '', ville: '', code_postal: '', pays: '' } }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((c: CompanyData) => setData(c))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiBase, id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/companies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
                contact: { ...data.contact, telephone: e.target.value }
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
                contact: { ...data.contact, email: e.target.value }
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
                    adresse: { ...data.contact.adresse, rue: e.target.value }
                  }
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
                    adresse: { ...data.contact.adresse, ville: e.target.value }
                  }
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
                    adresse: { ...data.contact.adresse, code_postal: e.target.value }
                  }
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
                    adresse: { ...data.contact.adresse, pays: e.target.value }
                  }
                })
              }
              required
            />
          </div>
        </fieldset>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Enregistrer les modifications
        </button>
      </form>
    </>
  );
}
