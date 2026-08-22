import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'

/**
 * Anime-style cold open.
 *
 * Beats: charge-up rays → logo impact + shockwave → title letters land →
 * kana subtitle → a blade slash cuts the screen and the two halves slide
 * apart to reveal the app.
 *
 * Shown once per browser session, skippable with any key or click, and
 * bypassed entirely for prefers-reduced-motion.
 */

const SESSION_KEY = 'apa:intro:v1'
const TITLE = 'ANIME PULSE ARC'

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useIntro() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    if (prefersReducedMotion()) return false
    try { return sessionStorage.getItem(SESSION_KEY) !== '1' } catch { return true }
  })

  const dismiss = useCallback(() => {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* private mode */ }
    setShow(false)
  }, [])

  return [show, dismiss]
}

export default function ArcIntro({ onDone }) {
  const [phase, setPhase] = useState('run') // run → cut → gone

  // Lock scrolling while the overlay is up.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Auto-advance to the slash, then finish.
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('cut'), 2150)
    const t2 = setTimeout(() => onDone?.(), 3050)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  // Any key or click skips straight to the end.
  const skip = useCallback(() => { setPhase('cut'); setTimeout(() => onDone?.(), 620) }, [onDone])
  useEffect(() => {
    window.addEventListener('keydown', skip, { once: true })
    return () => window.removeEventListener('keydown', skip)
  }, [skip])

  const cutting = phase === 'cut'

  return (
    <motion.div
      className="arc-intro"
      onClick={skip}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      role="presentation"
    >
      {/* ── Two halves of the curtain, split on a diagonal ── */}
      <motion.div
        className="arc-intro__panel arc-intro__panel--top"
        animate={cutting ? { y: '-105%', x: '-4%' } : { y: 0, x: 0 }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="arc-intro__panel arc-intro__panel--bottom"
        animate={cutting ? { y: '105%', x: '4%' } : { y: 0, x: 0 }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ── Stage content ── */}
      <motion.div
        className="arc-intro__stage"
        animate={cutting ? { opacity: 0, scale: 1.12 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeIn' }}
      >
        {/* Charging rays */}
        <motion.div
          className="arc-intro__rays"
          initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ opacity: [0, 0.9, 0.45], scale: [0.4, 1.5, 1.15], rotate: 42 }}
          transition={{ duration: 2.1, ease: 'easeOut' }}
        />

        {/* Shockwave rings on logo impact */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="arc-intro__ring"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.75, 0], scale: [0.2, 2.6] }}
            transition={{ duration: 1.5, delay: 0.42 + i * 0.16, ease: 'easeOut' }}
          />
        ))}

        {/* Logo impact */}
        <motion.img
          src={logo}
          alt=""
          className="arc-intro__logo"
          initial={{ opacity: 0, scale: 2.4, rotate: -25, filter: 'blur(14px)' }}
          animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />

        {/* Title, letter by letter */}
        <div className="arc-intro__title" aria-label={TITLE}>
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={i}
              className={ch === ' ' ? 'arc-intro__space' : 'arc-intro__char'}
              initial={{ opacity: 0, y: 34, rotateX: -85 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: 0.72 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </div>

        {/* Kana subtitle */}
        <motion.div
          className="arc-intro__kana"
          initial={{ opacity: 0, letterSpacing: '1.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ duration: 0.9, delay: 1.45, ease: 'easeOut' }}
        >
          アニメ・パルス・アーク
        </motion.div>

        <motion.div
          className="arc-intro__hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.9, duration: 0.5 }}
        >
          press any key to skip
        </motion.div>
      </motion.div>

      {/* ── The blade slash ── */}
      <motion.div
        className="arc-intro__slash"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={cutting ? { scaleX: 1, opacity: [0, 1, 1, 0] } : {}}
        transition={{ duration: 0.55, ease: [0.85, 0, 0.15, 1] }}
      />
    </motion.div>
  )
}

export function ArcIntroGate({ children }) {
  const [show, dismiss] = useIntro()
  return (
    <>
      <AnimatePresence>{show && <ArcIntro key="intro" onDone={dismiss} />}</AnimatePresence>
      {children}
    </>
  )
}
