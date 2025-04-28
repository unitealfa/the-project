// front/src/components/LogoutButton.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };
  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#e53e3e',
        color: '#fff',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer',
      }}
    >
      Déconnexion
    </button>
  );
}
