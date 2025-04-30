import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'

interface Member {
  _id: string
  nom: string
  prenom: string
  fonction?: string          // ex. “Livreur”
}

export default function DeliveryTeam () {
  const { depotId = '' }        = useParams<{ depotId: string }>()
  const location                = useLocation()          // ← pour détecter le retour
  const nav                     = useNavigate()
  const apiBase                 = import.meta.env.VITE_API_URL
  const token                   = localStorage.getItem('token') || ''

  const [list, setList]         = useState<Member[]>([])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(true)

  /* Re-fetch à CHAQUE changement de location.key (remount virtuel) */
  useEffect(() => {
    setLoading(true)
    fetch(`${apiBase}/teams/${depotId}?role=livraison`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((arr: Member[]) => setList(arr))
      .catch(() => setError('Impossible de charger l’équipe'))
      .finally(() => setLoading(false))
  }, [apiBase, depotId, token, location.key]) // 👈

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Équipe Livraison</h1>

          <button
            onClick={() => nav(`/teams/${depotId}/livraison/add`)}
            style={{ padding: '.5rem 1rem', background: '#4f46e5', color: '#fff',
                     border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            + Ajouter un membre
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        {loading && <p style={{ marginTop: '1rem' }}>Chargement…</p>}

        {!loading && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                {['Nom', 'Prénom', 'Fonction'].map(h => (
                  <th key={h} style={{ padding: '.5rem', borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m._id}>
                  <td style={{ padding: '.5rem 0' }}>{m.nom}</td>
                  <td style={{ padding: '.5rem 0' }}>{m.prenom}</td>
                  <td style={{ padding: '.5rem 0' }}>{m.fonction ?? '—'}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '.75rem', fontStyle: 'italic' }}>
                    Aucun membre
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
