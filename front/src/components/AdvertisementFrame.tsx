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
  const [aspectRatio, setAspectRatio] = useState<string>("16/9");
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const baseUrl = import.meta.env.VITE_API_URL;

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

  // Au rendu du média, on lit ses dimensions naturelles
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setAspectRatio(`${w}/${h}`);
    setIsPortrait(h > w);
  };
  const onVideoMeta = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
    setIsPortrait(video.videoHeight > video.videoWidth);
  };

  // 3) Return nothing if no ads
  if (ads.length === 0) return null;

  const ad = ads[index];
  const mediaUrl = `${baseUrl}/${ad.filePath}`;
  return (
    <div
      {...handlers}
      className="ad-container"
      style={{
        maxWidth: 300,
        margin: '1rem auto',
        touchAction: 'pan-y', // Allow vertical scrolling
        position: 'relative',
      }}
    >
      {/* on retire tout aspect-ratio fixe en CSS, et on l’applique ici */}
      <div className={`ad-media-wrapper ${isPortrait ? "portrait" : "landscape"}`} style={{ aspectRatio }}>
        {ad.type === 'video' ? (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="ad-media"
            onLoadedMetadata={onVideoMeta}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="publicité"
            className="ad-media"
            onLoad={onImgLoad}
          />
        )}
      </div>

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