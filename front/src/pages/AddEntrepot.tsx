import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header   from '../components/Header';
import { apiFetch } from '../utils/api';

export default function AddEntrepot () {
  const { depotId = '' } = useParams<{ depotId:string }>();
  const nav   = useNavigate();

  const [f,setF] = useState({
    nom:'', prenom:'', email:'', num:'', password:'',
    fonction:'Gestionnaire de stock',                     // valeur par défaut
  });
  const [saving,setSaving] = useState(false);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await apiFetch(`/teams/${depotId}/members`,{
        method:'POST',
        body:JSON.stringify({
          role     :'entrepot',            // <-- catégorie
          fonction : f.fonction,           // ex. “Contrôleur”
          nom      : f.nom,
          prenom   : f.prenom,
          email    : f.email,
          num      : f.num,
          password : f.password,
        }),
      });
      if(!r.ok){
        const err = await r.json();
        throw new Error(err.message || r.status);
      }
      nav(`/teams/${depotId}/entrepot`,{ replace:true });
    } catch(e:any){ alert(e.message); }
    finally       { setSaving(false); }
  };

  return (
    <>
      <Header/>
      <form onSubmit={submit}
            style={{maxWidth:480,margin:'2rem auto',display:'flex',flexDirection:'column',gap:'.8rem'}}>
        <h1>Ajouter membre – Entrepôt</h1>

        <input placeholder='Nom' value={f.nom} onChange={e=>setF({...f,nom:e.target.value})} required/>
        <input placeholder='Prénom' value={f.prenom} onChange={e=>setF({...f,prenom:e.target.value})} required/>
        <input type='email' placeholder='Email' value={f.email} onChange={e=>setF({...f,email:e.target.value})} required/>
        <input placeholder='Téléphone' value={f.num} onChange={e=>setF({...f,num:e.target.value})} required/>
        <input type='password' placeholder='Mot de passe' value={f.password} onChange={e=>setF({...f,password:e.target.value})} required/>

        <select value={f.fonction} onChange={e=>setF({...f,fonction:e.target.value})}>
          <option value='Gestionnaire de stock'>Gestionnaire de stock</option>
          <option value='Contrôleur'>Contrôleur</option>
          <option value='Manutentionnaire'>Manutentionnaire</option>
        </select>

        <button type='submit' disabled={saving}
                style={{padding:'.6rem 1.4rem',background:'#4f46e5',color:'#fff',
                        border:'none',borderRadius:8}}>
          {saving ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </>
  );
}
