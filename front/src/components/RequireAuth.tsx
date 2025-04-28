// front/src/components/RequireAuth.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

export type UserType = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  company?: string | null;
  num?: string;
};

type RequireAuthProps = {
  children: React.ReactNode;
  allowedRoles?: string[];    // si absent, on accepte tous les users authentifiés
};

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return <Navigate to="/" replace />;
  }
  const user = JSON.parse(raw) as UserType;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
