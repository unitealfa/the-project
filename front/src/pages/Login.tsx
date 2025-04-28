// front/src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    company: string | null;
    num: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  // Si déjà connecté, on redirige seulement si token + user existent
  useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('user')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log(`→ POST ${apiBase}/user/login`, { email, password });
      const res = await fetch(`${apiBase}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('← Statut HTTP:', res.status);
      const dataOrErr = await res.json();
      console.log('← Réponse brute:', dataOrErr);

      if (!res.ok) {
        const msg = (dataOrErr && dataOrErr.message) || 'Échec de la connexion';
        return alert(msg);
      }

      const data = dataOrErr as LoginResponse;
      console.log('← Data validée:', data);

      // Stocke token + user (avec company et num)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id:      data.user.id,
        nom:     data.user.nom,
        prenom:  data.user.prenom,
        email:   data.user.email,
        role:    data.user.role,
        company: data.user.company,
        num:     data.user.num,
      }));

      // Redirige vers le dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Erreur réseau / parsing :', err);
      alert('Erreur réseau');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '2rem auto' }}>
      <h2>Connexion</h2>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: '1.5rem' }}>
        Se connecter
      </button>
    </form>
  );
};

export default Login;
