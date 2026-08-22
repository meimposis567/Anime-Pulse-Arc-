import React from 'react'
import { Compass } from 'lucide-react'
import RecommendationFilters from '../components/RecommendationFilters.jsx'

export default function Recommendation() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-10">
      <header className="mb-8">
        <div className="mb-1.5 flex items-center gap-2">
          <Compass size={14} className="text-pink-400" />
          <span className="font-display text-[10px] font-semibold tracking-[0.4em] text-pink-400/80">
            発見する
          </span>
        </div>
        <h1 className="arc-title font-display text-3xl font-bold tracking-wide sm:text-4xl">
          Discover Your Next Arc
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Stack filters to narrow thousands of titles down to the handful worth your evening.
          Everything is matched server-side, including which platform actually streams it.
        </p>
        <div className="arc-rule mt-4" />
      </header>

      <RecommendationFilters />
    </div>
  )
}
