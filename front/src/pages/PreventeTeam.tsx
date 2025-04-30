import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header   from '../components/Header';
import { apiFetch } from '../utils/api';

interface Member {
  _id:string; nom:string; prenom:string; fonction?:string;
}

export default function PreventeTeam() {
  const { depotId = '' } = useParams<{ depotId:string }>();
  const location         = useLocation();
  const nav              = useNavigate();

  const [list,setList]   = useState<Member[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  /* chargement //////////////////////////////////////////////////// */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await apiFetch(`/teams/${depotId}?role=prevente`);
        const data = await r.json();         // { prevente:[...] }
        setList(data.prevente);
      } catch { setError('Impossible de charger l’équipe'); }
      finally { setLoading(false); }
    };
    load();
  }, [depotId, location.key]);

  /* UI //////////////////////////////////////////////////////////// */
  return (
    <>
      <Header/>
      <div style={{padding:'1rem',fontFamily:'Arial, sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 style={{margin:0}}>Équipe Pré-vente</h1>
          <button
            onClick={()=>nav(`/teams/${depotId}/prevente/add`)}
            style={{padding:'.5rem 1rem',background:'#4f46e5',color:'#fff',
                    border:'none',borderRadius:8,cursor:'pointer'}}>
            + Ajouter un membre
          </button>
        </div>

        {error && <p style={{color:'red'}}>{error}</p>}
        {loading && <p>Chargement…</p>}

        {!loading && (
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:'1rem'}}>
            <thead>
              <tr>{['Nom','Prénom','Fonction'].map(h=>(
                <th key={h} style={{padding:'.5rem',borderBottom:'1px solid #ccc',textAlign:'left'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {list.map(m=>(
                <tr key={m._id}>
                  <td style={{padding:'.5rem 0'}}>{m.nom}</td>
                  <td style={{padding:'.5rem 0'}}>{m.prenom}</td>
                  <td style={{padding:'.5rem 0'}}>{m.fonction ?? '—'}</td>
                </tr>
              ))}
              {list.length===0 && (
                <tr>
                  <td colSpan={3} style={{padding:'.75rem',fontStyle:'italic'}}>Aucun membre</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
