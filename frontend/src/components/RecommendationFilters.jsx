import React, { useContext, useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, RotateCcw, Tv, Search as SearchIcon } from 'lucide-react'
import { ApiContext } from '../App.jsx'
import AnimeCard from './AnimeCard.jsx'
import { SkeletonGrid } from './SkeletonCard.jsx'

const formats = ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA']
const statuses = ['FINISHED', 'RELEASING', 'HIATUS', 'CANCELLED']
const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
const platforms = ['Crunchyroll', 'Netflix', 'Prime', 'HiDive', 'Hulu', 'HiAnime']

const genreOptions = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller',
]

const SEASON_ICON = { WINTER: '❄', SPRING: '🌸', SUMMER: '☀', FALL: '🍁' }

const EMPTY = {
  genres: '', format: '', status: '', season: '', year: '',
  minScore: '', maxScore: '', sort: 'POPULARITY_DESC', platform: '',
}

function Field({ label, jp, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-2">
        <span className="font-display text-[11px] font-semibold tracking-[0.18em] text-slate-300">
          {label}
        </span>
        {jp && <span className="text-[9px] tracking-widest text-slate-600">{jp}</span>}
      </label>
      {children}
    </div>
  )
}

export default function RecommendationFilters() {
  const API_BASE = useContext(ApiContext)
  const [params, setParams] = useState(EMPTY)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)

  const update = (k, v) => setParams((p) => ({ ...p, [k]: v }))

  /* Genres are stored as the same comma string the API expects, but edited
     as toggleable chips — no more guessing the exact spelling. */
  const selectedGenres = useMemo(
    () => params.genres.split(',').map((s) => s.trim()).filter(Boolean),
    [params.genres]
  )

  const toggleGenre = (g) => {
    const next = selectedGenres.includes(g)
      ? selectedGenres.filter((x) => x !== g)
      : [...selectedGenres, g]
    update('genres', next.join(','))
  }

  const activeCount = useMemo(
    () => Object.entries(params).filter(([k, v]) => k !== 'sort' && String(v ?? '').length > 0).length,
    [params]
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    const qs = Object.entries(params)
      .filter(([, v]) => String(v ?? '').length > 0)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    fetch(`${API_BASE}/api/recommendations?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        setItems(Array.isArray(d) ? d : [])
        setLoading(false)
        setFirstLoad(false)
      })
      .catch(() => { if (active) { setLoading(false); setFirstLoad(false) } })

    return () => { active = false }
  }, [params, API_BASE])

  return (
    <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
      {/* ───────── Filter panel ───────── */}
      <aside className="arc-glass arc-ring h-max rounded-3xl p-5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-cyan-300" />
          <h2 className="arc-title font-display text-lg font-bold tracking-wide">Filters</h2>
          {activeCount > 0 && (
            <span className="ml-auto grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-pink-500/25 px-1.5 text-[10px] font-bold text-pink-200 ring-1 ring-pink-400/40">
              {activeCount}
            </span>
          )}
        </div>

        <div className="space-y-5">
          {/* Genre chips */}
          <Field label="GENRES" jp="ジャンル">
            <div className="flex flex-wrap gap-1.5">
              {genreOptions.map((g) => {
                const on = selectedGenres.includes(g)
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    aria-pressed={on}
                    className={`arc-pill transition-all duration-300 hover:-translate-y-0.5 ${on ? 'arc-pill--active' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Format + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="FORMAT" jp="形式">
              <select className="arc-input text-sm" value={params.format} onChange={(e) => update('format', e.target.value)}>
                <option value="">Any</option>
                {formats.map((f) => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
              </select>
            </Field>
            <Field label="STATUS" jp="状態">
              <select className="arc-input text-sm" value={params.status} onChange={(e) => update('status', e.target.value)}>
                <option value="">Any</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {/* Season chips */}
          <Field label="SEASON" jp="季節">
            <div className="grid grid-cols-4 gap-1.5">
              {seasons.map((s) => {
                const on = params.season === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('season', on ? '' : s)}
                    aria-pressed={on}
                    className={`rounded-lg border px-1 py-1.5 text-[10px] font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${
                      on
                        ? 'border-pink-400/70 bg-pink-500/20 text-pink-100 shadow-neon-pink'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="mr-0.5">{SEASON_ICON[s]}</span>
                    {s.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Year + Sort */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="YEAR" jp="年">
              <input
                type="number" min="1940" max="2100" placeholder="2021"
                className="arc-input text-sm"
                value={params.year}
                onChange={(e) => update('year', e.target.value)}
              />
            </Field>
            <Field label="SORT" jp="並び">
              <select className="arc-input text-sm" value={params.sort} onChange={(e) => update('sort', e.target.value)}>
                <option value="POPULARITY_DESC">Popularity ↓</option>
                <option value="SCORE_DESC">Score ↓</option>
                <option value="TRENDING_DESC">Trending ↓</option>
                <option value="FAVOURITES_DESC">Favourites ↓</option>
                <option value="START_DATE_DESC">Newest</option>
                <option value="START_DATE">Oldest</option>
              </select>
            </Field>
          </div>

          {/* Score range */}
          <Field label="SCORE RANGE" jp="評価">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number" min="0" max="100" placeholder="min 60"
                className="arc-input text-sm"
                value={params.minScore}
                onChange={(e) => update('minScore', e.target.value)}
              />
              <input
                type="number" min="0" max="100" placeholder="max 100"
                className="arc-input text-sm"
                value={params.maxScore}
                onChange={(e) => update('maxScore', e.target.value)}
              />
            </div>
          </Field>

          {/* Platform */}
          <Field label="PLATFORM" jp="配信">
            <div className="relative">
              <Tv size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                className="arc-input !pl-9 text-sm"
                value={params.platform}
                onChange={(e) => update('platform', e.target.value)}
              >
                <option value="">Any platform</option>
                {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </Field>

          <button
            onClick={() => setParams(EMPTY)}
            disabled={activeCount === 0}
            className="arc-btn w-full justify-center font-display text-xs disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RotateCcw size={13} />
            Reset filters
          </button>
        </div>
      </aside>

      {/* ───────── Results ───────── */}
      <div className="section">
        <div className="mb-5 flex items-center gap-3">
          <span className="font-display text-[10px] font-semibold tracking-[0.35em] text-pink-400/80">
            おすすめ
          </span>
          <span className="text-xs text-slate-500">
            {loading ? 'Finding matches…' : `${items.length} title${items.length === 1 ? '' : 's'}`}
          </span>
          <span className="arc-rule ml-1 flex-1" />
        </div>

        {loading ? (
          <SkeletonGrid count={12} />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <SearchIcon size={26} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-400">No titles match every filter.</p>
            <p className="mt-1 text-xs text-slate-600">
              Platform + genre combinations get narrow fast — try loosening one.
            </p>
            {activeCount > 0 && (
              <button onClick={() => setParams(EMPTY)} className="arc-btn mt-5 font-display text-xs">
                <RotateCcw size={13} />
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((it, i) => <AnimeCard key={it.id} item={it} index={firstLoad ? i : 0} />)}
          </div>
        )}
      </div>
    </div>
  )
}
