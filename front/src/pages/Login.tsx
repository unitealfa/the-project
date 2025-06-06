// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../pages-css/login/Login.css";
import Hyperspeed from "../pages-css/login/Hyperspeed";
import LogoAnimation from "../pages-css/login/LogoAnimation";

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nom_client?: string;
    nom?: string;
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
    pfp?: string;
  };
}

function getCookie(name: string): string | null {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\/+^])/g, '\\$1')}=([^;]*)`)
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const apiBase: string = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [skipIntro, setSkipIntro] = useState<boolean>(() => {
    return getCookie("skipIntro") === "true";
  });
  const [introDone, setIntroDone] = useState(false);
  const timerRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Redirection si déjà connecté
  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Timer d'intro (5.5 s) ou skip immédiat
  useEffect(() => {
    if (skipIntro) {
      setIntroDone(true);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setIntroDone(true);
    }, 5500);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [skipIntro]);

  // Appeler l'entrée du formulaire dès que introDone === true
  useEffect(() => {
    if (introDone) {
      formRef.current?.classList.add("enter");
    }
  }, [introDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let payload = await res.json();

      if (!res.ok) {
        res = await fetch(`${apiBase}/auth/login-client`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.message || "Échec de la connexion");
        }
      }

      const data = payload as LoginResponse;
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    }
  };

  return (
    <div className="login-page">
      {!introDone && <LogoAnimation />}

      {introDone && (
        <>
          <Hyperspeed />

          <form className="form" ref={formRef} onSubmit={handleSubmit}>
            <div className="title">
              Welcome to
              <br />
              routimize.
            </div>

            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}

            <button className="button-confirm" type="submit">
              Let’s go →
            </button>
          </form>
        </>
      )}

      {/* Checkbox "Skip intro" toujours visible */}
      <div className="skip-container">
        <label className="skip-label">
          <input
            type="checkbox"
            className="skip-checkbox"
            checked={skipIntro}
            onChange={(e) => {
              const shouldSkip = e.target.checked;
              setSkipIntro(shouldSkip);
              setCookie("skipIntro", shouldSkip.toString(), 365);
            }}
          />
          Skip 
        </label>
      </div>
    </div>
  );
};

export default Login;
