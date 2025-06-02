// front/src/pages/CompanyDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams }                   from 'react-router-dom';
import Header                          from '../components/Header';

interface Company {
  _id: string;
  nom_company: string;
  gerant_company: string;
  contact: {
    telephone: string;
    email: string;
    adresse: {
      rue: string;
      ville: string;
      code_postal: string;
      pays: string;
    };
  };
  createdAt?: string;
  pfp: string; // ← added property
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError]     = useState('');
  const token                  = localStorage.getItem('token') || '';
  const apiBase                = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(r => {
      if (!r.ok) throw new Error(`Erreur ${r.status}`);
      return r.json();
    })
    .then((c: Company) => setCompany(c))
    .catch(err => setError(err.message));
  }, [apiBase, id, token]);

  if (error) {
    return (
      <>
        <Header/>
        <div style={{ padding:16, color:'red' }}>{error}</div>
      </>
    );
  }
  if (!company) {
    return (
      <>
        <Header/>
        <p style={{ padding:16 }}>Chargement…</p>
      </>
    );
  }

  return (
    <>
      <Header/>
      <div style={{ padding:16, fontFamily:'Arial, sans-serif' }}>
        <h1>Détails de l’entreprise</h1>
        <p><strong>Nom :</strong> {company.nom_company}</p>
        <p><strong>Gérant :</strong> {company.gerant_company}</p>
        <div style={{ marginBottom: 16 }}>
          <img
            src={`${apiBase}/${company.pfp}`}
            alt="Photo de profil de l’entreprise"
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid #ccc',
            }}
          />
        </div>
        <fieldset style={{ marginTop:16 }}>
          <legend>Contact</legend>
          <p><strong>Téléphone :</strong> {company.contact.telephone}</p>
          <p><strong>Email :</strong> {company.contact.email}</p>
        </fieldset>
        <fieldset style={{ marginTop:16 }}>
          <legend>Adresse</legend>
          <p>
            {company.contact.adresse.rue}, {company.contact.adresse.ville}
          </p>
          <p>
            {company.contact.adresse.code_postal} – {company.contact.adresse.pays}
          </p>
        </fieldset>
        {company.createdAt && (
          <p style={{ marginTop:16 }}>
            <em>Créée le {new Date(company.createdAt).toLocaleDateString()}</em>
          </p>
        )}
      </div>
    </>
  );
}
