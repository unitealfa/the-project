// front/src/pages/CompaniesList.tsx
import React, { useEffect, useState } from 'react';
import { Link }                       from 'react-router-dom';
import Header                         from '../components/Header';

interface Company {
  _id: string;
  nom_company: string;
  admin: { nom: string; prenom: string; email: string } | null;
}

export default function CompaniesList() {
  const [list, setList]   = useState<Company[]>([]);
  const [error, setError] = useState('');
  const token             = localStorage.getItem('token') || '';
  const apiBase           = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      return res.json();
    })
    .then((data: Company[]) => setList(data))
    .catch(err => setError(err.message));
  }, [apiBase, token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette entreprise ?')) return;
    const res = await fetch(`${apiBase}/companies/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || `Erreur ${res.status}`);
    } else {
      setList(l => l.filter(c => c._id !== id));
    }
  };

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding:16, color:'red' }}>{error}</div>
      </>
    );
  }

  return (
    <>
      <Header/>
      <div style={{ padding:16, fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1>Liste des entreprises</h1>
          <Link to="/create-company" style={{
            padding:'0.5rem 1rem', backgroundColor:'#4f46e5', color:'#fff',
            borderRadius:4, textDecoration:'none'
          }}>
            ➕ Nouvelle entreprise
          </Link>
        </div>

        <table style={{ width:'100%', marginTop:16, borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th>Société</th>
              <th>Admin</th>
              <th>Email Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c._id} style={{ borderBottom:'1px solid #ddd' }}>
                <td>{c.nom_company}</td>
                <td>{c.admin ? `${c.admin.nom} ${c.admin.prenom}` : '—'}</td>
                <td>{c.admin?.email ?? '—'}</td>
                <td style={{ display:'flex', gap:8 }}>
                  <Link to={`/companies/${c._id}`} style={{ color:'#4f46e5' }}>Voir</Link>
                  <Link to={`/companies/${c._id}/edit`} style={{ color:'#4f46e5' }}>Modifier</Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    style={{ background:'none', border:'none', color:'#e53e3e', cursor:'pointer' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
