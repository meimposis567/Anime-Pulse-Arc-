import React, { useContext, useEffect, useRef, useState } from 'react'
import { ApiContext } from '../App.jsx'
import AnimeCard from './AnimeCard.jsx'

export default function SearchBar(){
  const API_BASE = useContext(ApiContext)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const deb = useRef();
  const ctrl = useRef()

  useEffect(()=>{
    if (!q){ setResults([]); return }
    setLoading(true)
    if (deb.current) clearTimeout(deb.current)
    deb.current = setTimeout(()=>{
      if (ctrl.current) ctrl.current.abort();
      ctrl.current = new AbortController();
      fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`)
        .then(r=>r.json()).then(d=>{ setResults(d||[]); setLoading(false) })
        .catch(()=>setLoading(false))
    }, 350)
    return ()=> clearTimeout(deb.current)
  }, [q, API_BASE])

  return (
    <div className="w-full">
      <input
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Search anime…" inputMode="search" autoComplete="off" enterKeyHint="search"
        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:ring focus:ring-slate-700"
      />
      <div className="mt-4">
        {loading ? <div className="text-slate-400">Searching…</div> : null}
        {(!loading && results.length>0) ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map(it => <AnimeCard key={it.id} item={it} />)}
          </div>
        ) : null}
      </div>
    </div>
  )
}
