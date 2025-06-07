import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Company { _id: string; nom_company: string; }

export default function AddAd() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState<number | undefined>(5); // Default duration for images
  const [expiresAt, setExpiresAt] = useState('');
  const navigate = useNavigate();

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    apiFetch('/companies')
      .then(res => res.json())
      .then(setCompanies)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (type === 'image') {
      setDuration(5); // Reset duration for images
    } else {
      setDuration(undefined); // Reset duration for videos
    }
  }, [type]);

  useEffect(() => {
    if (type === 'video' && file) {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setDuration(Math.ceil(video.duration)); // Automatically set duration for videos
        URL.revokeObjectURL(url);
      };
    }
  }, [type, file]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('company', company);
    fd.append('type', type);
    fd.append('duration', duration?.toString() || ''); // Always send duration
    fd.append('expiresAt', expiresAt); // Send ISO date

    const res = await fetch('http://localhost:5000/ads', {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (res.ok) navigate('/ads');
    else {
      const text = await res.text();
      alert(`Erreur (${res.status}): ${text}`);
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={submit} style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Ajouter une publicité</h1>
        <label>
          Entreprise:
          <select value={company} onChange={e => setCompany(e.target.value)} required>
            <option value="">-- Choisir --</option>
            {Array.isArray(companies) && companies.length > 0 ? (
              companies.map(c => (
                <option key={c._id} value={c._id}>{c.nom_company}</option>
              ))
            ) : (
              <option disabled>– Aucune entreprise disponible –</option>
            )}
          </select>
        </label>
        <br />
        <label>
          Type:
          <select value={type} onChange={e => setType(e.target.value as 'image' | 'video')}>
            <option value="image">Image</option>
            <option value="video">Vidéo</option>
          </select>
        </label>
        <br />
        <label>
          Fichier:
          <input
            type="file"
            accept="image/*,video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>
        <br />
        {type === 'image' ? (
          <label>
            Durée d’affichage (s) :
            <select
              value={duration}
              onChange={e => setDuration(+e.target.value)}
              style={{ marginLeft: 8 }}
            >
              {[5, 15, 30].map(sec => (
                <option key={sec} value={sec}>{sec} s</option>
              ))}
            </select>
          </label>
        ) : (
          duration === undefined ? (
            <p style={{ margin: '0.5rem 0', color: '#888' }}>
              Chargement durée de la vidéo…
            </p>
          ) : (
            <p style={{ margin: '0.5rem 0' }}>
              Durée (auto) : <strong>{duration} s</strong>
            </p>
          )
        )}
        <br />
        <label>
          Date de fin :
          <input
            type="date"
            value={expiresAt}
            min={minDate}
            onChange={e => setExpiresAt(e.target.value)}
            required
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Enregistrer
        </button>
      </form>
    </>
  );
}