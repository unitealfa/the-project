import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';

interface Ad {
  _id: string;
  filePath: string;
  type: 'image' | 'video';
  expiresAt: string;
  duration?: number;
}

interface User {
  company?: string;
}

const SUPER_ADMIN_PHONE = '0600000000';

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;

  const raw = localStorage.getItem('user');
  const user: User | null = raw ? JSON.parse(raw) : null;
  const companyId = user?.company;

  useEffect(() => {
    if (!companyId) return;
    apiFetch(`/ads/company/${companyId}`)
      .then(r => r.json())
      .then((list: Ad[]) => {
        const now = Date.now();
        const valid = list.filter(ad => new Date(ad.expiresAt).getTime() > now);
        setAds(valid);
        const t: Record<string, number> = {};
        valid.forEach(ad => {
          t[ad._id] = new Date(ad.expiresAt).getTime() - now;
        });
        setTimers(t);
      })
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimers(curr => {
        const next: Record<string, number> = {};
        Object.keys(curr).forEach(key => {
          next[key] = Math.max(0, curr[key] - 1000);
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const format = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Mes publicités</h1>
        {loading && <p>Chargement…</p>}
        {!loading && ads.length === 0 && (
          <p>
            Aucune publicité pour le moment. Pour afficher une pub à vos clients,
            consultez le super admin au <strong>{SUPER_ADMIN_PHONE}</strong>.
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ads.map(ad => (
            <li key={ad._id} style={{ margin: '1rem 0' }}>
              {ad.type === 'image' ? (
                <img
                  src={`${baseUrl}/${ad.filePath}`}
                  alt="pub"
                  style={{ maxWidth: 200 }}
                />
              ) : (
                <video
                  src={`${baseUrl}/${ad.filePath}`}
                  style={{ maxWidth: 200 }}
                  controls
                />
              )}
              <p>Expire dans {format(timers[ad._id] || 0)}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}