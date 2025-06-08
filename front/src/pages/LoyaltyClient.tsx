// front/src/pages/LoyaltyClient.tsx
import React, { useEffect, useState } from 'react'
import { useParams }                from 'react-router-dom'
import Header                       from '../components/Header'

interface Tier { points: number; reward: string; image?: string }
interface SpendProgress { targetAmount: number; currentAmount: number }

export default function LoyaltyClient() {
  const { companyId } = useParams<{companyId: string}>()
  const api           = import.meta.env.VITE_API_URL
  const token         = localStorage.getItem('token') || ''
  const [tiers,  setTiers]  = useState<Tier[]>([])
  const [points, setPoints] = useState(0)
  const [spend,  setSpend]  = useState<SpendProgress | null>(null)

  useEffect(() => {
    if (!companyId) return

    // programme + points client
    fetch(`${api}/loyalty/${companyId}/client-data`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setTiers(data.tiers || [])
        setPoints(data.points || 0)
      })
      .catch(console.error)

    // progrès dépenses (peut ne pas exister)
    fetch(`${api}/loyalty/${companyId}/spend-progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.status === 404) {            // l’entreprise n’a pas configuré ce système
          setSpend(null)
          return null
        }
        return r.json()
      })
      .then(data => {
        if (data) setSpend(data)
      })
      .catch(() => setSpend(null))
  }, [api, token, companyId])

  const totalRequired = tiers.length
    ? tiers[tiers.length - 1].points
    : 0
  const percent = totalRequired > 0
    ? Math.min(100, (points / totalRequired) * 100)
    : 0

  const spendPercent = spend && spend.targetAmount > 0
    ? Math.min(100, (spend.currentAmount / spend.targetAmount) * 100)
    : 0

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Mes Points</h1>

        {/* barre de progression points */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 24,
            background: '#eee',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: '#4f46e5',
              transition: 'width .5s ease'
            }}
          />
          {tiers.map(t => {
            const pos = totalRequired ? (t.points / totalRequired) * 100 : 0
            return (
              <div
                key={t.points + '-' + t.reward}
                style={{
                  position: 'absolute',
                  left: `${pos}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: '#555',
                  transform: 'translateX(-1px)'
                }}
              />
            )
          })}
        </div>

        {/* légende points */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8
          }}
        >
          {tiers.map((t, i) => (
            <div
              key={t.points + '-' + i}
              style={{
                textAlign: 'center',
                flex: 1,
                fontSize: 12
              }}
            >
              {t.image && (
                <img
                  src={`${api}/${t.image}`}
                  alt={t.reward}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: 'cover',
                    borderRadius: 4,
                    marginBottom: 4
                  }}
                />
              )}
              <div>{t.points} pts</div>
              <div style={{ fontWeight: 500 }}>{t.reward}</div>
            </div>
          ))}
        </div>

        {/* barre dépenses – affichée seulement si configurée */}
        {spend && spend.targetAmount > 0 && (
          <>
            <h2 style={{ marginTop: '2rem' }}>Progrès dépenses</h2>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 24,
                background: '#eee',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${spendPercent}%`,
                  height: '100%',
                  background: '#16a34a',
                  transition: 'width .5s ease'
                }}
              />
            </div>
            <p style={{ marginTop: 8 }}>
              {spend.currentAmount} / {spend.targetAmount} DA
            </p>
          </>
        )}

        <p style={{ marginTop: 12 }}>
          Vous avez <strong>{points}</strong> / <strong>{totalRequired}</strong> pts
        </p>
      </main>
    </>
  )
}
