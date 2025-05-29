import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { apiFetch } from '@/utils/api';

interface Member {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  num: string;
  role: string;
  poste?: string;
}

export default function DetailEntrepotMember() {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const nav = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/teams/members/${memberId}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        setMember(await res.json());
      } catch (err: any) {
        setError(err.message || 'Erreur');
      }
    })();
  }, [memberId]);

  if (error) return <><Header /><p style={{ color: 'red', padding: '1rem' }}>{error}</p></>;
  if (!member) return <><Header /><p style={{ padding: '1rem' }}>Chargement…</p></>;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
        <h1>Détail membre Entrepôt</h1>
        <p><strong>Nom :</strong> {member.nom}</p>
        <p><strong>Prénom :</strong> {member.prenom}</p>
        <p><strong>Email :</strong> {member.email}</p>
        <p><strong>Téléphone :</strong> {member.num}</p>
        <p><strong>Rôle :</strong> {member.role}</p>
        {member.poste && <p><strong>Poste :</strong> {member.poste}</p>}
        <button onClick={() => nav(-1)} style={{ marginTop: 16 }}>Retour</button>
      </main>
    </>
  );
}