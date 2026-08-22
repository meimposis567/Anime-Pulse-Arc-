import SkeletonCard from "./SkeletonCard.jsx";
import React, { useEffect, useState, useContext } from 'react'
import AnimeCard from './AnimeCard.jsx'
import { ApiContext } from '../App.jsx'

export default function FeaturedGrid(){
  const API_BASE = useContext(ApiContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancel=false
    setLoading(true)
    fetch(`${API_BASE}/api/featured`).then(r=>r.json()).then(d=>{
      if(!cancel){ setItems(d||[]); setLoading(false) }
    }).catch(()=>setLoading(false))
    return ()=>{ cancel=true }
  },[API_BASE])

  if (loading) return <div className="text-slate-400">Loading featured…</div>

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map(it => <AnimeCard key={it.id} item={it} />)}
    </div>
  )
}
