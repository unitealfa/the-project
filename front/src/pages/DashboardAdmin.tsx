// src/pages/DashboardAdmin.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  BarChart3,
  MapPin,
  Users,
  Gift,
  UserCheck,
  TrendingUp,
  Database,
  Loader2,
  AlertCircle,
} from "lucide-react"
import "../pages-css/DashboardAdmin.css"

interface User {
  id: string
  nom: string
  prenom: string
  role: string
  company: string
}
interface Company {
  _id: string
  nom_company: string
}

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const apiBase = import.meta.env.VITE_API_URL

  useEffect(() => {
    const raw = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (!raw || !token) {
      setError("Utilisateur non authentifié")
      setLoading(false)
      return
    }

    const u = JSON.parse(raw) as User
    setUser(u)

    fetch(`${apiBase}/companies/${u.company}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        return res.json()
      })
      .then((c: Company) => setCompany(c))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate, apiBase])

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

  if (!user || !company) return null

  return (
    <>
      <Header />

      <div className="brutalist-page-wrapper">
        <main>
          <h1 className="brutalist-main-title">
            <BarChart3 /> Tableau de bord – Admin de {company.nom_company}
          </h1>

          <div className="brutalist-welcome-card">
            <div className="brutalist-welcome-title">
              <UserCheck /> Bienvenue {user.prenom} {user.nom}
            </div>
            <div className="brutalist-welcome-role">
              Rôle : {user.role}
            </div>
          </div>

          {/* Statistiques globales */}
          <button
            className="brutalist-stats-button mb-8"
            onClick={() => navigate("/admin/stats")}
          >
            <TrendingUp /> Statistiques Globales
          </button>

          {/* Navigation principale */}
          <div className="brutalist-nav-grid mb-8">
            <Link to="/depots" className="block">
              <Card className="brutalist-nav-card bg-blue-accent">
                <CardHeader className="brutalist-nav-card-header">
                  <CardTitle className="brutalist-nav-card-title">
                    <MapPin /> Dépôts
                  </CardTitle>
                </CardHeader>
                <CardContent className="brutalist-nav-card-content">
                  <div className="brutalist-nav-icon">
                    <Database />
                  </div>
                  <div className="brutalist-nav-text">Voir mes dépôts</div>
                  <div className="brutalist-nav-description">
                    Gérer et consulter vos dépôts
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/clients" className="block">
              <Card className="brutalist-nav-card bg-green-accent">
                <CardHeader className="brutalist-nav-card-header">
                  <CardTitle className="brutalist-nav-card-title">
                    <Users /> Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="brutalist-nav-card-content">
                  <div className="brutalist-nav-icon">
                    <Users />
                  </div>
                  <div className="brutalist-nav-text">
                    Consulter tous les clients
                  </div>
                  <div className="brutalist-nav-description">
                    Base de données complète
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/loyalty" className="block">
              <Card className="brutalist-nav-card bg-yellow-accent">
                <CardHeader className="brutalist-nav-card-header">
                  <CardTitle className="brutalist-nav-card-title">
                    <Gift /> Fidélité
                  </CardTitle>
                </CardHeader>
                <CardContent className="brutalist-nav-card-content">
                  <div className="brutalist-nav-icon">
                    <Gift />
                  </div>
                  <div className="brutalist-nav-text">Programme Fidélité</div>
                  <div className="brutalist-nav-description">
                    Récompenses et points
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

        </main>
      </div>
    </>
  )
}
