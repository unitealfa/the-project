// front/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ---------- types de la réponse ----------------------------- */
interface LoginResponse {
  token: string;
  user: {
    id         : string;
    nom        : string;
    prenom     : string;
    email      : string;
    role       : string;             // Admin, Super Admin, livraison…
    fonction?  : string;             // Livreur, Chauffeur, …
    company    : string | null;      // ObjectId
    companyName: string | null;      // nom lisible
    num        : string;
  };
}
/* ------------------------------------------------------------- */

const Login: React.FC = () => {
  const navigate           = useNavigate();
  const apiBase: string    = import.meta.env.VITE_API_URL;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  /* déjà connecté ? → dashboard -------------------------------- */
  useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('user')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  /* ------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res  = await fetch(`${apiBase}/user/login`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ email, password }),
      });

      const payload = await res.json();

      if (!res.ok) throw new Error(payload.message || 'Échec de la connexion');

      const data = payload as LoginResponse;

      /* on stocke TOUT le user (avec fonction + companyName) ---- */
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id         : data.user.id,
        nom        : data.user.nom,
        prenom     : data.user.prenom,
        email      : data.user.email,
        role       : data.user.role,
        fonction   : data.user.fonction,
        company    : data.user.company,
        companyName: data.user.companyName,
        num        : data.user.num,
      }));
      /* --------------------------------------------------------- */

      navigate('/dashboard', { replace:true });
    } catch (err:any) {
      alert(err.message || 'Erreur réseau');
    }
  };

  /* ---------------------------- UI ---------------------------- */
  return (
    <form onSubmit={handleSubmit} style={{maxWidth:320,margin:'2rem auto',fontFamily:'Arial, sans-serif'}}>
      <h2>Connexion</h2>

      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        <label>Email</label>
        <input type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
      </div>

      <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:4}}>
        <label>Mot de passe</label>
        <input type='password' value={password} onChange={e=>setPassword(e.target.value)} required />
      </div>

      <button type='submit' style={{marginTop:'1.5rem',padding:'.5rem 1rem'}}>
        Se connecter
      </button>
    </form>
  );
};

export default Login;
