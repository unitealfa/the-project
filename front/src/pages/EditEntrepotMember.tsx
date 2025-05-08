import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { apiFetch } from '@/utils/api';
import { JOB_TITLES, JobTitle } from '@/constants/team';

interface Member {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  num: string;
  role: JobTitle;
  poste?: string;
}

export default function EditEntrepotMember() {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const nav = useNavigate();
  const [f, setF] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/teams/members/${memberId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        setF(await res.json());
      } catch (err: any) {
        setError(err.message || 'Erreur');
      }
    })();
  }, [memberId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f) return;
    setSaving(true);
    try {
      await apiFetch(`/teams/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(f),
      });
      nav(-1);
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <><Header /><p style={{ color: 'red', padding: '1rem' }}>{error}</p></>;
  if (!f) return <><Header /><p style={{ padding: '1rem' }}>Chargement…</p></>;

  return (
    <>
      <Header />
      <form onSubmit={submit} style={{
        maxWidth: 480, margin: '2rem auto',
        display: 'flex', flexDirection: 'column', gap: '.8rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Éditer membre Entrepôt</h1>
        <input placeholder="Nom" value={f.nom} onChange={e => setF({ ...f, nom: e.target.value })} required />
        <input placeholder="Prénom" value={f.prenom} onChange={e => setF({ ...f, prenom: e.target.value })} required />
        <input type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <input placeholder="Téléphone" value={f.num} onChange={e => setF({ ...f, num: e.target.value })} required />
        <select value={f.role} onChange={e => setF({ ...f, role: e.target.value as JobTitle })} required>
          {JOB_TITLES['Entrepôt'].map((jt: string) => (
            <option key={jt} value={jt}>{jt}</option>
          ))}
        </select>
        <button type="submit" disabled={saving} style={{ padding: '.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8 }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </>
  );
}