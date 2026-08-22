import React, { useContext, useEffect, useState } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import AnimeCard from './AnimeCard.jsx'
import { SkeletonGrid } from './SkeletonCard.jsx'
import { ApiContext } from '../App.jsx'

export default function FeaturedGrid() {
  const API_BASE = useContext(ApiContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    setFailed(false)
    fetch(`${API_BASE}/api/featured`)
      .then((r) => r.json())
      .then((d) => {
        if (cancel) return
        setItems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => {
        if (cancel) return
        setFailed(true)
        setLoading(false)
      })
    return () => { cancel = true }
  }, [API_BASE, attempt])

  if (loading) return <SkeletonGrid count={12} />

  if (failed || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
        <AlertCircle size={26} className="mx-auto mb-3 text-pink-400/70" />
        <p className="text-sm text-slate-400">
          {failed ? "Couldn't reach the API." : 'No featured titles right now.'}
        </p>
        <button onClick={() => setAttempt((a) => a + 1)} className="arc-btn mt-5 font-display text-xs">
          <RotateCw size={13} />
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((it, i) => <AnimeCard key={it.id} item={it} index={i} />)}
    </div>
  )
}
