import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { apiFetch } from '@/utils/api';

interface Member {
  _id:    string;
  nom:    string;
  prenom: string;
  email:  string;
  num:    string;
  role:   string;
  poste?: string;
  pfp:    string; // ← nouveau champ
}

export default function DetailPreventeMember() {
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

  if (error) {
    return (
      <>
        <Header />
        <p style={{ color: 'red', padding: '1rem' }}>{error}</p>
      </>
    );
  }
  if (!member) {
    return (
      <>
        <Header />
        <p style={{ padding: '1rem' }}>Chargement…</p>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
          <button
            onClick={() => nav(-1)}
            style={{
              marginBottom: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem'
            }}
          >
            ← Retour
          </button>

          <h1 style={{
            color: '#1a1a1a',
            fontSize: '2rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #1a1a1a',
            paddingBottom: '0.5rem'
          }}>Détail membre Pré-vente</h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <img
              src={`${import.meta.env.VITE_API_URL}/${member.pfp}`}
              alt={`Profil de ${member.nom} ${member.prenom}`}
              style={{
                width: 150,
                height: 150,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #1a1a1a',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <div>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}>{member.nom} {member.prenom}</p>
              <p style={{
                color: '#666',
                fontSize: '1.1rem'
              }}>{member.role}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <fieldset style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fafafa'
            }}>
              <legend style={{
                padding: '0 1rem',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>Informations personnelles</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Email :</strong><br/>
                <span style={{ color: '#666' }}>{member.email}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Téléphone :</strong><br/>
                <span style={{ color: '#666' }}>{member.num}</span>
              </p>
              {member.poste && (
                <p>
                  <strong style={{ color: '#1a1a1a' }}>Poste :</strong><br/>
                  <span style={{ color: '#666' }}>{member.poste}</span>
                </p>
              )}
            </fieldset>
          </div>
        </div>
      </div>
    </>
  );
}
