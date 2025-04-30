import React, { useEffect, useState } from 'react'
import { useParams, useNavigate }     from 'react-router-dom'
import Header                         from '../components/Header'
import { apiFetch }                   from '../utils/api'

/* ────────── Constantes UI ───────────────────────────────────── */
const CARD_MIN_W   = 320
const CARD_MIN_H   = 190
const TRANSITION   = 'transform .25s ease, box-shadow .25s ease'
const BASE_SHADOW  = '0 2px 6px rgba(0,0,0,.08)'
const HOVER_SHADOW = '0 6px 14px rgba(0,0,0,.15)'
/* ────────────────────────────────────────────────────────────── */

/* type minimal pour récupérer le nom du dépôt ----------------- */
interface Depot { _id:string; nom_depot:string }
/* ------------------------------------------------------------- */

export default function TeamManage () {
  const { depotId = '' } = useParams<{ depotId:string }>()
  const navigate         = useNavigate()

  const [hover, setHover]   = useState<number|null>(null)
  const [depot, setDepot]   = useState<Depot | null>(null)
  const [error, setError]   = useState('')
  const [loading,setLoading]= useState(true)

  /* charge UNIQUEMENT le nom du dépôt -------------------------- */
  useEffect(() => {
    let cancel = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiFetch(`/depots/${depotId}`)
        if (cancel) return
        setDepot(await res.json())
      } catch { !cancel && setError('Impossible de charger le dépôt') }
      finally  { !cancel && setLoading(false) }
    }
    load()
    return () => { cancel = true }
  }, [depotId])
  /* ------------------------------------------------------------ */

  /* composant Carte cliquable ---------------------------------- */
  const Card = (
    { idx, title, suffix }:{
      idx:number; title:string; suffix:string
    }) => {
    const isHover = hover === idx
    return (
      <div
        onMouseEnter={()=>setHover(idx)}
        onMouseLeave={()=>setHover(null)}
        onClick={()=>navigate(`/teams/${depotId}/${suffix}`)}
        style={{
          flex:1,
          minWidth:CARD_MIN_W,
          minHeight:CARD_MIN_H,
          padding:'1.5rem',
          border:'1px solid #e5e7eb',
          borderRadius:18,
          background:'#fff',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'1.15rem',
          fontWeight:600,
          cursor:'pointer',
          userSelect:'none',
          boxShadow:isHover ? HOVER_SHADOW : BASE_SHADOW,
          transform:isHover ? 'scale(1.06)' : 'scale(1)',
          transition:TRANSITION,
        }}
      >
        {title}
      </div>
    )
  }
  /* ------------------------------------------------------------ */

  return (
    <>
      <Header />
      <div style={{padding:'1rem',fontFamily:'Arial, sans-serif'}}>

        {/* ───── titre ───── */}
        {error && <p style={{color:'red'}}>{error}</p>}
        <h1 style={{margin:'0 0 1.5rem 0'}}>
          Gestion de l’équipe
          {depot && !loading && <> du dépôt « {depot.nom_depot} »</>}
        </h1>

        {/* ───── cartes (livraison / pré-vente / entrepôt) ───── */}
        <div style={{
          display:'flex',
          gap:'1.5rem',
          flexWrap:'wrap',
          justifyContent:'center',
        }}>
          <Card idx={0} title='Équipe Livraison'  suffix='livraison' />
          <Card idx={1} title='Équipe Pré-vente'  suffix='prevente'   />
          <Card idx={2} title='Équipe Entrepôt'   suffix='entrepot'   />
        </div>
      </div>
    </>
  )
}
