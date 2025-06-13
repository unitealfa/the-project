"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Header from "../components/Header"
import "../pages-css/LoyaltyClient.css"

import {
  Star,
  Gift,
  Award,
  Crown,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react"

/* ─────────── TYPES ─────────── */
interface Tier {
  points: number
  reward: string
  image?: string

  /* ajoutés côté front pour le rendu */
  icon?: string
  color?: string
}
interface SpendProgress {
  targetAmount: number
  currentAmount: number
}
interface RepeatReward {
  _id: string
  every: number
  reward: string
  image?: string

  /* ajoutés côté front pour le rendu */
  icon?: string
  color?: string
}

/* ─────────── PAGE ─────────── */
export default function LoyaltyClient() {
  const { companyId } = useParams<{ companyId: string }>()
  const api   = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token") || ""

  /* state */
  const [tiers,          setTiers]          = useState<Tier[]>([])
  const [points,         setPoints]         = useState(0)
  const [spend,          setSpend]          = useState<SpendProgress | null>(null)
  const [repeatRewards,  setRepeatRewards]  = useState<RepeatReward[]>([])
  const [progress,       setProgress]       = useState<Record<string, number>>({})
  const [mounted,        setMounted]        = useState(false)
  const [activeIndex,    setActiveIndex]    = useState<number | null>(null)

  /* ─────────── Chargement des données ─────────── */
  useEffect(() => {
    if (!companyId) return

    /* programme + points client */
    fetch(`${api}/loyalty/${companyId}/client-data`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        /* enrichit chaque palier d’une couleur & icône “fun” */
        const colors = ["#FFD1C5", "#B8F7D0", "#8E88F7", "#FDBA74", "#F472B6"]
        const icons  = ["star", "gift", "award", "crown", "sparkles"]

        const enhanced: Tier[] = (data.tiers || []).map(
          (t: Tier, i: number) => ({
            ...t,
            color: colors[i % colors.length],
            icon : icons[i % icons.length],
          }),
        )
        setTiers(enhanced)
        setPoints(data.points || 0)
      })
      .catch(console.error)

    /* dépenses */
    fetch(`${api}/loyalty/${companyId}/spend-progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.status === 404 ? null : r.json()))
      .then(d => d && setSpend(d))
      .catch(() => setSpend(null))

    /* défis récurrents + progression */
    fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((rewards: RepeatReward[]) => {
        const colors = ["#FFD1C5", "#B8F7D0", "#8E88F7", "#FDBA74"]
        const icons  = ["coffee", "cake", "ticket", "gift"]

        const enhanced = rewards.map((rr, i) => ({
          ...rr,
          color: colors[i % colors.length],
          icon : icons[i % icons.length],
        }))
        setRepeatRewards(enhanced)

        /* pour chaque défi => progression */
        enhanced.forEach(rr => {
          fetch(`${api}/loyalty/${companyId}/repeat-progress/${rr._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(d => setProgress(p => ({ ...p, [rr._id]: d.current })))
            .catch(() => setProgress(p => ({ ...p, [rr._id]: 0 })))
        })
      })
      .catch(console.error)

    /* déclenche les animations après le montage */
    setMounted(true)
  }, [api, token, companyId])

  /* ─────────── Logique de rendu ─────────── */
  const totalRequired      = tiers.at(-1)?.points || 0
  const pointsPercentage   = totalRequired ? Math.min(100, (points / totalRequired) * 100) : 0
  const spendPercentage    =
    spend && spend.targetAmount ? Math.min(100, (spend.currentAmount / spend.targetAmount) * 100) : 0

  /* numéro du palier actuel */
  const currentTierIndex   = tiers.findIndex(t => points < t.points) === -1
    ? tiers.length - 1
    : tiers.findIndex(t => points < t.points) - 1

  /* starry background */
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    top : `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 1}px`,
    delay: `${Math.random() * 5}s`,
  }))

  /* helper pour choisir l’icône lucide-react  */
  const getIcon = (name?: string) => {
    switch (name) {
      case "gift":      return <Gift     className="icon-full" />
      case "award":     return <Award    className="icon-full" />
      case "crown":     return <Crown    className="icon-full" />
      case "sparkles":  return <Sparkles className="icon-full" />
      case "zap":       return <Zap      className="icon-full" />
      default:          return <Star     className="icon-full" />
    }
  }

  /* ─────────── Render ─────────── */
  return (
    <div className="loyalty-client">
      <Header />

      {/* décor arrière-plan */}
      <div className="background-elements">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        {stars.map(s => (
          <div
            key={s.id}
            className="bg-star"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>

      <div className="container">
        {/* ===== TITRE ===== */}
        <header className="page-title">
          <div className="title-decoration" />
          <h1>Mes Points</h1>
          <div className="title-underline" />
        </header>

        {/* ===== RÉCAP TOTAL ===== */}
        <section className="recap-section">
          <div className="decorative-line decorative-line-top" />
          <div className="recap-card">
            <div className="decorative-circle decorative-circle-1" />
            <div className="decorative-circle decorative-circle-2" />

            <div className="star-icon-container">
              <div className="star-icon-bg">
                <Star className="star-icon" />
              </div>
            </div>

            <p className="points-total">
              Vous avez{" "}
              <span className="highlighted-points">
                {points}
                <span className="highlight-underline" />
              </span>{" "}
              / {totalRequired} pts
            </p>

            <p className="points-message">
              {points < totalRequired
                ? `Plus que ${totalRequired - points} points pour atteindre l'objectif !`
                : "Félicitations ! Niveau max débloqué 🚀"}
            </p>

            {/* mini étoiles */}
            <div className="progress-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`progress-star ${points / totalRequired * 5 > i ? "filled" : ""}`} />
              ))}
            </div>
          </div>
          <div className="decorative-line decorative-line-bottom" />
        </section>

        {/* ===== PROGRESSION PRINCIPALE ===== */}
        <section className="progress-section">
          <div className="points-counter">
            <div className="counter-left">
              <div className="counter-icon">
                <Star className="counter-icon-svg" />
              </div>
              <div>
                <p className="counter-label">Points actuels</p>
                <p className="counter-value">{points}</p>
              </div>
            </div>
            <div className="counter-right">
              <p className="counter-label">Objectif</p>
              <p className="counter-value-small">{totalRequired} pts</p>
            </div>
          </div>

          {/* barre */}
          <div className="main-progress-container">
            <div className="progress-bar-3d">
              <div
                className={`progress-fill ${mounted ? "animated" : ""}`}
                style={{ width: `${pointsPercentage}%` }}
              >
                <div className="progress-shine" />
              </div>
            </div>

            {/* repères */}
            <div className="tier-markers">
              {tiers.map((t, i) => {
                const pos   = Math.min((t.points / totalRequired) * 100, 100)
                const passed = points >= t.points
                return (
                  <div
                    key={i}
                    className={`tier-marker ${passed ? "passed" : ""}`}
                    style={{
                      left : `${pos}%`,
                      width: passed ? 2 : 1,
                      backgroundColor: passed ? "black" : "rgba(0,0,0,.3)",
                    }}
                  />
                )
              })}
            </div>

            {/* indicateur position */}
            <div
              className={`position-indicator ${mounted ? "visible" : ""}`}
              style={{ left: `${pointsPercentage}%` }}
            />
            <div className="percentage-indicator" style={{ left: `${pointsPercentage}%` }}>
              {Math.round(pointsPercentage)}%
            </div>
          </div>

          {/* légende */}
          <div className="tiers-legend">
            <div className="tiers-grid">
              {tiers.map((t, i) => {
                const passed = points >= t.points
                const active = currentTierIndex === i
                const next   = !passed && i === currentTierIndex + 1

                return (
                  <div
                    key={i}
                    className={`tier-item ${passed ? "passed" : ""} ${active ? "active" : ""} ${
                      next ? "next" : ""
                    }`}
                  >
                    <div className="tier-icon-container" style={{ backgroundColor: passed ? t.color : undefined }}>
                      {t.image ? (
                        <div className="tier-image-container">
                          <img
                            src={`${api}/${t.image}`}
                            className={`tier-image ${passed ? "" : "grayscale"}`}
                          />
                          {passed && <div className="checkmark">✓</div>}
                        </div>
                      ) : (
                        <div className={`tier-icon ${active ? "active" : ""}`}>{getIcon(t.icon)}</div>
                      )}
                    </div>

                    <div className={`tier-text ${active ? "active" : ""}`}>
                      <p className={`tier-points ${active ? "active" : ""}`}>{t.points} pts</p>
                      <p className={`tier-reward ${passed ? "passed" : ""}`}>{t.reward}</p>
                    </div>

                    {active && <div className="active-indicator" />}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== RÉCOMPENSES RÉPÉTITIVES ===== */}
        {repeatRewards.length > 0 && (
          <section className="rewards-section">
            <div className="section-title">
              <div className="section-icon">
                <Gift className="section-icon-svg" />
              </div>
              <h2>Récompenses Répétitives</h2>
              <div className="section-line" />
            </div>

            <div className="rewards-grid">
              {repeatRewards.map(rr => {
                const curr  = progress[rr._id] || 0
                const pct   = Math.min(100, (curr / rr.every) * 100)
                const done  = pct >= 100

                return (
                  <div key={rr._id} className="reward-card">
                    <div className="reward-decoration" style={{ backgroundColor: rr.color }} />

                    <header className="reward-header">
                      <span className="reward-badge">Tous les {rr.every} pts</span>
                      <div className={`completion-badge ${done ? "complete" : ""}`}>
                        {done ? "✓" : `${pct}%`}
                      </div>
                    </header>

                    <div className="reward-image-container">
                      <div className={`reward-image-wrapper ${done ? "complete" : ""}`}>
                        <img
                          src={rr.image ? `${api}/${rr.image}` : "/placeholder.svg"}
                          className={`reward-image ${done ? "" : "grayscale"}`}
                        />
                      </div>
                      <div className="reward-badge-icon">{getIcon(rr.icon)}</div>
                    </div>

                    <div className="reward-content">
                      <h3 className="reward-title">{rr.reward}</h3>

                      <div className="reward-progress-header">
                        <p className="reward-progress-label">Progression</p>
                        <p className="reward-progress-value">
                          {curr} / {rr.every} pts
                        </p>
                      </div>

                      <div className="reward-progress-bar">
                        <div className="reward-progress-fill" style={{ width: `${pct}%` }}>
                          <div className="reward-progress-shine" />
                          {[25, 50, 75].map(m =>
                            pct >= m ? (
                              <div
                                key={m}
                                className="reward-progress-milestone"
                                style={{ left: `${m}%` }}
                              />
                            ) : null,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== PROGRÈS DÉPENSES ===== */}
        {spend && spend.targetAmount > 0 && (
          <section className="spending-section">
            <div className="spending-decoration-1" />
            <div className="spending-decoration-2" />

            <header className="spending-header">
              <div className="spending-icon">
                <Trophy className="spending-icon-svg" />
              </div>
              <h2>Progrès dépenses</h2>
            </header>

            <div className="spending-card">
              <div className="spending-progress-header">
                <p className="spending-label">Objectif</p>
                <p className="spending-percentage">{spendPercentage}%</p>
              </div>

              <div className="spending-progress-container">
                <div className="spending-progress-bar">
                  <div
                    className={`spending-progress-fill ${mounted ? "animated" : ""}`}
                    style={{ width: `${spendPercentage}%` }}
                  >
                    <div className="spending-progress-shine" />
                    {[25, 50, 75].map(m => (
                      <div
                        key={m}
                        className={`spending-milestone ${spendPercentage >= m ? "reached" : ""}`}
                        style={{ left: `${m}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="spending-target-marker" />
              </div>

              <div className="spending-values">
                <div className="spending-current">
                  <div className="spending-currency">DA</div>
                  <p className="spending-amount">{spend.currentAmount}</p>
                </div>
                <div className="spending-target">
                  <p className="spending-target-label">Objectif :</p>
                  <p className="spending-target-value">{spend.targetAmount} DA</p>
                </div>
              </div>
            </div>

            <div className="spending-message">
              <p>
                {spendPercentage < 50
                  ? "Continuez vos achats pour débloquer des avantages !"
                  : spendPercentage < 100
                  ? "Vous y êtes presque ! Encore un petit effort."
                  : "Bravo ! Objectif de dépenses atteint 🎉"}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
