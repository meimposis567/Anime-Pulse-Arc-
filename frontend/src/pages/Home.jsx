import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Flame, Compass } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import FeaturedGrid from '../components/FeaturedGrid.jsx'

const TICKER = [
  '今期のアニメ', 'TRENDING NOW', '新作', 'CRUNCHYROLL', 'ネトフリ', 'NETFLIX',
  'SEASONAL PICKS', 'アニメガイド', 'PRIME VIDEO', 'HIDIVE', '見る順番', 'WATCH ORDER',
]

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-4 pt-10 sm:pt-14">
      <div className="arc-speedlines" aria-hidden="true" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Title */}
        <h1 className="font-display text-[2.6rem] font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="arc-title arc-glitch" data-text="ANIME PULSE">ANIME PULSE</span>
          <br />
          <span className="relative inline-block">
            <span className="arc-title">ARC</span>
            <Sparkles
              size={22}
              className="absolute -right-8 -top-1 animate-float text-pink-400 drop-shadow-[0_0_10px_rgba(255,61,143,.8)]"
            />
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Thousands of titles, one pulse. Search, filter by genre, season, score and
          streaming platform — and find your next arc in seconds.
        </p>

        {/* Quick actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/recommendation" className="arc-btn font-display text-sm">
            <Compass size={15} />
            Start Discovering
          </Link>
          <a href="#featured" className="arc-btn font-display text-sm !border-pink-400/50 !bg-pink-500/10">
            <Flame size={15} className="text-pink-300" />
            What's Trending
          </a>
        </div>
      </div>

      {/* Scrolling Japanese/English ticker */}
      <div className="arc-marquee mt-12 border-y border-white/[0.06] py-2.5">
        <div>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span
              key={i}
              className="mx-6 font-display text-[11px] font-semibold tracking-[0.3em] text-slate-400/70"
            >
              {t}
              <span className="ml-6 text-cyan-400/60">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl space-y-14 px-4 pb-10 pt-10">
        {/* Search */}
        <section className="arc-glass arc-ring rounded-3xl p-5 sm:p-6">
          <SearchBar />
        </section>

        {/* Featured */}
        <section id="featured" className="section scroll-mt-24">
          <div className="mb-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 font-display text-[10px] font-semibold tracking-[0.4em] text-pink-400/80">
                  人気作品
                </div>
                <h2 className="arc-title font-display text-2xl font-bold tracking-wide sm:text-3xl">
                  Featured &amp; Trending
                </h2>
              </div>
              <Link
                to="/recommendation"
                className="hidden shrink-0 font-display text-xs font-semibold tracking-widest text-slate-300 transition-colors hover:text-cyan-300 sm:block"
              >
                FILTER ALL →
              </Link>
            </div>
            <div className="arc-rule mt-3" />
          </div>
          <FeaturedGrid />
        </section>
      </div>
    </div>
  )
}
