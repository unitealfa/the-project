import React, { useEffect, useState } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import Header                            from '../components/Header'

interface Adresse { rue: string; ville: string; code_postal: string; pays: string }
interface Contact { responsable: string; telephone: string; email: string }
interface DepotDto {
  nom_depot: string
  type_depot: string
  capacite: number
  contact: Contact
  adresse: Adresse
}

export default function DepotEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dto, setDto] = useState<DepotDto>({
    nom_depot: '',
    type_depot: '',
    capacite: 0,
    contact: { responsable: '', telephone: '', email: '' },
    adresse: { rue: '', ville: '', code_postal: '', pays: '' },
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
      .then((data: DepotDto) => setDto(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiBase, id, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${apiBase}/depots/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || `Erreur ${res.status}`)
      }
      navigate('/depots')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <p style={{ padding: '1rem' }}>Chargement…</p>
      </>
    )
  }
  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '1rem', color: 'red' }}>{error}</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto' }}>
        <h2>Modifier le dépôt</h2>
        <div>
          <label>Nom du dépôt</label>
          <input
            value={dto.nom_depot}
            onChange={e => setDto({ ...dto, nom_depot: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Type</label>
          <input
            value={dto.type_depot}
            onChange={e => setDto({ ...dto, type_depot: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Capacité</label>
          <input
            type="number"
            value={dto.capacite}
            onChange={e => setDto({ ...dto, capacite: +e.target.value })}
            required
          />
        </div>
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Contact</legend>
          <div>
            <label>Responsable</label>
            <input
              value={dto.contact.responsable}
              onChange={e =>
                setDto({ ...dto, contact: { ...dto.contact, responsable: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Téléphone</label>
            <input
              value={dto.contact.telephone}
              onChange={e =>
                setDto({ ...dto, contact: { ...dto.contact, telephone: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={dto.contact.email}
              onChange={e =>
                setDto({ ...dto, contact: { ...dto.contact, email: e.target.value } })
              }
              required
            />
          </div>
        </fieldset>
        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Adresse</legend>
          <div>
            <label>Rue</label>
            <input
              value={dto.adresse.rue}
              onChange={e =>
                setDto({ ...dto, adresse: { ...dto.adresse, rue: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Ville</label>
            <input
              value={dto.adresse.ville}
              onChange={e =>
                setDto({ ...dto, adresse: { ...dto.adresse, ville: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Code postal</label>
            <input
              value={dto.adresse.code_postal}
              onChange={e =>
                setDto({ ...dto, adresse: { ...dto.adresse, code_postal: e.target.value } })
              }
              required
            />
          </div>
          <div>
            <label>Pays</label>
            <input
              value={dto.adresse.pays}
              onChange={e =>
                setDto({ ...dto, adresse: { ...dto.adresse, pays: e.target.value } })
              }
              required
            />
          </div>
        </fieldset>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Enregistrer
        </button>
      </form>
    </>
  )
}
