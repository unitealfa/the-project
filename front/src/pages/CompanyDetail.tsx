// front/src/pages/CompanyDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
            onClick={() => navigate('/companies')}
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
            ← Retour à la liste
          </button>

          <h1 style={{
            color: '#1a1a1a',
            fontSize: '2rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #1a1a1a',
            paddingBottom: '0.5rem'
          }}>Détails de l'entreprise</h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <img
              src={`${apiBase}/${company.pfp}`}
              alt="Photo de profil de l'entreprise"
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
              }}>{company.nom_company}</p>
              <p style={{
                color: '#666',
                fontSize: '1.1rem'
              }}><strong>Gérant :</strong> {company.gerant_company}</p>
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
              }}>Contact</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Téléphone :</strong><br/>
                <span style={{ color: '#666' }}>{company.contact.telephone}</span>
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Email :</strong><br/>
                <span style={{ color: '#666' }}>{company.contact.email}</span>
              </p>
            </fieldset>

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
              }}>Adresse</legend>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Rue :</strong><br/>
                <span style={{ color: '#666' }}>{company.contact.adresse.rue}</span>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#1a1a1a' }}>Ville :</strong><br/>
                <span style={{ color: '#666' }}>{company.contact.adresse.ville}</span>
              </p>
              <p>
                <strong style={{ color: '#1a1a1a' }}>Code postal :</strong><br/>
                <span style={{ color: '#666' }}>{company.contact.adresse.code_postal} – {company.contact.adresse.pays}</span>
              </p>
            </fieldset>
          </div>

          {company.createdAt && (
            <p style={{
              marginTop: '2rem',
              color: '#666',
              fontStyle: 'italic',
              textAlign: 'right',
              borderTop: '1px solid #e0e0e0',
              paddingTop: '1rem'
            }}>
              Créée le {new Date(company.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
