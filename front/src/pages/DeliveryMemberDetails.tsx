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
        const res = await apiFetch(`/api/teams/members/${memberId}`);
        if (!res.ok) throw new Error('Impossible de charger le membre');
        setMember(await res.json());
      } catch (err: any) {
        setError(err.message || 'Impossible de charger le membre');
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif', maxWidth: 480, margin: '2rem auto' }}>
        <button
          onClick={() => nav(-1)}
          style={{
            marginBottom: 16,
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ← Retour
        </button>

        <h1>Détails du membre</h1>

        {loading ? (
          <p>Chargement…</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : member ? (
          <>
            {/* Si `member.pfp` existe, on l'affiche */}
            {member.pfp && (
              <div style={{ marginBottom: '1rem' }}>
                <img
                  src={`${import.meta.env.VITE_API_URL}/${member.pfp}`}
                  alt={`Profil de ${member.nom} ${member.prenom}`}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ccc',
                  }}
                />
              </div>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><b>Nom :</b> {member.nom}</li>
              <li><b>Prénom :</b> {member.prenom}</li>
              <li><b>Email :</b> {member.email}</li>
              <li><b>Numéro :</b> {member.num}</li>
              <li><b>Rôle :</b> {member.role}</li>
              {member.poste && <li><b>Poste :</b> {member.poste}</li>}
            </ul>

            <button
              onClick={() => nav(`/teams/members/${memberId}/edit`)}
              style={{
                marginTop: 16,
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Modifier ce membre
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}
