import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiContext } from '../App.jsx'

export default function AnimeGuide(){
  const { id } = useParams()
  const navigate = useNavigate()
  const API_BASE = useContext(ApiContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancel=false
    setLoading(true)
    fetch(`${API_BASE}/api/anime/${id}`).then(r=>r.json()).then(d=>{
      if(!cancel){ setData(d); setLoading(false) }
    }).catch(()=>setLoading(false))
    return ()=>{ cancel=true }
  }, [id, API_BASE])

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-6 text-slate-400">Loading…</div>
  if (!data) return <div className="max-w-7xl mx-auto px-4 py-6 text-slate-400">Not found</div>

  const watchEdges = (data.relations?.edges||[]).filter(e=>['PREQUEL','SEQUEL','SIDE_STORY','ALTERNATIVE'].includes(e.relationType))

  return (
    <div className="min-h-screen">
      {data.bannerImage ? <div className="w-full h-52 md:h-72 bg-center bg-cover" style={{backgroundImage:`url(${data.bannerImage})`}} /> : null}
      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <div>
          <img src={data.coverImage?.extraLarge || data.coverImage?.large} alt={data.title?.romaji} className="w-full rounded-2xl shadow-lg" />
          <div className="mt-3 text-sm text-slate-400 space-y-1">
            {data.format ? <div>Format: {data.format}</div> : null}
            {data.status ? <div>Status: {data.status}</div> : null}
            {data.episodes ? <div>Episodes: {data.episodes}</div> : null}
            {data.duration ? <div>Duration: {data.duration} min</div> : null}
            {data.seasonYear ? <div>Season: {data.season} {data.seasonYear}</div> : null}
            {Array.isArray(data.genres)&&data.genres.length? <div>Genres: {data.genres.join(', ')}</div> : null}
            {data.studios?.nodes?.length ? <div>Studio: {data.studios.nodes.map(s=>s.name).join(', ')}</div> : null}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">{data.title?.english || data.title?.romaji}</h1>
            {data.averageScore ? <div className="text-slate-400 text-sm mt-1">Average Score: {data.averageScore}</div> : null}
            {data.description ? <p className="mt-3 text-slate-200 leading-relaxed">{data.description.replace(/<[^>]+>/g,'')}</p> : null}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Streaming</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.streamingEpisodes||[]).map(ep => (
                <a key={ep.url} href={ep.url} target="_blank" rel="noreferrer" className="card p-3 flex gap-3">
                  <img src={ep.thumbnail} alt={ep.title} className="w-24 h-16 object-cover rounded-lg" />
                  <div>
                    <div className="font-medium">{ep.title}</div>
                    <div className="text-xs text-slate-400">{ep.site}</div>
                  </div>
                </a>
              ))}
              {(!data.streamingEpisodes || data.streamingEpisodes.length===0) ? <div className="text-slate-400">No streaming episodes listed.</div> : null}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Cast</h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {(data.characters?.edges||[]).map(edge => (
                <div key={edge.node.id} className="card p-3">
                  <img src={edge.node.image?.large} alt={edge.node.name?.full} className="w-full aspect-[3/4] object-cover rounded-lg" />
                  <div className="mt-2 text-sm">
                    <div className="font-medium">{edge.node.name?.full}</div>
                    {edge.voiceActors?.[0]?.name?.full ? <div className="text-xs text-slate-400">VA: {edge.voiceActors[0].name.full}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Watch Order</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {watchEdges.length ? watchEdges.map(e => (
                <div key={e.node.id} className="card cursor-pointer" onClick={()=>navigate(`/anime/${e.node.id}`)}>
                  <img src={e.node.coverImage?.large} className="w-full aspect-[3/4] object-cover" />
                  <div className="p-3">
                    <div className="text-xs text-slate-400">{e.relationType.replace('_',' ')}</div>
                    <div className="text-sm">{e.node.title?.english || e.node.title?.romaji}</div>
                  </div>
                </div>
              )) : <div className="text-slate-400">No explicit watch order available.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
