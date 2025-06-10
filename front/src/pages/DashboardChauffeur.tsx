// src/pages/DashboardChauffeur.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import { Truck, UserCheck, Loader2, AlertCircle } from "lucide-react"
import "../pages-css/DashboardChauffeur.css"

interface User {
  nom: string
  prenom: string
  companyName?: string
  role?: string
}

export default function DashboardChauffeur() {
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
      if (u.role !== "Chauffeur") {
        setError("Accès non autorisé.")
      } else {
        setUser(u)
      }
    } catch {
      setError("Données utilisateur invalides.")
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="brutalist-loading">
        <div className="brutalist-loading-card">
          <Loader2 className="animate-spin" />
          <span className="brutalist-loading-text">Chargement…</span>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="brutalist-error">
        <div className="brutalist-error-card">
          <AlertCircle />
          <span className="brutalist-error-text">{error}</span>
        </div>
      </div>
    )
  }
  if (!user) return null

  return (
    <>
      <Header />

      <div className="brutalist-page-wrapper">
        <main>
          {/* Welcome Section */}
          <div className="brutalist-welcome-card brutalist-spacing-large">
            <div className="brutalist-welcome-title">
              <UserCheck /> Bienvenue {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : Chauffeur
            </div>
            {user.companyName && (
              <p className="brutalist-company">
                Société : <strong>{user.companyName}</strong>
              </p>
            )}
          </div>

          {/* Tournées prévues */}
          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title inline-flex items-center gap-2 justify-center">
              <Truck /> Tournées prévues aujourd’hui
            </h2>
            <Link
              to="/chauffeur/tournees"
              className="brutalist-action-button accent-indigo"
            >
              Voir mes tournées
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}
