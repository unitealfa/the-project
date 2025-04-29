import React, { useEffect, useState } from 'react'
import { useParams }                      from 'react-router-dom'
import Header                             from '../components/Header'

interface Depot {
  _id: string
  nom_depot: string
  type_depot: string
  capacite: number
  contact: {
    responsable: string
    telephone: string
    email: string
  }
  adresse: {
    rue: string
    ville: string
    code_postal: string
    pays: string
  }
  date_creation: string
}

export default function DepotDetail() {
  const { id } = useParams<{ id: string }>()
  const [depot, setDepot] = useState<Depot | null>(null)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token') || ''
  const apiBase = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetch(`${apiBase}/depots/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((d: Depot) => setDepot(d))
      .catch(err => setError(err.message))
  }, [apiBase, id, token])

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
      </>
    )
  }
  if (!depot) {
    return (
      <>
        <Header />
        <p style={{ padding: '1rem' }}>Chargement…</p>
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Détails du dépôt</h1>
        <p><strong>Nom :</strong> {depot.nom_depot}</p>
        <p><strong>Type :</strong> {depot.type_depot}</p>
        <p><strong>Capacité :</strong> {depot.capacite}</p>
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Contact</legend>
          <p><strong>Responsable :</strong> {depot.contact.responsable}</p>
          <p><strong>Tél :</strong> {depot.contact.telephone}</p>
          <p><strong>Email :</strong> {depot.contact.email}</p>
        </fieldset>
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Adresse</legend>
          <p>{depot.adresse.rue}, {depot.adresse.ville}</p>
          <p>{depot.adresse.code_postal} – {depot.adresse.pays}</p>
        </fieldset>
        <p style={{ marginTop: '1rem' }}>
          <em>Créé le {new Date(depot.date_creation).toLocaleDateString()}</em>
        </p>
      </div>
    </>
  )
}
