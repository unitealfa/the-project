// src/pages/DashboardSuperAdmin.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/Header"
import { Loader2, AlertCircle, UserCheck, Building2, Megaphone } from "lucide-react"
import "../pages-css/DashboardSuperAdmin.css"

interface User {
  id: string
  nom: string
  prenom: string
  role: string
}

export default function DashboardSuperAdmin() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("user")
    if (!raw) {
      setError("Utilisateur non authentifié")
      setLoading(false)
      return
    }
    try {
      setUser(JSON.parse(raw))
    } catch {
      setError("Données utilisateur invalides")
    } finally {
      setLoading(false)
    }
  }, [navigate])

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
          <div className="brutalist-welcome-card">
            <div className="brutalist-welcome-title">
              <UserCheck /> Bienvenue {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : {user.role}
            </div>
          </div>

          <section className="brutalist-navigation-section">
            <Link to="/companies" className="brutalist-nav-item">
              <div className="brutalist-nav-content">
                <Building2 className="w-6 h-6" />
                <span className="brutalist-nav-text">• Voir toutes les entreprises</span>
              </div>
            </Link>
            <Link to="/ads" className="brutalist-nav-item">
              <div className="brutalist-nav-content">
                <Megaphone className="w-6 h-6" />
                <span className="brutalist-nav-text">• Gérer les publicités</span>
              </div>
            </Link>
          </section>
        </main>
      </div>
    </>
  )
}
