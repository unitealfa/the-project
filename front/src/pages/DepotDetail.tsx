// front/src/pages/DepotDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'

interface Responsable {
  _id: string
  nom: string
  prenom: string
  email: string
  num: string
}

interface Depot {
  _id: string
  nom_depot: string
  type_depot: string
  capacite: number
  adresse: {
    rue: string
    ville: string
    code_postal: string
    pays: string
  }
  coordonnees?: { latitude: number; longitude: number } | null
  responsable_id?: Responsable | null
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
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json() })
      .then(setDepot)
      .catch(err => setError(err.message))
  }, [apiBase, id, token])

  if (error) return <><Header /><p style={{ color:'red', padding:'1rem' }}>{error}</p></>
  if (!depot) return <><Header /><p style={{ padding:'1rem' }}>Chargement…</p></>

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <h1>Détails du dépôt</h1>
        <p><strong>Nom :</strong> {depot.nom_depot}</p>
        <p><strong>Type :</strong> {depot.type_depot}</p>
        <p><strong>Capacité :</strong> {depot.capacite}</p>

        <fieldset style={{ marginTop:'1rem' }}>
          <legend>Adresse</legend>
          <p>{depot.adresse.rue}, {depot.adresse.ville}</p>
          <p>{depot.adresse.code_postal} – {depot.adresse.pays}</p>
        </fieldset>

        {depot.coordonnees && (
          <fieldset style={{ marginTop:'1rem' }}>
            <legend>Coordonnées</legend>
            <p><strong>Lat :</strong> {depot.coordonnees.latitude}</p>
            <p><strong>Lng :</strong> {depot.coordonnees.longitude}</p>
          </fieldset>
        )}

        {depot.responsable_id && (
          <fieldset style={{ marginTop:'1rem' }}>
            <legend>Responsable dépôt</legend>
            <p><strong>Nom :</strong> {depot.responsable_id.prenom} {depot.responsable_id.nom}</p>
            <p><strong>Email :</strong> {depot.responsable_id.email}</p>
            <p><strong>Téléphone :</strong> {depot.responsable_id.num}</p>
          </fieldset>
        )}

        <p style={{ marginTop:'1rem' }}>
          <em>Créé le {new Date(depot.date_creation).toLocaleDateString()}</em>
        </p>
      </div>
    </>
  )
}
