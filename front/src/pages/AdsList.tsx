import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Ad {
  _id: string;
  company: { _id: string; nom_company: string } | string | null;
  filePath: string;
  type: 'image' | 'video';
  duration?: number;
  createdAt: string;
  expiresAt: string;
}

const baseUrl = import.meta.env.VITE_API_URL; // e.g., "http://localhost:5000"

export default function AdsList() {
  const [ads, setAds] = useState<Ad[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/ads')
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(err => {
        console.error(err);
        setAds([]);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette publicité ?')) return;
    await apiFetch(`/ads/${id}`, { method: 'DELETE' });
    setAds(curr => curr.filter(a => a._id !== id));
  };

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Publicités</h1>
          <Link to="/ads/add" className="btn-primary">
            ➕ Nouvelle pub
          </Link>
        </div>
        {ads.length === 0 && <p>Aucune publicité.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ads.map(ad => {
            // Safe company name extraction
            let companyName: string;
            if (ad.company && typeof ad.company === 'object') {
              companyName = ad.company.nom_company ?? 'Inconnue';
            } else if (typeof ad.company === 'string') {
              companyName = ad.company;
            } else {
              companyName = 'Inconnue';
            }

            const now = new Date();
            const expires = new Date(ad.expiresAt);
            const status = expires > now ? 'En cours' : 'Expirée';

            return (
              <li key={ad._id} style={{ margin: '1rem 0' }}>
                <p>
                  <strong>Entreprise :</strong> {companyName}
                </p>
                <p>
                  <strong>Statut :</strong> {status}
                </p>

                {ad.type === 'image' ? (
                  <img
                    src={`${baseUrl}/${ad.filePath}`}
                    alt="pub"
                    style={{ maxWidth: '200px' }}
                  />
                ) : (
                  <video
                    src={`${baseUrl}/${ad.filePath}`}
                    controls
                    style={{ maxWidth: '200px' }}
                  />
                )}

                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => navigate(`/ads/${ad._id}`)}>Voir</button>{' '}
                  <button onClick={() => navigate(`/ads/edit/${ad._id}`)}>Modifier</button>{' '}
                  <button onClick={() => handleDelete(ad._id)}>Supprimer</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}