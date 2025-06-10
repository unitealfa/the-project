// src/pages/DashboardManutentionnaire.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../components/Header"
import { Package, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import "../pages-css/DashboardManutentionnaire.css"

interface User {
  nom: string
  prenom: string
}

export default function DashboardManutentionnaire() {
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

      <div className="brutalist-page-wrapper">
        <main>
          {/* Welcome Section */}
          <div className="brutalist-welcome-card brutalist-spacing-large">
            <div className="brutalist-welcome-title">
              <CheckCircle /> Bonjour {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : Manutentionnaire
            </div>
          </div>

          {/* Missions de préparation */}
          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title flex items-center gap-2">
              <Package /> Missions de préparation
            </h2>
            <Link to="/tournees" className="brutalist-action-button accent-blue">
              Voir les tournées
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}
