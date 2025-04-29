// front/src/pages/CreateCompany.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Adresse {
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface Contact {
  telephone: string;
  email: string;
  adresse: Adresse;
}

interface CompanyData {
  nom_company: string;
  gerant_company: string;
  contact: Contact;
}

interface AdminData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  num: string;
}

export default function CreateCompany() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  const [companyData, setCompanyData] = useState<CompanyData>({
    nom_company: '',
    gerant_company: '',
    contact: {
      telephone: '',
      email: '',
      adresse: { rue: '', ville: '', code_postal: '', pays: '' },
    },
  });
  const [adminData, setAdminData] = useState<AdminData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    num: '',
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyData, adminData }),
      });

      if (res.status === 401) {
        throw new Error('Non autorisé – vérifiez votre authentification');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur création');
      }

      navigate('/dashboard/super');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Créer une nouvelle entreprise</h2>

        <fieldset>
          <legend>Info Société</legend>
          <div>
            <label>Nom :</label>
            <input
              name="nom_company"
              value={companyData.nom_company}
              onChange={e =>
                setCompanyData({ ...companyData, nom_company: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Gérant :</label>
            <input
              name="gerant_company"
              value={companyData.gerant_company}
              onChange={e =>
                setCompanyData({ ...companyData, gerant_company: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Téléphone :</label>
            <input
              name="telephone"
              value={companyData.contact.telephone}
              onChange={e =>
                setCompanyData({
                  ...companyData,
                  contact: {
                    ...companyData.contact,
                    telephone: e.target.value,
                  },
                })
              }
              required
            />
          </div>
          <div>
            <label>Email Société :</label>
            <input
              type="email"
              name="email"
              value={companyData.contact.email}
              onChange={e =>
                setCompanyData({
                  ...companyData,
                  contact: { ...companyData.contact, email: e.target.value },
                })
              }
              required
            />
          </div>

          <fieldset style={{ marginTop: '1rem' }}>
            <legend>Adresse</legend>
            <div>
              <label>Rue :</label>
              <input
                name="rue"
                value={companyData.contact.adresse.rue}
                onChange={e =>
                  setCompanyData({
                    ...companyData,
                    contact: {
                      ...companyData.contact,
                      adresse: {
                        ...companyData.contact.adresse,
                        rue: e.target.value,
                      },
                    },
                  })
                }
                required
              />
            </div>
            <div>
              <label>Ville :</label>
              <input
                name="ville"
                value={companyData.contact.adresse.ville}
                onChange={e =>
                  setCompanyData({
                    ...companyData,
                    contact: {
                      ...companyData.contact,
                      adresse: {
                        ...companyData.contact.adresse,
                        ville: e.target.value,
                      },
                    },
                  })
                }
                required
              />
            </div>
            <div>
              <label>Code postal :</label>
              <input
                name="code_postal"
                value={companyData.contact.adresse.code_postal}
                onChange={e =>
                  setCompanyData({
                    ...companyData,
                    contact: {
                      ...companyData.contact,
                      adresse: {
                        ...companyData.contact.adresse,
                        code_postal: e.target.value,
                      },
                    },
                  })
                }
                required
              />
            </div>
            <div>
              <label>Pays :</label>
              <input
                name="pays"
                value={companyData.contact.adresse.pays}
                onChange={e =>
                  setCompanyData({
                    ...companyData,
                    contact: {
                      ...companyData.contact,
                      adresse: {
                        ...companyData.contact.adresse,
                        pays: e.target.value,
                      },
                    },
                  })
                }
                required
              />
            </div>
          </fieldset>
        </fieldset>

        <fieldset style={{ marginTop: '2rem' }}>
          <legend>Compte Admin</legend>
          <div>
            <label>Nom :</label>
            <input
              name="nom"
              value={adminData.nom}
              onChange={e => setAdminData({ ...adminData, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Prénom :</label>
            <input
              name="prenom"
              value={adminData.prenom}
              onChange={e =>
                setAdminData({ ...adminData, prenom: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Email :</label>
            <input
              type="email"
              name="email"
              value={adminData.email}
              onChange={e => setAdminData({ ...adminData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Mot de passe :</label>
            <input
              type="password"
              name="password"
              value={adminData.password}
              onChange={e =>
                setAdminData({ ...adminData, password: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Tél. Admin :</label>
            <input
              name="num"
              value={adminData.num}
              onChange={e => setAdminData({ ...adminData, num: e.target.value })}
              required
            />
          </div>
        </fieldset>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '1rem' }}>
          Créer l’entreprise et son Admin
        </button>
      </form>
    </>
  );
}
