import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { apiFetch } from '../utils/api';

interface Ad {
  _id: string;
  filePath: string;     // ex. "ads/ad-1749306714124.jfif"
  type: 'image' | 'video';
  duration?: number;
  expiresAt?: string; // Make expiresAt optional
}

export default function AdvertisementFrame({ companyIds }: { companyIds: string[] }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const baseUrl = import.meta.env.VITE_API_URL;  // e.g. http://localhost:5000

  // 1) Load ads for all companies
  useEffect(() => {
    Promise.all(
      companyIds.map(id =>
        apiFetch(`/ads/company/${id}`)
          .then(r => r.json())
          .catch(() => [] as Ad[])
      )
    )
      .then(lists => {
        const merged = lists.flat();
        setAds(merged);
        setIndex(0);
      })
      .catch(console.error);
  }, [companyIds]);

  // 1) Load ads for all companies
useEffect(() => {
  Promise.all(
    companyIds.map(id =>
      apiFetch(`/ads/company/${id}`).then(r => r.json())
    )
  )
    .then(lists => {
      const all = lists.flat() as Ad[];
      const now = Date.now();
      const valides = all.filter(ad => ad.expiresAt && new Date(ad.expiresAt).getTime() > now);
      setAds(valides);
      setIndex(0);
    })
    .catch(console.error);
}, [companyIds]);


  // 2) Auto-rotation: change index every `duration` seconds
  useEffect(() => {
    if (ads.length === 0) return;
    const dur = ads[index].duration ?? 5;
    const timeout = setTimeout(() => {
      setIndex(i => (i + 1) % ads.length);
    }, dur * 1000);
    return () => clearTimeout(timeout);
  }, [ads, index]);

  // 3) Manual swipe
  const handlers = useSwipeable({
    onSwipedLeft: () => setIndex(i => (i + 1) % ads.length),
    onSwipedRight: () => setIndex(i => (i - 1 + ads.length) % ads.length),
    trackMouse: true, // Enable mouse drag
  });

  // 3) Return nothing if no ads
  if (ads.length === 0) return null;

  const ad = ads[index];
  return (
    <div
      {...handlers}
      style={{
        maxWidth: 300,
        margin: '1rem auto',
        touchAction: 'pan-y', // Allow vertical scrolling
        position: 'relative',
      }}
    >
      {ad.type === 'image' ? (
        <img
          src={`${baseUrl}/${ad.filePath}`}
          alt="publicité"
          style={{ width: '100%', borderRadius: 8 }}
        />
      ) : (
        <video
          src={`${baseUrl}/${ad.filePath}`}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', borderRadius: 8 }}
        />
      )}

      {/* Indicator dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {ads.map((_, idx) => (
          <span
            key={idx}
            style={{
              height: 8,
              width: 8,
              borderRadius: '50%',
              backgroundColor: idx === index ? '#333' : '#ddd',
              margin: '0 4px',
              display: 'inline-block',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}