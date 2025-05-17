import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nom_client?: string; // pour les clients
    nom?: string;        // pour les utilisateurs internes
    prenom?: string;
    email: string;
    role: string;
    company?: string | null;
    companyName?: string | null;
    num?: string;
    depot?: string | null;
    depot_name?: string;
    entreprise?: { nom_company?: string };
    contact?: { telephone?: string };
    // tout ce que tu mets côté back dans le user envoyé !
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const apiBase: string = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirection si déjà connecté
  useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('user')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // On tente d'abord la connexion classique (utilisateur interne)
      let res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let payload = await res.json();

      // Si échec (utilisateur inexistant OU mauvais mot de passe), on tente comme client
      if (!res.ok) {
        // On tente l'endpoint client si présent (exemple /auth/login-client)
        res = await fetch(`${apiBase}/auth/login-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Échec de la connexion');
      }

      const data = payload as LoginResponse;
      console.log("Données utilisateur reçues:", data.user);

      // Stocke token et user
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      alert(err.message || 'Erreur réseau');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 320, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}
    >
      <h2>Connexion</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: '1.5rem', padding: '.5rem 1rem' }}>
        Se connecter
      </button>
    </form>
  );
};

export default Login;
