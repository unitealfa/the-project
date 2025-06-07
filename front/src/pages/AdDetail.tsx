import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Ad {
  _id: string;
  company: { _id: string; nom_company: string } | string;
  filePath: string;
  type: 'image' | 'video';
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdDetail() {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (id) {
      apiFetch(`/ads/${id}`)
        .then(r => r.json())
        .then(setAd)
        .catch(() => setAd(null));
    }
  }, [id]);

  if (!ad) return <p>Chargement…</p>;

  const companyName =
    typeof ad.company === 'object'
      ? ad.company.nom_company
      : ad.company;

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Détail de la pub</h1>
        <p><strong>ID:</strong> {ad._id}</p>
        <p><strong>Entreprise:</strong> {companyName}</p>
        <p><strong>Type:</strong> {ad.type}</p>
        <p><strong>Durée (s):</strong> {ad.duration ?? 'n/a'}</p>
        <p><strong>Créée le:</strong> {new Date(ad.createdAt).toLocaleString()}</p>
        {ad.type === 'image' ? (
          <img src={`${baseUrl}/${ad.filePath}`} alt="" style={{ maxWidth: 300 }} />
        ) : (
          <video src={`${baseUrl}/${ad.filePath}`} controls style={{ maxWidth: 300 }} />
        )}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => navigate(`/ads/edit/${ad._id}`)}>Modifier</button>{' '}
          <button onClick={() => navigate(-1)}>Retour</button>
        </div>
      </div>
    </>
  );
}
