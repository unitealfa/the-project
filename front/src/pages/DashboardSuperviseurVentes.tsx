// src/pages/DashboardSuperviseurVentes.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Button from "@/components/ui/button"
import {
  Users,
  UserPlus,
  Package,
  UserCheck,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react"
import "../pages-css/DashboardSuperviseurVentes.css"

interface User {
  nom: string
  prenom: string
  role?: string
  depot?: string
}

export default function DashboardSuperviseurVentes() {
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
      setUser(JSON.parse(raw))
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
            <div className="brutalist-role-card">
              <p className="brutalist-role-text">
                Rôle : <span className="brutalist-role-highlight">{user.role || "Superviseur des ventes"}</span>
              </p>
            </div>
          </div>

          {/* Grid Sections */}
          <div className="brutalist-grid">
            {/* Consultation des clients */}
            <div className="brutalist-section-card">
              <div className="brutalist-section-header brutalist-section-header-clients">
                <h2 className="brutalist-section-title">
                  <Users /> Consultation des clients
                </h2>
              </div>
              <div className="brutalist-section-content">
                <p className="brutalist-section-description">
                  Accédez à la liste complète des clients de votre dépôt
                </p>
                <Button
                  className="brutalist-action-button brutalist-action-button-clients"
                  onClick={() => navigate("/clients")}
                >
                  Liste des clients
                </Button>
              </div>
            </div>

            {/* Gestion des affectations */}
            <div className="brutalist-section-card">
              <div className="brutalist-section-header brutalist-section-header-affectations">
                <h2 className="brutalist-section-title">
                  <UserPlus /> Gestion des affectations
                </h2>
              </div>
              <div className="brutalist-section-content">
                <p className="brutalist-section-description">
                  Gérez l’affectation des prévendeurs aux clients
                </p>
                <Button
                  className="brutalist-action-button brutalist-action-button-affectations"
                  onClick={() => navigate("/assign-prevendeurs")}
                >
                  Affecter les prévendeurs
                </Button>
              </div>
            </div>

            {/* Commandes récentes - full width */}
            <div className="brutalist-section-card brutalist-section-card-full">
              <div className="brutalist-section-header brutalist-section-header-commandes">
                <h2 className="brutalist-section-title">
                  <Package /> Commandes récentes
                </h2>
              </div>
              <div className="brutalist-section-content">
                <Button
                  className="brutalist-action-button brutalist-action-button-commandes"
                  onClick={() => navigate("/commandes")}
                >
                  Voir les commandes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
