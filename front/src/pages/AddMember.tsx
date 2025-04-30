import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'

export default function AddMember() {
  const { depotId = '' } = useParams<{ depotId: string }>()
  const nav               = useNavigate()
  const apiBase           = import.meta.env.VITE_API_URL
  const token             = localStorage.getItem('token') || ''

  const [f, setF] = useState({
    nom: '', prenom: '', email: '', num: '', password: '',
    role: 'Administrateur des ventes',
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch(`${apiBase}/teams/${depotId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({
          role      : 'livraison',   // catégorie
          fonction  : f.role,        // rôle précis
          nom       : f.nom,
          prenom    : f.prenom,
          email     : f.email,
          num       : f.num,
          password  : f.password,
        }),
      })
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.message || r.status.toString())
      }
      /* ──> on revient sur la page Liste : le replace force le remount */
      nav(`/teams/${depotId}/livraison`, { replace: true })
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header />
      <form
        onSubmit={submit}
        style={{ maxWidth: 480, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '.8rem' }}
      >
        <h1>Nouveau membre – Livraison</h1>

        <input placeholder='Nom' value={f.nom}
               onChange={e => setF({ ...f, nom: e.target.value })} required />

        <input placeholder='Prénom' value={f.prenom}
               onChange={e => setF({ ...f, prenom: e.target.value })} required />

        <input type='email' placeholder='Email' value={f.email}
               onChange={e => setF({ ...f, email: e.target.value })} required />

        <input placeholder='Téléphone' value={f.num}
               onChange={e => setF({ ...f, num: e.target.value })} required />

        <input type='password' placeholder='Mot de passe' value={f.password}
               onChange={e => setF({ ...f, password: e.target.value })} required />

        <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
          <option value='Administrateur des ventes'>Administrateur des ventes</option>
          <option value='Livreur'>Livreur</option>
          <option value='Chauffeur'>Chauffeur</option>
        </select>

        <button type='submit' disabled={saving}
                style={{ padding: '.6rem 1.4rem', background: '#4f46e5', color: '#fff',
                         border: 'none', borderRadius: 8 }}>
          {saving ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </>
  )
}
