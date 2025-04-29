import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  let dashPath = '/dashboard';
  if (user) {
    dashPath =
      user.role === 'Super Admin'
        ? '/dashboard/super'
        : `/dashboard/${user.role.toLowerCase()}`;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f3f4f6',
        borderBottom: '1px solid #ddd',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <button
        onClick={() => navigate(dashPath)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        Dashboard
      </button>
      <button
        onClick={handleLogout}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#e53e3e',
          fontSize: '1rem'
        }}
      >
        Déconnexion
      </button>
    </header>
  );
}
