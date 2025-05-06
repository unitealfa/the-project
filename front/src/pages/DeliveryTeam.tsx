import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header    from '../components/Header';
import { apiFetch } from '../utils/api';

interface Member { _id: string; nom: string; prenom: string; role: string }
interface Depot  { _id: string; nom_depot: string }

export default function DeliveryTeam() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role: string };

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [dRes, tRes] = await Promise.all([
          apiFetch(`/depots/${depotId}`),
          apiFetch(`/teams/${depotId}?role=livraison`),
        ]);
        if (cancel) return;
        setDepot(await dRes.json());
        const payload = await tRes.json();
        setMembers(Array.isArray(payload) ? payload : payload.livraison ?? []);
      } catch {
        if (!cancel) setError('Impossible de charger');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [depotId, loc.key]);

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ margin:0 }}>
            Équipe Livraison {depot ? `du dépôt « ${depot.nom_depot} »` : ''}
          </h1>
          {user.role === 'responsable depot' && (
            <button onClick={() => nav(`/teams/${depotId}/livraison/add`)}
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
                {['Nom','Prénom','Rôle'].map(h => (
                  <th key={h} style={{ padding:'.5rem', borderBottom:'1px solid #ccc', textAlign:'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m._id}>
                  <td style={{ padding:'.5rem 0' }}>{m.nom}</td>
                  <td style={{ padding:'.5rem 0' }}>{m.prenom}</td>
                  <td style={{ padding:'.5rem 0' }}>{m.role}</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={3} style={{ padding:'.75rem', fontStyle:'italic' }}>Aucun membre</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
