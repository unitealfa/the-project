// front/src/pages/LoyaltyAdmin.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import Header from '../components/Header'

interface Tier {
  _id:    string
  points: number
  reward: string
  image?: string
}

interface Reward {
  _id:    string
  client: { _id: string; nom_client: string }
  points: number
}

export default function LoyaltyAdmin() {
  const api       = import.meta.env.VITE_API_URL
  const token     = localStorage.getItem('token') || ''
  const userRaw   = localStorage.getItem('user')
  const user      = userRaw ? JSON.parse(userRaw) : null
  const companyId = user?.company

  const [ratioAmount, setRatioAmount] = useState(0)
  const [ratioPoints, setRatioPoints] = useState(0)
  const [tiers,       setTiers]       = useState<Tier[]>([])
  const [pending,     setPending]     = useState<Reward[]>([])

  // états de modification par palier
  const [edited, setEdited] = useState<{
    [tierId: string]: { points: number; reward: string; imageFile?: File }
  }>({})

  useEffect(() => {
    if (!companyId || !token) return

    // charger ratio + paliers
    fetch(`${api}/loyalty/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setRatioAmount(data.ratio.amount)
        setRatioPoints(data.ratio.points)
        setTiers(data.tiers)
        // initialiser edited avec les valeurs existantes
        const init: any = {}
        data.tiers.forEach((t: Tier) => {
          init[t._id] = { points: t.points, reward: t.reward }
        })
        setEdited(init)
      })
      .catch(console.error)

    // charger les récompenses en attente
    fetch(`${api}/loyalty/${companyId}/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPending)
      .catch(console.error)
  }, [api, token, companyId])

  // soumettre le ratio
  const handleRatioSubmit = (e: FormEvent) => {
    e.preventDefault()
    fetch(`${api}/loyalty/${companyId}/ratio`, {
      method:  'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: ratioAmount, points: ratioPoints })
    }).catch(console.error)
  }

  // ajouter un palier
  const addTier = async () => {
    const p = prompt('Points requis ?')
    const r = prompt('Nom de la récompense ?')
    if (!p || !r) return

    const res = await fetch(`${api}/loyalty/${companyId}/tiers`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ points: +p, reward: r })
    })
    const data = await res.json()
    if (!res.ok) return alert(`Erreur : ${data.message || res.statusText}`)
    setTiers(data.tiers)
    setEdited(ed => ({
      ...ed,
      [data.tiers.slice(-1)[0]._id]: {
        points: data.tiers.slice(-1)[0].points,
        reward: data.tiers.slice(-1)[0].reward
      }
    }))
  }

  // mettre à jour un palier
  const updateTier = async (tierId: string) => {
    const { points, reward, imageFile } = edited[tierId]
    const form = new FormData()
    form.append('points', points.toString())
    form.append('reward', reward)
    if (imageFile) form.append('image', imageFile)

    const res = await fetch(
      `${api}/loyalty/${companyId}/tiers/${tierId}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      return alert(`Erreur modification : ${err?.message || res.statusText}`)
    }
    const prog = await res.json()
    setTiers(prog.tiers)
  }

  // supprimer un palier
  const deleteTier = async (tierId: string) => {
    await fetch(
      `${api}/loyalty/${companyId}/tiers/${tierId}/delete`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    setTiers(tiers.filter(t => t._id !== tierId))
    setEdited(ed => {
      const c = { ...ed }
      delete c[tierId]
      return c
    })
  }

  // livrer une récompense
  const deliver = (clientId: string, pts: number) => {
    fetch(`${api}/loyalty/${companyId}/deliver/${clientId}/${pts}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() =>
      setPending(p => p.filter(x => x.client._id !== clientId || x.points !== pts))
    )
  }

  const deliverAll = () => {
    fetch(`${api}/loyalty/${companyId}/deliver-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setPending([]))
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Programme Fidélité</h1>

        {/* Ratio */}
        <form onSubmit={handleRatioSubmit} style={{ marginBottom: '2rem' }}>
          <label>
            Montant (€) :
            <input
              type="number"
              min={1}
              required
              value={ratioAmount}
              onChange={e => setRatioAmount(+e.target.value)}
            />
          </label>
          <label style={{ marginLeft: '1rem' }}>
            Points :
            <input
              type="number"
              min={1}
              required
              value={ratioPoints}
              onChange={e => setRatioPoints(+e.target.value)}
            />
          </label>
          <button type="submit" style={{ marginLeft: '1rem' }}>
            Enregistrer ratio
          </button>
        </form>

        {/* Paliers */}
        <section style={{ marginBottom: '2rem' }}>
          <h2>Paliers</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Points</th>
                <th>Récompense</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(t => {
                const edit = edited[t._id] || { points: t.points, reward: t.reward }
                return (
                  <tr key={t._id}>
                    <td style={{ textAlign: 'center' }}>
                      {t.image && (
                        <img
                          src={`${api}/${t.image}`}
                          alt=""
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setEdited(ed => ({
                                ...ed,
                                [t._id]: { ...ed[t._id], imageFile: file }
                              }))
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={edit.points}
                        onChange={e =>
                          setEdited(ed => ({
                            ...ed,
                            [t._id]: { ...ed[t._id], points: +e.target.value }
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={edit.reward}
                        onChange={e =>
                          setEdited(ed => ({
                            ...ed,
                            [t._id]: { ...ed[t._id], reward: e.target.value }
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button onClick={() => updateTier(t._id)}>
                        Enregistrer
                      </button>
                      <button
                        onClick={() => deleteTier(t._id)}
                        style={{ marginLeft: 8, color: 'red' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button onClick={addTier} style={{ marginTop: '1rem' }}>
            Ajouter un palier
          </button>
        </section>

        {/* Clients à récompenser */}
        <section>
          <h2>Clients à récompenser</h2>
          <button onClick={deliverAll}>Livrer tout le monde</button>
          <ul>
            {pending.map(p => (
              <li key={`${p.client._id}-${p.points}`}>
                {p.client.nom_client} – {p.points} pts
                <button
                  onClick={() => deliver(p.client._id, p.points)}
                  style={{ marginLeft: 8 }}
                >
                  Livrer
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
