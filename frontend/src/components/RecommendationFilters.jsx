import React, { useContext, useEffect, useState } from 'react'
import { ApiContext } from '../App.jsx'
import AnimeCard from './AnimeCard.jsx'

const formats = ['TV','TV_SHORT','MOVIE','SPECIAL','OVA','ONA']
const statuses = ['FINISHED','RELEASING','HIATUS','CANCELLED']
const seasons = ['WINTER','SPRING','SUMMER','FALL']
const platforms = ['Crunchyroll','Netflix','Prime','HiDive','Hulu','HiAnime']

// AniList common genres
const genreOptions = [
  "Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Horror","Mahou Shoujo",
  "Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life",
  "Sports","Supernatural","Thriller"
]

export default function RecommendationFilters(){
  const API_BASE = useContext(ApiContext)
  const [params, setParams] = useState({
    genres:'', format:'', status:'', season:'', year:'',
    minScore:'', maxScore:'', sort:'POPULARITY_DESC', platform:''
  })

  const [items, setItems] = useState([])          // ✅ shown anime list
  const [defaultItems, setDefaultItems] = useState([]) // ✅ backup (popular list)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  function update(k,v){ setParams(p=>({...p, [k]:v})) }

  function handleGenreChange(e){
    const value = e.target.value
    update('genres', value)

    const parts = value.split(',')
    const last = parts[parts.length-1].trim().toLowerCase()

    if(last.length > 0){
      setSuggestions(
        genreOptions.filter(g => g.toLowerCase().startsWith(last))
      )
    } else {
      setSuggestions([])
    }
  }

  function pickSuggestion(s){
    const parts = params.genres.split(',')
    parts[parts.length-1] = " " + s // replace last typed
    const newVal = parts.join(',').replace(/^,/, '') 
    update('genres', newVal)
    setSuggestions([])
  }

  // ✅ fetch data
  useEffect(()=>{
    let active = true
    setLoading(true)

    const qs = Object.entries(params)
      .filter(([_,v])=>String(v??'').length>0)
      .map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')

    fetch(`${API_BASE}/api/recommendations?${qs}`)
      .then(r=>r.json())
      .then(d=>{
        if(!active) return
        if(d && d.length > 0){
          setItems(d)                 // update only if results exist
          if(defaultItems.length === 0) setDefaultItems(d) // keep first load
        }
        setLoading(false)
      })
      .catch(()=>{
        if(active) setLoading(false)
      })

    return ()=>{ active = false }
  }, [params, API_BASE])

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 h-max sticky top-20">
        <div className="text-lg font-semibold mb-3">Filters</div>
        <div className="space-y-3">
          {/* Genres with suggestions */}
          <div className="relative">
            <label className="text-xs text-slate-400">Genres (comma separated)</label>
            <input className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
              value={params.genres} 
              onChange={handleGenreChange}
              placeholder="Action, Comedy" />
            
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-slate-800 w-full mt-1 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
                {suggestions.map(s => (
                  <li key={s}
                      className="p-2 cursor-pointer hover:bg-slate-700"
                      onClick={()=>pickSuggestion(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Format */}
          <div>
            <label className="text-xs text-slate-400">Format</label>
            <select className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
              value={params.format} onChange={e=>update('format', e.target.value)}>
              <option value="">Any</option>
              {formats.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-slate-400">Status</label>
            <select className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
              value={params.status} onChange={e=>update('status', e.target.value)}>
              <option value="">Any</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Season + Year */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Season</label>
              <select className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
                value={params.season} onChange={e=>update('season', e.target.value)}>
                <option value="">Any</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Year</label>
              <input type="number" className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
                value={params.year} onChange={e=>update('year', e.target.value)} placeholder="2021" />
            </div>
          </div>

          {/* Score range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Min Score</label>
              <input type="number" className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
                value={params.minScore} onChange={e=>update('minScore', e.target.value)} placeholder="60" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Max Score</label>
              <input type="number" className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
                value={params.maxScore} onChange={e=>update('maxScore', e.target.value)} placeholder="100" />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs text-slate-400">Sort</label>
            <select className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
              value={params.sort} onChange={e=>update('sort', e.target.value)}>
              <option value="POPULARITY_DESC">Popularity ↓</option>
              <option value="SCORE_DESC">Score ↓</option>
              <option value="TRENDING_DESC">Trending ↓</option>
              <option value="FAVOURITES_DESC">Favourites ↓</option>
              <option value="START_DATE_DESC">Newer → Older</option>
              <option value="START_DATE">Older → Newer</option>
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="text-xs text-slate-400">Platform (optional)</label>
            <select className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
              value={params.platform} onChange={e=>update('platform', e.target.value)}>
              <option value="">Any</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Reset */}
          <button className="w-full mt-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            onClick={()=>setParams({genres:'',format:'',status:'',season:'',year:'',minScore:'',maxScore:'',sort:'POPULARITY_DESC',platform:''})}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Anime grid */}
      <div>
        {loading && <div className="text-slate-400 mb-2">Loading recommendations…</div>}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(items.length > 0 ? items : defaultItems).map(it => (
            <AnimeCard key={it.id} item={it} />
          ))}
        </div>
      </div>
    </div>
  )
}
