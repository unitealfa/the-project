import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header    from '../components/Header';
import { apiFetch } from '../utils/api';

export default function AddEntrepot() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav = useNavigate();
  const [f, setF] = useState({ nom: '', prenom: '', email: '', num: '', password: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/teams/${depotId}/members`, {
        method: 'POST',
        body: JSON.stringify({ ...f, role: 'entrepot' }),
      });
      nav(`/teams/${depotId}/entrepot`, { replace: true });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={submit} style={{ maxWidth: 480, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <h1>Ajouter membre – Entrepôt</h1>
        <input placeholder='Nom' value={f.nom} onChange={e => setF({ ...f, nom: e.target.value })} required />
        <input placeholder='Prénom' value={f.prenom} onChange={e => setF({ ...f, prenom: e.target.value })} required />
        <input type='email' placeholder='Email' value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <input placeholder='Téléphone' value={f.num} onChange={e => setF({ ...f, num: e.target.value })} required />
        <input type='password' placeholder='Mot de passe' value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required />
        <button type='submit' disabled={saving} style={{ padding: '.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8 }}>
          {saving ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </>
  );
}
