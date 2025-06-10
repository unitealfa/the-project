// src/pages/DashboardGestionStock.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import { CheckCircle, Loader2, AlertCircle, Hop } from "lucide-react"
import "../pages-css/DashboardGestionStock.css"

interface User {
  nom: string
  prenom: string
  depot?: string
}

export default function DashboardGestionStock() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("user")
    if (!raw) {
      setError("Aucun utilisateur trouvé dans localStorage.")
      setLoading(false)
      return
    }
    try {
      const u = JSON.parse(raw) as User
      if (!u.depot) throw new Error('Le champ "depot" est manquant.')
      setUser(u)
    } catch (e: any) {
      setError(e.message)
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
          <div className="brutalist-welcome-card brutalist-spacing-large">
            <div className="brutalist-welcome-title">
              <CheckCircle /> Bonjour {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : Gestionnaire de stock
            </div>
          </div>

          {/* Products Section */}
          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title flex items-center gap-2">
              <Hop /> Produits de votre dépôt
            </h2>
            <Link
              to={`/gestion-depot/${user.depot}`}
              className="brutalist-action-button accent-green"
            >
              Gérer les produits de mon dépôt
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}
