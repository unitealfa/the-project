import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

export default function MemberDetails() {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const nav = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/teams/members/${memberId}`);
        setMember(await res.json());
      } catch {
        setError('Impossible de charger le membre');
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <button onClick={() => nav(-1)} style={{ marginBottom:16 }}>Retour</button>
        <h1>Détails du membre</h1>
        {loading ? <p>Chargement…</p> :
          error ? <p style={{ color:'red' }}>{error}</p> :
          member && (
            <ul>
              <li><b>Nom :</b> {member.nom}</li>
              <li><b>Prénom :</b> {member.prenom}</li>
              <li><b>Email :</b> {member.email}</li>
              <li><b>Numéro :</b> {member.num}</li>
              <li><b>Rôle :</b> {member.role}</li>
              <li><b>Poste :</b> {member.poste}</li>
            </ul>
          )
        }
        <button onClick={() => nav(`/teams/members/${memberId}/edit`)} style={{ marginTop:16 }}>
          Modifier ce membre
        </button>
      </div>
    </>
  );
}