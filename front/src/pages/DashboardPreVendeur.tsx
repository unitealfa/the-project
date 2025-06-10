// src/pages/DashboardPreVendeur.tsx
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import "../pages-css/DashboardPreVendeur.css"
import { CheckCircle, Loader2, AlertCircle, Users as UsersIcon } from "lucide-react"

interface User {
  nom: string
  prenom: string
  depot?: string
}

export default function DashboardPreVendeur() {
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

  const handleViewClients = () => {
    if (!user.depot) {
      alert("Aucun dépôt associé à votre compte")
      return
    }
    navigate("/clients")
  }

  return (
    <>
      <Header />

      <div className="brutalist-page-wrapper">
        <main>
          {/* Welcome Section */}
          <div className="brutalist-welcome-card brutalist-spacing-large center-content">
            <div className="brutalist-welcome-title">
              <CheckCircle /> Bonjour {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : Pré-vendeur
            </div>
          </div>

          {/* Clients Section */}
          <section className="brutalist-card brutalist-spacing-large center-content">
            <h2 className="brutalist-card-title inline-flex items-center gap-2 justify-center">
              <UsersIcon /> Clients du dépôt
            </h2>
            <button
              className="brutalist-action-button accent-blue"
              onClick={handleViewClients}
            >
              Voir la liste des clients
            </button>
          </section>
        </main>
      </div>
    </>
  )
}
