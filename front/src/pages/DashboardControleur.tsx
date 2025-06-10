// src/pages/DashboardControleur.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Button from "../components/ui/button"
import { Route, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import "../pages-css/DashboardControleur.css"

interface User {
  nom: string
  prenom: string
  role?: string
  depot?: string
}

export default function DashboardControleur() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("user")
    if (!raw) {
      setError("Utilisateur non trouvé. Veuillez vous reconnecter.")
      setLoading(false)
      return
    }
    try {
      const u = JSON.parse(raw) as User
      setUser(u)
    } catch {
      setError("Données utilisateur invalides.")
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading)
    return (
      <div className="brutalist-loading">
        <div className="brutalist-loading-card">
          <Loader2 className="animate-spin" />
          <span className="brutalist-loading-text">Chargement…</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="brutalist-error">
        <div className="brutalist-error-card">
          <AlertCircle />
          <span>{error}</span>
        </div>
      </div>
    )

  if (!user) return null

  return (
    <>
      <Header />

      <div className="brutalist-container">
        <main>
          <div className="brutalist-welcome-card brutalist-spacing-large">
            <div className="brutalist-welcome-title">
              <CheckCircle /> Bienvenue {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : {user.role || "—"}
            </div>
          </div>

          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title flex items-center gap-2">
              <CheckCircle /> Inventaires & contrôles qualité
            </h2>
            <Button
              className="brutalist-action-button"
              onClick={() => navigate("/tournees")}
            >
              <Route className="mb-1" />
              Voir les tournées
            </Button>
          </section>
        </main>
      </div>
    </>
  )
}
