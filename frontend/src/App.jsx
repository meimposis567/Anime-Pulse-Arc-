import React, { Suspense, useMemo } from 'react'
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home as HomeIcon, Sparkles, Github } from 'lucide-react'

const Home = React.lazy(() => import('./pages/Home.jsx'))
const Recommendation = React.lazy(() => import('./pages/Recommendation.jsx'))
const AnimeGuide = React.lazy(() => import('./pages/AnimeGuide.jsx'))

import logo from './assets/logo.png'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001'
export const ApiContext = React.createContext(API_BASE)

/* ─────────────────── Animated background ───────────────────
   Rendered once, fixed behind everything, never re-renders. */
const ArcBackground = React.memo(function ArcBackground() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 7.3 + 4) % 100}%`,
        duration: `${11 + (i % 5) * 3}s`,
        delay: `${-(i * 1.7) % 18}s`,
        scale: 0.5 + ((i % 4) * 0.22),
        hue: i % 3 === 0 ? 'rgba(95,240,255,.75)' : undefined,
      })),
    []
  )

  return (
    <div className="arc-bg" aria-hidden="true">
      <div className="arc-orb arc-orb--1" />
      <div className="arc-orb arc-orb--2" />
      <div className="arc-orb arc-orb--3" />
      <div className="arc-grid" />
      <div className="arc-tone" />
      <div className="arc-stars" />
      <div className="arc-petals">
        {petals.map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
              transform: `scale(${p.scale})`,
              ...(p.hue ? { background: `linear-gradient(135deg, ${p.hue}, transparent)` } : null),
            }}
          />
        ))}
      </div>
    </div>
  )
})

/* ─────────────────────────── Navbar ─────────────────────────── */
const LINKS = [
  { to: '/', label: 'Home', jp: 'ホーム', icon: HomeIcon, end: true },
  { to: '/recommendation', label: 'Discover', jp: '発見', icon: Sparkles, end: false },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <nav className="border-b border-white/[0.07] bg-[#05030f]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-3" aria-label="Anime Pulse ARC home">
            <span className="relative grid h-11 w-11 place-items-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/30 via-fuchsia-500/30 to-pink-500/30 blur-md transition-all duration-500 group-hover:blur-lg" />
              <span className="absolute inset-0 rounded-full border border-cyan-300/25 animate-spin-slow" />
              <img
                src={logo}
                alt=""
                className="relative h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,.75)]"
              />
            </span>
            {/* Hidden below sm: at 390px the wordmark wrapped to three lines
                and pushed the navbar to 99px tall. The logo still carries the
                brand there, and the hero repeats the name immediately below. */}
            <span className="hidden leading-none sm:block">
              <span className="arc-title block whitespace-nowrap font-display text-[1.15rem] font-bold tracking-wide">
                ANIME PULSE ARC
              </span>
              <span className="mt-0.5 hidden text-[9px] tracking-[0.42em] text-slate-500 md:block">
                アニメ・パルス・アーク
              </span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-5 sm:gap-7">
            {LINKS.map(({ to, label, jp, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="group/nav">
                {({ isActive }) => (
                  <span
                    data-active={isActive}
                    className={`arc-navlink flex items-center gap-1.5 font-display text-sm font-semibold tracking-wide ${
                      isActive
                        ? 'text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,.65)]'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={15} className="transition-transform duration-300 group-hover/nav:scale-110" />
                    <span>{label}</span>
                    <span className="hidden text-[9px] tracking-widest text-slate-600 sm:inline">{jp}</span>
                  </span>
                )}
              </NavLink>
            ))}
            <a
              href="https://github.com/meimposis567/Anime-Pulse-Arc-"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 transition-colors duration-300 hover:text-pink-300"
              aria-label="View source on GitHub"
            >
              <Github size={17} />
            </a>
          </div>
        </div>
      </nav>
      {/* Glowing hairline under the bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
    </header>
  )
}

/* ─────────────────────── Page transitions ─────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } },
}

function Page({ children }) {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.main>
  )
}

function RouteFallback() {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-16 text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
      Loading…
    </div>
  )
}

/* ───────────────────────────── Footer ───────────────────────────── */
function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.07] bg-[#05030f]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <div className="arc-title font-display text-sm font-bold tracking-[0.3em]">
          ANIME PULSE ARC
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Data from{' '}
          <a href="https://anilist.co" target="_blank" rel="noreferrer" className="text-cyan-400/80 hover:text-cyan-300">
            AniList
          </a>
          . Titles and artwork belong to their creators, studios and licensors.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          © 2025 Anime Pulse ARC team — all rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ────────────────────────────── App ────────────────────────────── */
export default function App() {
  const location = useLocation()

  return (
    <ApiContext.Provider value={API_BASE}>
      <ArcBackground />
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/recommendation" element={<Page><Recommendation /></Page>} />
            <Route path="/anime/:id" element={<Page><AnimeGuide /></Page>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <Footer />
    </ApiContext.Provider>
  )
}
