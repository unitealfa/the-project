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
  type: 'points' | 'spend' | 'repeat'
  amount?: number
}

interface RepeatReward {
  _id:   string
  every: number
  reward: string
  image?: string
}

export default function LoyaltyAdmin() {
  const api       = import.meta.env.VITE_API_URL
  const token     = localStorage.getItem('token') || ''
  const userRaw   = localStorage.getItem('user')
  const user      = userRaw ? JSON.parse(userRaw) : null
  const companyId = user?.company as string

  // Ratio & Paliers
  const [ratioAmount, setRatioAmount] = useState(0)
  const [ratioPoints, setRatioPoints] = useState(0)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [editedTiers, setEditedTiers] = useState<Record<string, { points: number; reward: string; imageFile?: File }>>({})

  // Défis répétitifs
  const [repeatRewards, setRepeatRewards] = useState<RepeatReward[]>([])
  const [editedRepeats, setEditedRepeats] = useState<Record<string, { every: number; reward: string; imageFile?: File }>>({})
  const [newRepeat, setNewRepeat] = useState<{
    every: number
    reward: string
    imageFile: File | null
    preview: string | null
  }>({ every: 0, reward: '', imageFile: null, preview: null })

  // Récompenses pending
  const [pending, setPending] = useState<Reward[]>([])

  useEffect(() => {
    if (!companyId || !token) return

    // Charger ratio + paliers
    fetch(`${api}/loyalty/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setRatioAmount(data.ratio.amount)
        setRatioPoints(data.ratio.points)
        setTiers(data.tiers)
        const initT: any = {}
        data.tiers.forEach((t: Tier) => {
          initT[t._id] = { points: t.points, reward: t.reward }
        })
        setEditedTiers(initT)
      })
      .catch(console.error)

    // Charger défis répétitifs
    fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((data: RepeatReward[]) => {
        setRepeatRewards(data)
        const initR: any = {}
        data.forEach(rr => {
          initR[rr._id] = { every: rr.every, reward: rr.reward }
        })
        setEditedRepeats(initR)
      })
      .catch(console.error)

    // Charger récompenses en attente
    fetch(`${api}/loyalty/${companyId}/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPending)
      .catch(console.error)
  }, [api, token, companyId])

  // Mettre à jour ratio
  const handleRatioSubmit = (e: FormEvent) => {
    e.preventDefault()
    fetch(`${api}/loyalty/${companyId}/ratio`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: ratioAmount, points: ratioPoints })
    }).catch(console.error)
  }

  // Gestion des paliers
  const updateTier = async (id: string) => {
    const { points, reward, imageFile } = editedTiers[id]
    const form = new FormData()
    form.append('points', points.toString())
    form.append('reward', reward)
    if (imageFile) form.append('image', imageFile)

    const res = await fetch(`${api}/loyalty/${companyId}/tiers/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })
    if (res.ok) {
      const data = await res.json()
      setTiers(data.tiers)
    } else {
      alert('Erreur mise à jour palier')
    }
  }

  const deleteTier = async (id: string) => {
    await fetch(`${api}/loyalty/${companyId}/tiers/${id}/delete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setTiers(ts => ts.filter(t => t._id !== id))
    setEditedTiers(et => { delete et[id]; return { ...et } })
  }

  const addTier = () => {
    const p = prompt('Points requis ?')
    const r = prompt('Nom de la récompense ?')
    if (!p || !r) return
    fetch(`${api}/loyalty/${companyId}/tiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ points: +p, reward: r })
    })
      .then(r => r.json())
      .then(data => setTiers(data.tiers))
      .catch(() => alert('Erreur création palier'))
  }

  // Gestion des défis répétitifs
  const addRepeatReward = async () => {
    const form = new FormData()
    form.append('every', newRepeat.every.toString())
    form.append('reward', newRepeat.reward)
    if (newRepeat.imageFile) form.append('image', newRepeat.imageFile)

    const res = await fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })
    if (res.ok) {
      const data = await res.json()
      setRepeatRewards(data.repeatRewards)
    } else {
      alert('Erreur création défi répétitif')
    }
    setNewRepeat({ every: 0, reward: '', imageFile: null, preview: null })
  }

  const updateRepeatReward = async (id: string) => {
    const { every, reward, imageFile } = editedRepeats[id]
    const form = new FormData()
    form.append('every', every.toString())
    form.append('reward', reward)
    if (imageFile) form.append('image', imageFile)

    const res = await fetch(`${api}/loyalty/${companyId}/repeat-rewards/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })
    if (res.ok) {
      const data = await res.json()
      setRepeatRewards(data.repeatRewards)
    } else {
      alert('Erreur mise à jour défi répétitif')
    }
  }

  const deleteRepeatReward = async (id: string) => {
    await fetch(`${api}/loyalty/${companyId}/repeat-rewards/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setRepeatRewards(rr => rr.filter(r => r._id !== id))
    setEditedRepeats(er => { delete er[id]; return { ...er } })
  }

  // Livraison des récompenses
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

        {/* Ratio & Paliers */}
        <section style={{ marginBottom: '2rem' }}>
          <h2>Ratio</h2>
          <form onSubmit={handleRatioSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label>
              Montant (€):
              <input type="number" min={1} value={ratioAmount} onChange={e => setRatioAmount(+e.target.value)} />
            </label>
            <label>
              Points:
              <input type="number" min={1} value={ratioPoints} onChange={e => setRatioPoints(+e.target.value)} />
            </label>
            <button type="submit">Enregistrer</button>
          </form>

          <h3 style={{ marginTop: '1rem' }}>Paliers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Image</th><th>Pts</th><th>Récompense</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tiers.map(t => {
                const edit = editedTiers[t._id]
                return (
                  <tr key={t._id}>
                    <td style={{ textAlign: 'center' }}>
                      {t.image && <img src={`${api}/${t.image}`} width={40} height={40} style={{ objectFit: 'cover' }} />}
                      <input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const f = e.target.files?.[0]
                        if (f) setEditedTiers(et => ({ ...et, [t._id]: { ...edit, imageFile: f } }))
                      }} />
                    </td>
                    <td><input type="number" min={1} value={edit.points} onChange={e => setEditedTiers(et => ({ ...et, [t._id]: { ...edit, points: +e.target.value } }))} /></td>
                    <td><input type="text" value={edit.reward} onChange={e => setEditedTiers(et => ({ ...et, [t._id]: { ...edit, reward: e.target.value } }))} /></td>
                    <td>
                      <button onClick={() => updateTier(t._id)}>Enregistrer</button>
                      <button onClick={() => deleteTier(t._id)} style={{ marginLeft: 8, color: 'red' }}>Supprimer</button>
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  <button onClick={addTier}>+ Ajouter un palier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Défis Répétitifs */}
        <section style={{ marginBottom: '2rem' }}>
          <h2>Défis Répétitifs (tout les X point il gagne la recompense)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Pts</th><th>Récompense</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {repeatRewards.map(r => {
                const edit = editedRepeats[r._id]
                return (
                  <tr key={r._id}>
                    <td><input type="number" min={1} value={edit.every} onChange={e => setEditedRepeats(er => ({ ...er, [r._id]: { ...edit, every: +e.target.value } }))} /></td>
                    <td><input type="text" value={edit.reward} onChange={e => setEditedRepeats(er => ({ ...er, [r._id]: { ...edit, reward: e.target.value } }))} /></td>
                    <td style={{ textAlign: 'center' }}>
                      {r.image && <img src={`${api}/${r.image}`} width={40} height={40} style={{ objectFit: 'cover' }} />}
                      <input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const f = e.target.files?.[0]
                        if (f) setEditedRepeats(er => ({ ...er, [r._id]: { ...edit, imageFile: f } }))
                      }} />
                    </td>
                    <td>
                      <button onClick={() => updateRepeatReward(r._id)}>Enregistrer</button>
                      <button onClick={() => deleteRepeatReward(r._id)} style={{ marginLeft: 8, color: 'red' }}>Supprimer</button>
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td><input type="number" min={1} value={newRepeat.every} onChange={e => setNewRepeat(nr => ({ ...nr, every: +e.target.value }))} /></td>
                <td><input type="text" value={newRepeat.reward} onChange={e => setNewRepeat(nr => ({ ...nr, reward: e.target.value }))} /></td>
                <td style={{ textAlign: 'center' }}>
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files?.[0] || null
                    setNewRepeat(nr => ({ ...nr, imageFile: f, preview: f ? URL.createObjectURL(f) : null }))
                  }} />
                  {newRepeat.preview && <img src={newRepeat.preview} width={40} height={40} style={{ objectFit: 'cover', marginLeft: 4 }} />}
                </td>
                <td><button onClick={addRepeatReward}>Ajouter</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Clients à récompenser */}
        <section>
          <h2>Clients à récompenser</h2>
          <button onClick={deliverAll}>Livrer tout le monde</button>
          <ul>
            {pending.map(p => (
              <li key={p._id}>
                {p.client.nom_client} – {p.type === 'spend' ? `${p.amount} dépensés` : `${p.points} pts`}
                <button onClick={() => deliver(p.client._id, p.points)} style={{ marginLeft: 8 }}>Livrer</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
