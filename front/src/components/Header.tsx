// front/src/components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

/* Une petite couleur d’accent — change-la si besoin */
const ACCENT = '#4f46e5';

export default function Header() {
  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /* Lecture de l’utilisateur courant (stocké après le login)           */
  /* ------------------------------------------------------------------ */
  const raw  = localStorage.getItem('user');
  const user = raw
    ? (JSON.parse(raw) as {
        nom      : string;
        prenom   : string;
        role     : string;   // Super Admin | Admin | livraison | prevente | …
        fonction?: string;   // Livreur, Chauffeur, …
        company ?: string;   // _id de company (optionnel ici)
      })
    : null;

  /* Si jamais on arrive sans user → retour au login                    */
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Rôle / fonction à afficher                                         */
  /* ------------------------------------------------------------------ */
  const displayRole =
    ['livraison', 'prevente', 'entrepot'].includes(user.role)
      ? user.fonction ?? user.role       // Livre le rôle “détaillé” s’il existe
      : user.role;                       // Super Admin | Admin

  /* ------------------------------------------------------------------ */
  /* Chemin du bouton “Tableau de bord”                                 */
  /*   On peut directement renvoyer vers /dashboard : la route          */
  /*   <RequireAuth><RoleBasedDashboard/></RequireAuth> se charge       */
  /*   ensuite de montrer le bon tableau selon user.role                */
  /* ------------------------------------------------------------------ */
  const gotoDashboard = () => navigate('/dashboard');

  /* ------------------------------------------------------------------ */
  /* Déconnexion : on vide le storage puis retour au login              */
  /* ------------------------------------------------------------------ */
  const logout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  /* ------------------------------------------------------------------ */
  return (
    <header
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '0.75rem 1.25rem',
        background:     ACCENT,
        color:          '#fff',
        fontFamily:     'Arial, sans-serif',
      }}
    >
      {/* Logo / nom de l’app — clique : dashboard */}
      <h1
        style={{ margin:0, fontSize:'1.25rem', cursor:'pointer' }}
        onClick={gotoDashboard}
      >
        Routimize
      </h1>

      {/* Zone droite : identité + actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
        <span>
          Bonjour&nbsp;
          <strong>{user.nom} {user.prenom}</strong>{' '}
          <em style={{ opacity:0.8 }}>({displayRole})</em>
        </span>

        <button
          onClick={gotoDashboard}
          style={{
            padding:      '.35rem .9rem',
            background:   '#fff',
            color:        ACCENT,
            border:       'none',
            borderRadius: 6,
            cursor:       'pointer',
            fontWeight:   600,
          }}
        >
          Tableau de bord
        </button>

        <button
          onClick={logout}
          style={{
            padding:      '.35rem .9rem',
            background:   'transparent',
            color:        '#fff',
            border:       '1px solid rgba(255,255,255,.8)',
            borderRadius: 6,
            cursor:       'pointer',
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
