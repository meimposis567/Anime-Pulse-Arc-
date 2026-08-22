import React, { useContext, useEffect, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { ApiContext } from '../App.jsx'
import AnimeCard from './AnimeCard.jsx'
import { SkeletonGrid } from './SkeletonCard.jsx'

export default function SearchBar() {
  const API_BASE = useContext(ApiContext)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const deb = useRef()
  const ctrl = useRef()
  const inputRef = useRef(null)

  /* "/" focuses the search box, Escape clears it. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQ('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    setTouched(true)
    clearTimeout(deb.current)
    deb.current = setTimeout(() => {
      ctrl.current?.abort()
      ctrl.current = new AbortController()
      fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.current.signal })
        .then((r) => r.json())
        .then((d) => { setResults(d || []); setLoading(false) })
        .catch((e) => { if (e.name !== 'AbortError') setLoading(false) })
    }, 350)
    return () => clearTimeout(deb.current)
  }, [q, API_BASE])

  const showEmpty = touched && !loading && q.trim() && results.length === 0

  return (
    <div className="w-full">
      {/* Input */}
      <div className="group relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-300"
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any anime…  (press / )"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Search anime"
          className="arc-input !rounded-2xl !py-3.5 !pl-11 !pr-11 font-display text-[15px] tracking-wide"
        />
        {loading ? (
          <Loader2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-cyan-300" />
        ) : q ? (
          <button
            onClick={() => { setQ(''); inputRef.current?.focus() }}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-pink-300"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* Results */}
      {(loading || results.length > 0 || showEmpty) && (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-display text-[10px] font-semibold tracking-[0.35em] text-cyan-400/80">
              検索結果
            </span>
            <span className="text-xs text-slate-500">
              {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'} for “${q.trim()}”`}
            </span>
            <span className="arc-rule ml-1 flex-1" />
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : showEmpty ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
              <div className="mb-2 text-3xl">(╥﹏╥)</div>
              <p className="text-sm text-slate-400">
                Nothing matched “<span className="text-slate-200">{q.trim()}</span>”.
              </p>
              <p className="mt-1 text-xs text-slate-600">Try the romaji title, or fewer words.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((it, i) => <AnimeCard key={it.id} item={it} index={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
