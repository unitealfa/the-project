import React from 'react';
import { Navigate } from 'react-router-dom';

/* ───────────────── Types ─────────────────────────────────────────── */
export interface UserType {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;              // ex. 'Admin', 'responsable depot', …
  company?: string | null;
  companyName?: string | null;
  depot?: string | null;     // Ajout du champ depot qui est essentiel pour les autorisations
  num?: string;
}

interface RequireAuthProps {
  children: React.ReactNode;
  /** Liste blanche de rôles.  
   *  ● Si absent → on accepte tout utilisateur connecté.  
   *  ● Comparaison insensible à la casse / espaces.            */
  allowedRoles?: string[];
}
/* ───────────────── Composant ─────────────────────────────────────── */
export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  /* récupère le user depuis localStorage --------------------------- */
  const raw = localStorage.getItem('user');
  if (!raw) {
    /* non connecté → retour à la page de login */
    return <Navigate to='/' replace />;
  }
  const user: UserType = JSON.parse(raw);

  /* normalise le rôle : trim + lowercase --------------------------- */
  const userRole = user.role?.trim().toLowerCase();

  /* si une liste de rôles est fournie, on vérifie la présence ------- */
  if (allowedRoles) {
    const ok = allowedRoles
      .map(r => r.trim().toLowerCase())
      .includes(userRole);

    if (!ok) {
      /* rôle non autorisé → redirection */
      return <Navigate to='/' replace />;
    }
  }

  /* tout est bon → on rend les enfants ----------------------------- */
  return <>{children}</>;
}
