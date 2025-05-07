import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import Header                        from '@/components/Header';
import { apiFetch }                  from '@/utils/api';

interface Member {
  _id:    string;
  nom:    string;
  prenom: string;
  role:   string;
}
interface Depot {
  _id:       string;
  nom_depot: string;
}
interface UserLocal {
  role:  string;
  depot: string | null;
}

export default function EntrepotTeam() {
  const nav = useNavigate();
  const loc = useLocation();

  const stored = localStorage.getItem('user') || '{}';
  const user: UserLocal = JSON.parse(stored);

  const [depot,   setDepot]   = useState<Depot | null>(null);
  const [list,    setList]    = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user.depot) {
      setError('Aucun dépôt assigné');
      setLoading(false);
      return;
    }

    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        // Charge le dépôt
        const dRes = await apiFetch(`/depots/${user.depot}`);
        // Charge TOUTE l'équipe du responsable
        const tRes = await apiFetch('/teams/mine');

        if (cancel) return;

        const dJson = await dRes.json();
        setDepot(dJson);

        const tJson = await tRes.json();
        // On ne garde que la catégorie “entrepot”
        setList(tJson.entrepot ?? []);
      } catch {
        if (!cancel) setError('Impossible de charger');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [loc.key, user.depot]);

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ margin:0 }}>
            Équipe Entrepôt {depot ? `du dépôt « ${depot.nom_depot} »` : ''}
          </h1>
          {user.role === 'responsable depot' && user.depot && (
            <button
              onClick={() => nav(`/teams/${user.depot}/entrepot/add`)}
              style={{
                padding:'.5rem 1rem',
                background:'#4f46e5',
                color:'#fff',
                border:'none',
                borderRadius:8,
              }}
            >
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
                  <th
                    key={h}
                    style={{ padding:'.5rem', borderBottom:'1px solid #ccc', textAlign:'left' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map(m => (
                  <tr key={m._id}>
                    <td style={{ padding:'.5rem 0' }}>{m.nom}</td>
                    <td style={{ padding:'.5rem 0' }}>{m.prenom}</td>
                    <td style={{ padding:'.5rem 0' }}>{m.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding:'.75rem', fontStyle:'italic' }}>
                    Aucun membre
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
