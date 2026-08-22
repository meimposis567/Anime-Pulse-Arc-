import React from 'react'

export default function SkeletonCard({ index = 0 }) {
  return (
    <div
      className="arc-card animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      aria-hidden="true"
    >
      <div className="arc-skeleton aspect-[3/4] w-full" />
      <div className="space-y-2 p-3">
        <div className="arc-skeleton h-3.5 rounded" />
        <div className="arc-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

/** A full grid of shimmering placeholders, matching the real card grid. */
export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} index={i} />)}
    </div>
  )
}
