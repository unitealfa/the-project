import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header    from '../components/Header';
import { apiFetch } from '../utils/api';

interface Member { _id: string; nom: string; prenom: string; role: string }

export default function PreventeTeam() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const [list, setList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role: string };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch(`/teams/${depotId}?role=prevente`);
        const data = await r.json();
        setList(Array.isArray(data.prevente) ? data.prevente : data.prevente ?? []);
      } catch {
        setError('Impossible de charger');
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, loc.key]);

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try {
      await apiFetch(`/teams/members/${memberId}`, { method: 'DELETE' });
      setList(list => list.filter(m => m._id !== memberId));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ margin:0 }}>Équipe Pré-vente</h1>
          {user.role === 'responsable depot' && (
            <button onClick={() => nav(`/teams/${depotId}/prevente/add`)}
                    style={{ padding:'.5rem 1rem', background:'#4f46e5', color:'#fff', border:'none', borderRadius:8 }}>
              + Ajouter un membre
            </button>
          )}
        </div>
        {error && <p style={{ color:'red' }}>{error}</p>}
        {loading ? (
          <p>Chargement…</p>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'1rem' }}>
            <thead>
              <tr>
                {['Nom','Prénom','Rôle','Actions'].map(h => (
                  <th key={h} style={{ padding:'.5rem', borderBottom:'1px solid #ccc', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m._id}>
                  <td style={{ padding:'.5rem 0' }}>{m.nom}</td>
                  <td style={{ padding:'.5rem 0' }}>{m.prenom}</td>
                  <td style={{ padding:'.5rem 0' }}>{m.role}</td>
                  <td>
                    <button
                      style={{ marginRight:8 }}
                      onClick={() => nav(`/teams/members/${m._id}/detail-prevente`)}
                    >
                      Détails
                    </button>
                    <button
                      style={{ marginRight:8 }}
                      onClick={() => nav(`/teams/members/${m._id}/edit-prevente`)}
                    >
                      Éditer
                    </button>
                    <button
                      style={{ color:'#fff', background:'#dc2626', border:'none', borderRadius:4, padding:'0.25rem 0.75rem' }}
                      onClick={() => handleDelete(m._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={4} style={{ padding:'.75rem', fontStyle:'italic' }}>Aucun membre</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
