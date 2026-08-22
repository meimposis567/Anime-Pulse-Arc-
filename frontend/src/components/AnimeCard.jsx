import React, { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Play } from 'lucide-react'

/** AniList scores are 0–100; colour the ring by tier. */
function ringColor(score) {
  if (score >= 80) return 'var(--cyber)'
  if (score >= 65) return 'var(--arcane)'
  if (score >= 50) return 'var(--ember)'
  return 'var(--sakura-hot)'
}

const FORMAT_LABEL = {
  TV: 'TV', TV_SHORT: 'SHORT', MOVIE: 'FILM',
  SPECIAL: 'SP', OVA: 'OVA', ONA: 'ONA', MUSIC: 'MV',
}

export default function AnimeCard({ item, index = 0 }) {
  const navigate = useNavigate()
  const ref = useRef(null)
  const raf = useRef(0)

  const title = item?.title?.english || item?.title?.romaji || 'Untitled'
  const native = item?.title?.native
  const score = item?.averageScore
  const genres = (item?.genres || []).slice(0, 2)

  /* Pointer-tracked 3D tilt. Throttled to one transform write per frame so
     a grid of 36 cards stays smooth. */
  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.transform =
        `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-8px) scale(1.02)`
    })
  }, [])

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current)
    const el = ref.current
    if (el) el.style.transform = ''
  }, [])

  const open = () => navigate(`/anime/${item.id}`)

  return (
    <article
      ref={ref}
      className="arc-card arc-bracket group cursor-pointer animate-fade-up"
      style={{
        animationDelay: `${Math.min(index, 12) * 45}ms`,
        contentVisibility: 'auto',
        containIntrinsicSize: '320px 440px',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${title}`}
    >
      {/* Poster */}
      <div className="relative overflow-hidden">
        <img
          src={item?.coverImage?.large}
          alt={title}
          className="arc-poster w-full aspect-[3/4] object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Legibility gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04030c] via-[#04030c]/25 to-transparent" />

        {/* Holographic sweep */}
        <span className="arc-holo" aria-hidden="true" />

        {/* Format tag */}
        {item?.format && (
          <span className="absolute left-2.5 top-2.5 rounded-md border border-white/15 bg-black/55 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-cyan-200 backdrop-blur-sm">
            {FORMAT_LABEL[item.format] || item.format}
          </span>
        )}

        {/* Score ring */}
        {score ? (
          <div className="absolute right-2.5 top-2.5">
            <div
              className="arc-score text-[11px] font-bold"
              style={{ '--pct': score, '--ring-color': ringColor(score) }}
              aria-label={`Score ${score} out of 100`}
            >
              <span>{score}</span>
            </div>
          </div>
        ) : null}

        {/* Play affordance on hover */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-cyan-300/60 bg-black/45 shadow-neon backdrop-blur-sm">
            <Play size={18} className="translate-x-[1px] text-cyan-200" fill="currentColor" />
          </span>
        </div>

        {/* Slide-up detail panel */}
        <div className="arc-reveal absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04030c] via-[#06041a]/95 to-transparent px-3 pb-3 pt-6">
          {native && (
            <div className="mb-1 truncate text-[10px] tracking-wide text-slate-400">{native}</div>
          )}
          <div className="flex flex-wrap gap-1">
            {genres.map((g) => (
              <span key={g} className="arc-pill !py-[1px] !text-[9px]">{g}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="relative p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100 transition-colors duration-300 group-hover:text-cyan-200">
          {title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
          {item?.seasonYear && (
            <span className="capitalize">
              {item.season ? item.season.toLowerCase() : ''} {item.seasonYear}
            </span>
          )}
          {score ? (
            <span className="ml-auto inline-flex items-center gap-1 text-amber-300/90">
              <Star size={11} fill="currentColor" />
              {(score / 10).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
