import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Company { _id: string; nom_company: string; }
interface Ad {
  _id: string;
  company: string;
  type: 'image' | 'video';
  duration?: number;
  filePath: string;
  expiresAt: string; // Add expiresAt property
}

export default function EditAd() {
  const { id } = useParams<{ id: string }>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState<number | undefined>(5); // Default duration for images
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const navigate = useNavigate();

  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    apiFetch('/companies')
      .then(r => r.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/ads/${id}`)
      .then(r => r.json())
      .then((ad: Ad) => {
        setCompany(ad.company);
        setType(ad.type);
        setDuration(ad.duration ?? (ad.type === 'image' ? 5 : undefined)); // Handle duration for existing ads
      })
      .catch(console.error);
  }, [id]);

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
    if (!id) return;

    const fd = new FormData();
    if (file) fd.append('file', file);
    fd.append('company', company);
    fd.append('type', type);
    fd.append('duration', duration?.toString() ?? ''); // Always send duration
    fd.append('expiresAt', expiresAt);

    const res = await apiFetch(`/ads/${id}`, {
      method: 'PATCH',
      body: fd,
    });

    if (res.ok) navigate(`/ads/${id}`);
    else alert('Erreur lors de la mise à jour');
  };

  return (
    <>
      <Header />
      <form onSubmit={submit} style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Modifier la publicité</h1>
        <label>
          Entreprise:
          <select value={company} onChange={e => setCompany(e.target.value)} required>
            <option value="">-- Choisir --</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.nom_company}</option>
            ))}
          </select>
        </label>
        <br/>
        <label>
          Type:
          <select value={type} onChange={e => setType(e.target.value as any)}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <br/>
        <label>
          Nouveau fichier (optionnel):
          <input
            type="file"
            accept="image/*,video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <br/>
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
        <br/>
        <button type="submit">Enregistrer</button>{' '}
        <button type="button" onClick={() => navigate(-1)}>Annuler</button>
      </form>
    </>
  );
}
