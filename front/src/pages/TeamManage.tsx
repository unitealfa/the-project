// front/src/pages/TeamManage.tsx
import React, { useState } from 'react';
import Header from '../components/Header';

const CARD_MIN_W   = 320;   // largeur mini d’une carte
const CARD_MIN_H   = 180;   // hauteur mini d’une carte
const TRANSITION   = 'transform 0.25s ease, box-shadow 0.25s ease';
const BASE_SHADOW  = '0 2px 6px rgba(0,0,0,0.08)';
const HOVER_SHADOW = '0 6px 14px rgba(0,0,0,0.15)';

export default function TeamManage() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  /** Carte réutilisable --------------------------------------------- */
  const Card = ({ title, idx }: { title: string; idx: number }) => {
    const hovered = hoverIdx === idx;

    return (
      <div
        onMouseEnter={() => setHoverIdx(idx)}
        onMouseLeave={() => setHoverIdx(null)}
        style={{
          flex: 1,
          minWidth: CARD_MIN_W,
          minHeight: CARD_MIN_H,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '1.15rem',
          cursor: 'default',
          boxShadow: hovered ? HOVER_SHADOW : BASE_SHADOW,
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          transition: TRANSITION,
          userSelect: 'none',
        }}
      >
        {title}
      </div>
    );
  };
  /* ------------------------------------------------------------------ */

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Gestion de l’équipe</h1>

        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Card title="Équipe Livraison" idx={0} />
          <Card title="Équipe Pré-vente"  idx={1} />
          <Card title="Équipe Entrepôt"   idx={2} />
        </div>
      </div>
    </>
  );
}
