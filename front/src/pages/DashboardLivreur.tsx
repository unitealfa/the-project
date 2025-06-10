// src/pages/DashboardLivreur.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../components/Header"
import { Truck, Loader2, AlertCircle, UserCheck } from "lucide-react"
import "../pages-css/DashboardLivreur.css"

interface User {
  nom: string
  prenom: string
  role: string
}

export default function DashboardLivreur() {
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
      if (u.role !== "Livreur") {
        setError("Accès non autorisé.")
      } else {
        setUser(u)
      }
    } catch {
      setError("Données utilisateur invalides.")
    } finally {
      setLoading(false)
    }
  }, [navigate])

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
          <span>{error}</span>
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
          <div className="brutalist-welcome-card brutalist-spacing-large center-content">
            <div className="brutalist-welcome-title">
              <UserCheck /> Bienvenue {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : Livreur
            </div>
          </div>

          {/* Tournées prévues */}
          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title flex items-center gap-2 justify-center">
              <Truck /> Tournées prévues aujourd’hui
            </h2>
            <Link to="/livreur/commandes" className="brutalist-action-button accent-blue">
              Voir mes commandes
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}
