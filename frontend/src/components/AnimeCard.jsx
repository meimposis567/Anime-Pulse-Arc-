import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AnimeCard({ item }){
  const navigate = useNavigate()
  const title = item?.title?.english || item?.title?.romaji || 'Untitled'
  return (
    <div className="card otaku-tilt cursor-pointer relative" style={{contentVisibility:"auto", containIntrinsicSize:"300px 400px"}} onClick={() => navigate(`/anime/${item.id}`)}>
      <img src={item?.coverImage?.large} alt={title} className="w-full aspect-[3/4] object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      <div className="p-3">
        <div className="text-sm text-slate-300 line-clamp-2">{title}</div>
        {item?.averageScore ? <div className="text-xs text-slate-400 mt-1">Score: {item.averageScore}</div> : null}
        {item?.seasonYear ? <div className="text-xs text-slate-500">{item.season} {item.seasonYear}</div> : null}
      </div>
      <span className="shine rounded-2xl"></span>
    </div>
  )
}
