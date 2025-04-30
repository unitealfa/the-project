import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header  from '../components/Header';
import { apiFetch } from '../utils/api';

export default function AddPrevente() {
  const { depotId = '' } = useParams<{ depotId:string }>();
  const nav               = useNavigate();

  const [f,setF] = useState({
    nom:'', prenom:'', email:'', num:'', password:'',
    fonction:'Pré-vendeur',
  });
  const [saving,setSaving] = useState(false);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/teams/${depotId}/members`,{
        method:'POST',
        body:JSON.stringify({
          role     :'prevente',    // ← catégorie
          fonction :f.fonction,
          nom      :f.nom,
          prenom   :f.prenom,
          email    :f.email,
          num      :f.num,
          password :f.password,
        }),
      });
      nav(`/teams/${depotId}/prevente`,{replace:true});
    } catch(err:any) {
      alert(err.message || 'Erreur de création');
    } finally { setSaving(false); }
  };

  return (
    <>
      <Header/>
      <form onSubmit={submit} style={{maxWidth:480,margin:'2rem auto',
            display:'flex',flexDirection:'column',gap:'.8rem'}}>
        <h1>Nouveau membre – Pré-vente</h1>

        <input placeholder='Nom'  value={f.nom}
               onChange={e=>setF({...f,nom:e.target.value})} required/>
        <input placeholder='Prénom' value={f.prenom}
               onChange={e=>setF({...f,prenom:e.target.value})} required/>
        <input type='email' placeholder='Email' value={f.email}
               onChange={e=>setF({...f,email:e.target.value})} required/>
        <input placeholder='Téléphone' value={f.num}
               onChange={e=>setF({...f,num:e.target.value})} required/>
        <input type='password' placeholder='Mot de passe' value={f.password}
               onChange={e=>setF({...f,password:e.target.value})} required/>

        <select value={f.fonction} onChange={e=>setF({...f,fonction:e.target.value})}>
          <option value='Pré-vendeur'>Pré-vendeur</option>
          <option value='Superviseur des ventes'>Superviseur des ventes</option>
        </select>

        <button type='submit' disabled={saving}
                style={{padding:'.6rem 1.4rem',background:'#4f46e5',color:'#fff',
                        border:'none',borderRadius:8}}>
          {saving?'Création…':'Créer le compte'}
        </button>
      </form>
    </>
  );
}
