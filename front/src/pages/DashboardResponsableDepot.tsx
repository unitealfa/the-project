// src/pages/DashboardResponsableDepot.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Button from "@/components/ui/button"
import { Users, BarChart3, Building2, Loader2, AlertCircle, UserCheck } from "lucide-react"
import "../pages-css/DashboardResponsableDepot.css"

interface User {
  nom: string
  prenom: string
  depot?: string
  role?: string
}

interface Depot {
  _id: string
  nom_depot: string
}

export default function DashboardResponsableDepot() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [depot, setDepot] = useState<Depot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const apiBase = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token") || ""

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
      if (u.depot) {
        fetch(`${apiBase}/api/depots/${u.depot}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Erreur ${res.status}`)
            return res.json()
          })
          .then((d: Depot) => setDepot(d))
          .catch((e) => setError(e.message))
      }
    } catch {
      setError("Données utilisateur invalides.")
    } finally {
      setLoading(false)
    }
  }, [apiBase, token])

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
          <span className="brutalist-error-text">{error}</span>
        </div>
      </div>
    )
  if (!user) return null

  return (
    <>
      <Header />

      <div className="brutalist-page-wrapper">
        <main>
          <div className="brutalist-welcome-card brutalist-spacing-large">
            <h1 className="brutalist-welcome-title">
              <UserCheck /> Bonjour {user.prenom} {user.nom}
            </h1>
            <div className="brutalist-welcome-role">
              Rôle :{" "}
              <span className="brutalist-role-highlight">
                {user.role || "Responsable dépôt"}
              </span>
            </div>
          </div>

          {depot && (
            <section className="brutalist-depot-section">
              <div className="brutalist-depot-card">
                <div className="brutalist-depot-header">
                  <h2 className="brutalist-depot-title">
                    <Building2 /> Dépôt assigné :{" "}
                    <span className="brutalist-depot-name">
                      {depot.nom_depot}
                    </span>
                  </h2>
                </div>
                <div className="brutalist-depot-content">
                  <div className="brutalist-actions-grid">
                    <Button
                      className="brutalist-action-button brutalist-action-button-team"
                      onClick={() => navigate(`/teams/${depot._id}`)}
                    >
                      <Users /> Gérer l'équipe
                    </Button>
                    <Button
                      className="brutalist-action-button brutalist-action-button-clients"
                      onClick={() =>
                        navigate(`/clients?depot=${depot._id}`)
                      }
                    >
                      <Users /> Consulter les clients
                    </Button>
                    <Button
                      className="brutalist-action-button brutalist-action-button-stats"
                      onClick={() =>
                        navigate(`/stats-ventes?depot=${depot._id}`)
                      }
                    >
                      <BarChart3 /> Voir les statistiques
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
