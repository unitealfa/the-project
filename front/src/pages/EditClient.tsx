import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`${apiBase}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const client = data.find((c: any) => c._id === id);
        if (!client) throw new Error('Client introuvable');
        setForm(client);
      })
      .catch(err => alert(err.message));
  }, [id, apiBase, token]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const key = name.split('.')[1];
      setForm({ ...form, contact: { ...form.contact, [key]: value } });
    } else if (name.startsWith('localisation.')) {
      const key = name.split('.')[1];
      setForm({ ...form, localisation: { ...form.localisation, [key]: value } });
    } else if (name.startsWith('coordonnees.')) {
      const key = name.split('.')[1];
      setForm({
        ...form,
        localisation: {
          ...form.localisation,
          coordonnees: { ...form.localisation.coordonnees, [key]: parseFloat(value) },
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // 🔥 Forcer la préservation du champ `depot`
      const body = {
        ...form,
        depot: form.depot || user?.depot, // fallback si inexistant
      };

      const res = await fetch(`${apiBase}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      navigate('/clients');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!form) return <p style={{ padding: '2rem' }}>Chargement…</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>✏️ Modifier le client</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}>
          <input name="nom_client" value={form.nom_client} onChange={handleChange} required />
          <input name="email" value={form.email} onChange={handleChange} required />
          <input name="contact.nom_gerant" value={form.contact.nom_gerant} onChange={handleChange} required />
          <input name="contact.telephone" value={form.contact.telephone} onChange={handleChange} required />
          <input name="localisation.adresse" value={form.localisation?.adresse || ''} onChange={handleChange} required />
          <input name="localisation.ville" value={form.localisation?.ville || ''} onChange={handleChange} required />
          <input name="localisation.code_postal" value={form.localisation?.code_postal || ''} onChange={handleChange} required />
          <input name="localisation.region" value={form.localisation?.region || ''} onChange={handleChange} required />
          <input name="coordonnees.latitude" type="number" step="any" value={form.localisation?.coordonnees?.latitude || 0} onChange={handleChange} required />
          <input name="coordonnees.longitude" type="number" step="any" value={form.localisation?.coordonnees?.longitude || 0} onChange={handleChange} required />
          <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none' }}>
            Enregistrer les modifications
          </button>
        </form>
      </main>
    </>
  );
}
